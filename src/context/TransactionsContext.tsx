import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getTransactions,
  addTransaction as persistAdd,
  updateTransaction as persistUpdate,
  deleteTransaction as persistDelete,
} from "@storage/transactions";
import { getAccounts } from "@storage/accounts";
import { computeAccountBalance } from "@utils/balance";
import { runMigrationOnce } from "@utils/migration";
import type { Transaction, TransactionInput } from "@app-types/index";

interface TransactionsContextValue {
  transactions: Transaction[];
  isReady: boolean;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    patch: TransactionInput,
  ) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(
  undefined,
);

function sortTransactions(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

async function validateBalanceImpact(
  input: TransactionInput,
  existing: Transaction[],
  ignoreId?: string,
): Promise<void> {
  const accounts = await getAccounts();
  const byId = new Map(accounts.map((a) => [a.id, a]));

  if (input.type === "expense" && input.accountId) {
    const acc = byId.get(input.accountId);
    if (!acc || acc.allowNegative) return;
    const relevant = existing.filter((t) => t.id !== ignoreId);
    const current = computeAccountBalance(acc, relevant);
    if (current - input.amount < 0) {
      throw new Error(
        `Insufficient balance in "${acc.name}". Available: $${current.toFixed(2)}`,
      );
    }
  }

  if (input.type === "transfer" && input.fromAccountId) {
    const acc = byId.get(input.fromAccountId);
    if (!acc || acc.allowNegative) return;
    const relevant = existing.filter((t) => t.id !== ignoreId);
    const current = computeAccountBalance(acc, relevant);
    if (current - input.amount < 0) {
      throw new Error(
        `Insufficient balance in "${acc.name}". Available: $${current.toFixed(2)}`,
      );
    }
  }
}

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const stored = await getTransactions();
    setTransactions(sortTransactions(stored));
  }, []);

  useEffect(() => {
    (async () => {
      await runMigrationOnce();
      await refresh();
      setIsReady(true);
    })();
  }, [refresh]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    const existing = await getTransactions();
    await validateBalanceImpact(input, existing);
    const created = await persistAdd(input);
    setTransactions((prev) => sortTransactions([created, ...prev]));
    return created;
  }, []);

  const updateTransaction = useCallback(
    async (id: string, patch: TransactionInput) => {
      const existing = await getTransactions();
      await validateBalanceImpact(patch, existing, id);
      const updated = await persistUpdate(id, patch);
      setTransactions((prev) =>
        sortTransactions(prev.map((t) => (t.id === id ? updated : t))),
      );
      return updated;
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string) => {
    await persistDelete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      isReady,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refresh,
    }),
    [
      transactions,
      isReady,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refresh,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error(
      "useTransactions must be used inside <TransactionsProvider>",
    );
  }
  return ctx;
}
