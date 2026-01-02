"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export function BalanceSummary() {
  const transactions = useTransactionStore((state) => state.transactions);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Toplam Gelir
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-500 tracking-tight transition-transform group-hover:scale-105 origin-left">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 group-hover:rotate-12 transition-transform">
              <ArrowUpRight className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Toplam Gider
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-500 tracking-tight transition-transform group-hover:scale-105 origin-left">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 group-hover:-rotate-12 transition-transform">
              <ArrowDownRight className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary shadow-lg ring-1 ring-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Mevcut Bakiye
              </p>
              <p
                className={`mt-2 text-3xl font-bold tracking-tight transition-transform group-hover:scale-105 origin-left ${summary.balance >= 0
                    ? "text-primary"
                    : "text-red-600 dark:text-red-500"
                  }`}
              >
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  );
}
