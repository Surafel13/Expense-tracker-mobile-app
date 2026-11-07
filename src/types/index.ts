export type TransactionType = "income" | "expense" | "transfer";

export type CategoryId =
  | "food"
  | "transport"
  | "shopping"
  | "education"
  | "health"
  | "entertainment"
  | "bills"
  | "salary"
  | "freelance"
  | "gift"
  | "other";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category?: CategoryId;
  note?: string;
  date: string;
  createdAt: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

export interface Summary {
  balance: number;
  income: number;
  expense: number;
}

export interface MonthlyData {
  month: string;
  key: string;
  income: number;
  expense: number;
}

export type TransactionInput = Omit<Transaction, "id" | "createdAt">;
