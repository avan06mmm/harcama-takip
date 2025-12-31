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
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Toplam Gelir
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Toplam Gider
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <ArrowDownRight className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mevcut Bakiye
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.balance >= 0
                    ? "text-primary"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
