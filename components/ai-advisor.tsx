"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface AiAdvisorProps {
    transactions: Transaction[];
}

export function AiAdvisor({ transactions }: AiAdvisorProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [type, setType] = useState<"warning" | "success" | "neutral">("neutral");

    useEffect(() => {
        if (transactions.length === 0) {
            setInsight("Henüz veri yok. Gelir ve gider ekledikçe size finansal ipuçları verebilirim.");
            setType("neutral");
            return;
        }

        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + t.amount, 0);

        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

        // Kategori bazlı analiz
        const categories: Record<string, number> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });

        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

        // Mantıksal Çıkarımlar
        let message = "";
        let messageType: "warning" | "success" | "neutral" = "neutral";

        if (income === 0) {
            message = "Dikkat! Hiç gelir kaydınız bulunmuyor. Finansal dengenizi kurmak için önce gelirlerinizi ekleyin.";
            messageType = "warning";
        } else if (expense > income) {
            message = `Harcamalarınız gelirinizden ${Math.abs(balance).toLocaleString("tr-TR")} TL daha fazla. "${topCategory?.[0]}" kategorisindeki harcamalarınızı gözden geçirebilirsiniz.`;
            messageType = "warning";
        } else if (savingsRate < 10) {
            message = `Tasarruf oranınız düşük (%${savingsRate.toFixed(1)}). "${topCategory?.[0]}" harcamalarını biraz kısarak birikim yapabilirsiniz.`;
            messageType = "neutral";
        } else if (savingsRate >= 10 && savingsRate < 30) {
            message = `İyi gidiyorsunuz! Gelirinizin %${savingsRate.toFixed(1)}'ini koruyabiliyorsunuz.`;
            messageType = "success";
        } else {
            message = `Müthiş! Gelirinizin %${savingsRate.toFixed(1)} kısmını biriktiriyorsunuz.`;
            messageType = "success";
        }

        setInsight(message);
        setType(messageType);

    }, [transactions]);

    if (!insight) return null;

    return (
        <Card className={`border shadow-sm mb-6 ${type === 'warning' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20' :
            type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20' :
                'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/20'
            }`}>
            <CardContent className="p-4 flex items-start gap-3">
                {type === 'warning' && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                {type === 'success' && <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />}
                {type === 'neutral' && <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
                <p className={`text-sm font-medium leading-relaxed ${type === 'warning' ? 'text-red-800 dark:text-red-300' :
                    type === 'success' ? 'text-green-800 dark:text-green-300' :
                        'text-blue-800 dark:text-blue-300'
                    }`}>
                    {insight}
                </p>
            </CardContent>
        </Card>
    );
}
