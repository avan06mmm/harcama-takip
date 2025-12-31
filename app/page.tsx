"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BalanceSummary } from "@/components/balance-summary";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { CategoryChart } from "@/components/category-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { AiAdvisor } from "@/components/ai-advisor";
import { Download, FileDown, LogOut } from "lucide-react";
import { useTransactionStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { DashboardStats } from "@/components/dashboard-stats";
import { MonthlyTrendChart } from "@/components/monthly-trend-chart";
import { RecurringExpenses } from "@/components/recurring-expenses";
import { BudgetPlanner } from "@/components/budget-planner";

export default function Home() {
  const { transactions, fetchTransactions, setTransactions } = useTransactionStore();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        fetchTransactions();
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchTransactions();
        } else {
          setTransactions([]);
        }
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["ID", "Tür", "Tutar", "Kategori", "Tarih", "Not"];
    const rows = transactions.map((t) => [
      t.id,
      t.type === "income" ? "Gelir" : "Gider",
      t.amount.toString(),
      t.category,
      t.date,
      t.note,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `harcamalar-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={transactions.length === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                CSV Dışa Aktar
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <BalanceSummary />
          <DashboardStats />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AiAdvisor transactions={transactions} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">İşlemler</h2>
                </div>
                <div className="space-y-4">
                  <TransactionForm />
                  <TransactionList />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <MonthlyTrendChart />
                <RecurringExpenses />
              </div>
            </div>

            <div className="space-y-6">
              <CategoryChart />
              <BudgetPlanner />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Harcama Takip V.2.0 - Mustafa Avan</p>
        </div>
      </footer>
    </div>
  );
}
