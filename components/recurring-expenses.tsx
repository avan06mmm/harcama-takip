"use client";

import { useState, useEffect } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RefreshCw, Plus, Trash2, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const EXPENSE_CATEGORIES = [
    "Gıda",
    "Ulaşım",
    "Konut",
    "Eğlence",
    "Sağlık",
    "Eğitim",
    "Alışveriş",
    "Faturalar",
    "Diğer",
];

export function RecurringExpenses() {
    const {
        recurringTransactions,
        addRecurringTransaction,
        deleteRecurringTransaction,
        fetchRecurringTransactions,
        checkAndProcessRecurring
    } = useTransactionStore();

    const [isAdding, setIsAdding] = useState(false);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        fetchRecurringTransactions();
        // Sayfa yüklendiğinde otomatik kontrol et
        checkAndProcessRecurring().then(() => {
            // Eğer yeni işlem eklendiyse listeyi tazelemek için bir signal gerekebilir ama 
            // şimdilik basit tutuyoruz.
        });
    }, [fetchRecurringTransactions, checkAndProcessRecurring]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount) return;

        await addRecurringTransaction({
            category,
            amount: parseFloat(amount),
            description,
            frequency: 'monthly' // Şimdilik sadece aylık
        });

        setCategory("");
        setAmount("");
        setDescription("");
        setIsAdding(false);
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-500" />
                        Yinelenen Ödemeler
                    </CardTitle>
                    <CardDescription>Her ay otomatik eklenecek sabit giderleriniz</CardDescription>
                </div>
                {!isAdding && (
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Ekle
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {isAdding && (
                    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Başlık / Açıklama</label>
                                <Input
                                    placeholder="Örn: Netflix, Kira, İnternet"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kategori</label>
                                <Select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Seçiniz</option>
                                    {EXPENSE_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tutar (TL)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>İptal</Button>
                            <Button type="submit" size="sm">Kaydet</Button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {recurringTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                            <CalendarClock className="h-8 w-8 opacity-20" />
                            <p className="text-sm text-center">
                                Henüz yinelenen ödeme yok.<br />
                                Kira veya aboneliklerinizi ekleyebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        recurringTransactions.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">{item.description || item.category}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 bg-secondary rounded-full">
                                            {item.category}
                                        </span>
                                        <span>• Her Ay</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-sm">
                                        {item.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                        onClick={() => deleteRecurringTransaction(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
