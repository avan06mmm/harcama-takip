"use client";

import { useTransactionStore } from "@/lib/store";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Trash2, TrendingUp, TrendingDown, ReceiptText } from "lucide-react";

export function TransactionList() {
  const { transactions, deleteTransaction } = useTransactionStore();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-full bg-background p-4 shadow-sm mb-4">
          <ReceiptText className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium text-foreground">
          Henüz işlem kaydınız yok
        </p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
          Harcamalarınızı ve gelirlerinizi takip etmek için yukarıdaki "Yeni İşlem Ekle" butonunu kullanın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={() => deleteTransaction(transaction.id)}
        />
      ))}
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
}

function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
            isIncome
              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-500"
              : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500"
          )}
        >
          {isIncome ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{transaction.category}</p>
          {transaction.note && (
            <p className="text-sm text-muted-foreground truncate">{transaction.note}</p>
          )}
          <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-right">
          <p
            className={cn(
              "text-base sm:text-lg font-semibold whitespace-nowrap",
              isIncome
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            )}
          >
            {isIncome ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className="text-xs text-muted-foreground hidden sm:block text-right">
            {formatDate(transaction.date)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
