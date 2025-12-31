import { create } from "zustand";
import { Transaction, Budget, RecurringTransaction } from "@/types/transaction";
import { createClient } from "@/lib/supabase/client";
import { addMonths, isBefore, parseISO } from "date-fns";

interface TransactionStore {
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;

  // Budget Actions
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, "id" | "user_id">) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Recurring Actions
  fetchRecurringTransactions: () => Promise<void>;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, "id" | "user_id" | "is_active" | "next_run_date">) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  checkAndProcessRecurring: () => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  budgets: [],
  recurringTransactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false, transactions: [] });
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      set({ transactions: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addTransaction: async (transaction) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Kullanıcı girişi gerekli");
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          ...transaction,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      set((state) => ({
        transactions: [data, ...state.transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteTransaction: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTransaction: async (id, updatedTransaction) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update(updatedTransaction)
        .eq("id", id);

      if (error) {
        throw error;
      }

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updatedTransaction } : t
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setTransactions: (transactions) => {
    set({ transactions });
  },

  // Budget Actions
  fetchBudgets: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      set({ budgets: data || [] });
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
    }
  },

  addBudget: async (budget) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Giriş yapmalısınız");

      const { data, error } = await supabase
        .from("budgets")
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        budgets: [...state.budgets, data],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteBudget: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Recurring Transactions Actions
  fetchRecurringTransactions: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true); // Only active ones

      if (error) throw error;
      set({ recurringTransactions: data || [] });
    } catch (error: any) {
      console.error("Error fetching recurring:", error);
    }
  },

  addRecurringTransaction: async (recurring) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Giriş gerekli");

      // Varsayılan olarak bir sonraki ayın bugünü
      const nextRun = addMonths(new Date(), 1).toISOString();

      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert([{
          ...recurring,
          user_id: user.id,
          next_run_date: nextRun,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        recurringTransactions: [...state.recurringTransactions, data]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteRecurringTransaction: async (id) => {
    try {
      const supabase = createClient();
      // Soft delete (is_active = false) da yapılabilir ama şimdilik hard delete yapalım
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  checkAndProcessRecurring: async () => {
    // Bu fonksiyon uygulama açılışında çalışacak
    // Vadesi gelmiş (next_run_date <= now) işlemleri bulup 'transactions' tablosuna ekleyecek
    // ve 'next_run_date'i bir ay ileri atacak.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: recurrents, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error || !recurrents) return;

    const now = new Date();

    for (const rec of recurrents) {
      const nextRun = parseISO(rec.next_run_date);

      if (isBefore(nextRun, now)) {
        // 1. Transaction Ekle
        const { error: transError } = await supabase.from("transactions").insert({
          user_id: rec.user_id,
          type: 'expense', // Şimdilik sadece gider olarak varsayıyoruz
          amount: rec.amount,
          category: rec.category,
          date: now.toISOString().split("T")[0], // Bugünü işlem tarihi yap
          note: `Otomatik: ${rec.description || rec.category}`
        });

        if (!transError) {
          // 2. Bir sonraki tarihi güncelle
          const nextDate = addMonths(nextRun, 1).toISOString();

          await supabase
            .from("recurring_transactions")
            .update({
              last_processed_date: now.toISOString(),
              next_run_date: nextDate
            })
            .eq("id", rec.id);

          // Storeu güncellememize gerek yok, fetchTransactions çağrılınca gelecek
        }
      }
    }
  }

}));
