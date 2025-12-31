"use client";

import { useState, useMemo, useEffect } from "react";
import { useTransactionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, AlertCircle } from "lucide-react";

// Gider kategorileri (TransactionForm ile aynı)
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

export function BudgetPlanner() {
    const { budgets, transactions, addBudget, deleteBudget, fetchBudgets } = useTransactionStore();
    const [isAdding, setIsAdding] = useState(false);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount) return;

        await addBudget({
            category,
            amount: parseFloat(amount),
        });

        setCategory("");
        setAmount("");
        setIsAdding(false);
    };

    // Her kategori için bu ayki harcamaları hesapla
    const budgetAnalysis = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return budgets.map(budget => {
            const spent = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.type === 'expense' &&
                        t.category === budget.category &&
                        d.getMonth() === currentMonth &&
                        d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => acc + t.amount, 0);

            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const isExceeded = spent > budget.amount;

            return {
                ...budget,
                spent,
                percentage,
                isExceeded
            };
        });
    }, [budgets, transactions]);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Bütçe Planlama</CardTitle>
                    <CardDescription>Bu ay için harcama limitlerinizi belirleyin</CardDescription>
                </div>
                {!isAdding && (
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Hedef Ekle
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {isAdding && (
                    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="text-sm font-medium">Limit (TL)</label>
                                <Input
                                    type="number"
                                    placeholder="Örn: 5000"
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

                <div className="space-y-5">
                    {budgetAnalysis.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Henüz bütçe hedefi belirlemediniz.
                        </p>
                    ) : (
                        budgetAnalysis.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="font-medium flex items-center gap-2">
                                        {item.category}
                                        {item.isExceeded && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className={item.isExceeded ? "text-red-600 font-bold" : ""}>
                                            {item.spent.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                        </span>
                                        {" / "}
                                        {item.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                    </div>
                                </div>
                                <div className="relative pt-1">
                                    <Progress
                                        value={item.percentage}
                                        className="h-2"
                                    // Progress styles are currently limited in Shadcn default, 
                                    // so we rely on parent color classes or custom CSS if deeper customization needed.
                                    // But logic-wise:
                                    />
                                    {/* Custom color logic bar override if needed or just use default */}
                                    <div
                                        className={`absolute top-1 left-0 h-2 rounded-full transition-all duration-500 ${item.percentage >= 100 ? 'bg-red-500' :
                                                item.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => deleteBudget(item.id)}
                                        className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
