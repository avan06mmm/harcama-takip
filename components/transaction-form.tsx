"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTransactionStore } from "@/lib/store";
import { TransactionType } from "@/types/transaction";
import { Plus, X } from "lucide-react";

const INCOME_CATEGORIES = ["Maaş", "Yatırım", "Freelance", "Hediye", "Diğer"];
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

export function TransactionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");

  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      date,
      note,
    });

    setAmount("");
    setCategory("");
    setNote("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Yeni İşlem Ekle
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Yeni İşlem Ekle</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">İşlem Türü</label>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setCategory("");
              }}
            >
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tutar</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tarih</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Not (Opsiyonel)</label>
          <Input
            placeholder="Açıklama..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
