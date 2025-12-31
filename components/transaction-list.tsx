"use client";

import { useTransactionStore } from "@/lib/store";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";

export function TransactionList() {
  const { transactions, deleteTransaction } = useTransactionStore();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Henüz işlem kaydınız yok
        </p>
        <p className="text-sm text-muted-foreground">
          İlk işleminizi eklemek için butona tıklayın
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
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
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

        <div>
          <p className="font-medium">{transaction.category}</p>
          {transaction.note && (
            <p className="text-sm text-muted-foreground">{transaction.note}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p
          className={cn(
            "text-lg font-semibold",
            isIncome
              ? "text-green-600 dark:text-green-500"
              : "text-red-600 dark:text-red-500"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
