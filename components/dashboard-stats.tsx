"use client";

import { useMemo, useEffect, useState } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

interface ExchangeRates {
    USD: number;
    EUR: number;
}

export function DashboardStats() {
    const transactions = useTransactionStore((state) => state.transactions);
    const [rates, setRates] = useState<ExchangeRates | null>(null);

    useEffect(() => {
        fetch('https://api.frankfurter.app/latest?from=TRY&to=USD,EUR')
            .then(resp => resp.json())
            .then(data => {
                if (data && data.rates) {
                    setRates(data.rates);
                }
            })
            .catch(err => console.error("Döviz kuru alınamadı:", err));
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        // En çok harcanan kategori
        const categoryMap: Record<string, number> = {};
        currentMonthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
            });

        const topCategory = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])[0];

        // Ortalama Günlük Harcama (Sadece bugüne kadar olan günler)
        const daysPassed = now.getDate() || 1;
        const dailyAverage = expense / daysPassed;

        return {
            income,
            expense,
            topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
            dailyAverage
        };
    }, [transactions]);

    const formatCurrency = (amount: number, currency: string) => {
        return amount.toLocaleString("tr-TR", { style: "currency", currency: currency });
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bu Ay Toplam Gelir</CardTitle>
                    <Wallet className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.income.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    {rates && (
                        <p className="text-xs text-muted-foreground mt-1">
                            ≈ {formatCurrency(stats.income * rates.USD, 'USD')} / {formatCurrency(stats.income * rates.EUR, 'EUR')}
                        </p>
                    )}
                    {!rates && <p className="text-xs text-muted-foreground mt-1">Döviz yükleniyor...</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bu Ay Toplam Gider</CardTitle>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.expense.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    {rates && (
                        <p className="text-xs text-muted-foreground mt-1">
                            ≈ {formatCurrency(stats.expense * rates.USD, 'USD')} / {formatCurrency(stats.expense * rates.EUR, 'EUR')}
                        </p>
                    )}
                    {!rates && <p className="text-xs text-muted-foreground mt-1">Döviz yükleniyor...</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En Çok Harcanan</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.topCategory ? stats.topCategory.name : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.topCategory
                            ? `${stats.topCategory.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} harcama`
                            : "Veri yok"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Günlük Ort. Harcama</CardTitle>
                    <ArrowDown className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.dailyAverage.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    <p className="text-xs text-muted-foreground">Bu ay için ortalama</p>
                </CardContent>
            </Card>
        </div>
    );
}
