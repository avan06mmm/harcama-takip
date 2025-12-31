"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";
import { Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle, PiggyBank, Lightbulb } from "lucide-react";

interface AiAdvisorProps {
    transactions: Transaction[];
}

export function AiAdvisor({ transactions }: AiAdvisorProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"warning" | "success" | "neutral">("neutral");

    // Otomatik analiz fonksiyonu (Basit bir kural tabanlı AI simülasyonu)
    const generateInsight = async () => {
        setLoading(true);
        setInsight(null);

        // Yapay zeka "düşünüyormuş" gibi hissettirmek için kısa bir gecikme
        await new Promise((resolve) => setTimeout(resolve, 1500));

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

        // Mantıksal Çıkarımlar (AI Logic)
        let message = "";
        let messageType: "warning" | "success" | "neutral" = "neutral";

        if (transactions.length === 0) {
            message = "Henüz yeterli veri yok. Analiz yapabilmem için birkaç gelir ve gider kalemi eklemelisin.";
            messageType = "neutral";
        } else if (income === 0) {
            message = "Dikkat! Hiç gelir kaydınız bulunmuyor. Finansal dengenizi kurmak için önce gelirlerinizi ekleyin.";
            messageType = "warning";
        } else if (expense > income) {
            message = `Acil Durum! Harcamalarınız gelirinizden ${Math.abs(balance).toLocaleString("tr-TR")} TL daha fazla. Özellikle "${topCategory?.[0]}" kategorisindeki harcamalarınızı gözden geçirmenizi öneririm. Borçlanma riskiniz yüksek.`;
            messageType = "warning";
        } else if (savingsRate < 10) {
            message = `Gelir ve gideriniz dengede sayılır ancak tasarruf oranınız çok düşük (%${savingsRate.toFixed(1)}). Geleceğiniz için "${topCategory?.[0]}" harcamalarını biraz kısıp, birikim oranını en az %20'ye çekmeyi hedefleyebilirsiniz.`;
            messageType = "neutral";
        } else if (savingsRate >= 10 && savingsRate < 30) {
            message = `İyi gidiyorsunuz! Gelirinizin %${savingsRate.toFixed(1)}'ini koruyabiliyorsunuz. 50/30/20 kuralına göre ideal yoldasınız. Birikimlerinizi yatırıma dönüştürmeyi düşünebilirsiniz.`;
            messageType = "success";
        } else {
            message = `Müthiş bir finansal yönetim! Gelirinizin %${savingsRate.toFixed(1)} gibi büyük bir kısmını kenara koyuyorsunuz. Bu "finansal özgürlük" yolunda olduğunuzu gösteriyor.`;
            messageType = "success";
        }

        setInsight(message);
        setType(messageType);
        setLoading(false);
    };

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    <Brain className="h-5 w-5" />
                    Yapay Zeka Asistanı
                </CardTitle>
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
                {!insight && !loading && (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4 text-sm">
                            Harcama alışkanlıklarınızı analiz edip size özel finansal tavsiyeler verebilirim.
                        </p>
                        <Button onClick={generateInsight} className="w-full sm:w-auto">
                            Analizi Başlat
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                            <Brain className="absolute inset-0 m-auto h-6 w-6 text-primary/50 animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">Verileriniz analiz ediliyor...</p>
                    </div>
                )}

                {insight && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`p-4 rounded-lg border ${type === 'warning' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' :
                                type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' :
                                    'bg-primary/10 border-primary/20 text-primary-foreground/90' // dark mode uyumu için primary kullan
                            }`}>
                            <div className="flex items-start gap-3">
                                {type === 'warning' && <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />}
                                {type === 'success' && <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />}
                                {type === 'neutral' && <Lightbulb className="h-5 w-5 shrink-0 mt-0.5" />}
                                <p className="text-sm font-medium leading-relaxed dark:text-foreground">
                                    {insight}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={generateInsight}
                            className="w-full text-xs text-muted-foreground hover:bg-background/50"
                        >
                            Yeniden Analiz Et
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
