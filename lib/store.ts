import { create } from "zustand";
import { Transaction, Budget } from "@/types/transaction";
import { createClient } from "@/lib/supabase/client";

interface TransactionStore {
  transactions: Transaction[];
  budgets: Budget[];
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
}

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  budgets: [],
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

  // Budget Actions Implementation
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
}));
