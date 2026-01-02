"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BalanceSummary } from "@/components/balance-summary";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { CategoryChart } from "@/components/category-chart";
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

  const exportToPDF = () => {
    if (transactions.length === 0) return;

    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();

        // Başlık
        doc.setFontSize(18);
        doc.text("Harcama Takip - Aylik Rapor", 14, 22);

        doc.setFontSize(11);
        doc.text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`, 14, 30);

        const tableColumn = ["Tur", "Tutar", "Kategori", "Tarih", "Not"];
        const tableRows = transactions.map(t => [
          t.type === "income" ? "Gelir" : "Gider",
          `${t.amount} TL`,
          t.category,
          new Date(t.date).toLocaleDateString("tr-TR"),
          t.note
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
        });

        doc.save(`harcama-raporu-${new Date().toISOString().split("T")[0]}.pdf`);
      });
    });
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Visual background accents */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={transactions.length === 0}
                  className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={transactions.length === 0}
                  className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
              <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BalanceSummary />
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <DashboardStats />
          </section>

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
