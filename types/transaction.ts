export type TransactionType = "income" | "expense";
export type RecurringFrequency = "monthly" | "weekly" | "yearly";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  created_at?: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  frequency: RecurringFrequency;
  last_processed_date?: string;
  next_run_date: string;
  is_active: boolean;
  created_at?: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  [key: string]: string | number;
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
