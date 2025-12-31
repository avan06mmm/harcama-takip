"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";

export function MonthlyTrendChart() {
    const transactions = useTransactionStore((state) => state.transactions);

    const data = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        // Ayın başından bugüne kadar olan günleri al
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            // O güne ait giderleri topla
            const dailyExpense = transactions
                .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), day))
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                date: day,
                label: format(day, 'd MMM', { locale: tr }),
                amount: dailyExpense
            };
        });
    }, [transactions]);

    // Sadece veri varsa render et, yoksa boş state gösterme (grafik boş görünmesin diye)
    const hasData = transactions.some(t => t.type === 'expense');

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Aylık Harcama Trendi</CardTitle>
                <p className="text-sm text-muted-foreground">Bu ayın gün bazlı harcama değişimi</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₺${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        borderColor: "var(--border)",
                                        borderRadius: "8px"
                                    }}
                                    formatter={(value: any) => [
                                        value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }),
                                        "Harcama"
                                    ]}
                                    labelStyle={{ color: "var(--foreground)" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Henüz harcama verisi yok.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
