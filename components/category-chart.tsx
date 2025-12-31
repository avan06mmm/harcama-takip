"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CategorySummary } from "@/types/transaction";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7300",
];

export function CategoryChart() {
  const transactions = useTransactionStore((state) => state.transactions);

  const expenseCategories = useMemo((): CategorySummary[] => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (expenseCategories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gider Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseCategories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) =>
                `${props.category} (%${props.percentage.toFixed(0)})`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {expenseCategories.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined
                  ? new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(value)
                  : ""
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
