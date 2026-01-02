"use client";

import { useMemo, useEffect, useState } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

interface ExchangeRates {
    USD: number;
    EUR: number;
}

export function DashboardStats() {
    const transactions = useTransactionStore((state) => state.transactions);
    const [mounted, setMounted] = useState(false);
    const [rates, setRates] = useState<ExchangeRates | null>(null);

    useEffect(() => {
        setMounted(true);
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
        if (!mounted) return { income: 0, expense: 0, topCategory: null, dailyAverage: 0 }; // Server side safe return

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
    }, [transactions, mounted]);

    const formatCurrency = (amount: number, currency: string) => {
        return amount.toLocaleString("tr-TR", { style: "currency", currency: currency });
    };

    if (!mounted) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-1" />
                            <Skeleton className="h-3 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Bu Ay Toplam Gelir</CardTitle>
                    <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <Wallet className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-tight">
                        {stats.income.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    {rates ? (
                        <p className="text-[11px] font-medium text-muted-foreground mt-2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            ≈ {formatCurrency(stats.income * rates.USD, 'USD')} / {formatCurrency(stats.income * rates.EUR, 'EUR')}
                        </p>
                    ) : (
                        <Skeleton className="h-3 w-32 mt-2" />
                    )}
                </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Bu Ay Toplam Gider</CardTitle>
                    <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-tight">
                        {stats.expense.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    {rates ? (
                        <p className="text-[11px] font-medium text-muted-foreground mt-2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            ≈ {formatCurrency(stats.expense * rates.USD, 'USD')} / {formatCurrency(stats.expense * rates.EUR, 'EUR')}
                        </p>
                    ) : (
                        <Skeleton className="h-3 w-32 mt-2" />
                    )}
                </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">En Çok Harcanan</CardTitle>
                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-2xl font-bold truncate group-hover:text-blue-500 transition-colors">
                        {stats.topCategory ? stats.topCategory.name : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.topCategory
                            ? `${stats.topCategory.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} harcama`
                            : "Veri yok"}
                    </p>
                </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Günlük Ort. Harcama</CardTitle>
                    <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        <ArrowDown className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="text-3xl font-bold tracking-tight">
                        {stats.dailyAverage.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Bu ay için ortalama</p>
                </CardContent>
            </Card>
        </div>
    );

}
