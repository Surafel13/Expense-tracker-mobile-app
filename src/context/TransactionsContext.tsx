// ─────────────────────────────────────────────────────────────
// App-wide transactions provider (loads once, keeps in memory,
// and persists every mutation back to AsyncStorage)
// ─────────────────────────────────────────────────────────────

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

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const stored = await getTransactions();
    // Newest first (by date, then by createdAt as tie-breaker)
    stored.sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return b.createdAt.localeCompare(a.createdAt);
    });
    setTransactions(stored);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setIsReady(true);
    })();
  }, [refresh]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    const created = await persistAdd(input);
    setTransactions((prev) =>
      [created, ...prev].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) return byDate;
        return b.createdAt.localeCompare(a.createdAt);
      }),
    );
    return created;
  }, []);

  const updateTransaction = useCallback(
    async (id: string, patch: TransactionInput) => {
      const updated = await persistUpdate(id, patch);
      setTransactions((prev) =>
        prev
          .map((t) => (t.id === id ? updated : t))
          .sort((a, b) => {
            const byDate = b.date.localeCompare(a.date);
            if (byDate !== 0) return byDate;
            return b.createdAt.localeCompare(a.createdAt);
          }),
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
