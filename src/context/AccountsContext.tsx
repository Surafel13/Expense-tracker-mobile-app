import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getAccounts,
  addAccount as persistAdd,
  updateAccount as persistUpdate,
  deleteAccount as persistDelete,
} from "@storage/accounts";
import { computeAccountBalances } from "@utils/balance";
import { useTransactions } from "@context/TransactionsContext";
import type { Account, AccountWithBalance } from "@app-types/index";

interface AccountsContextValue {
  accounts: Account[];
  accountsWithBalance: AccountWithBalance[];
  isReady: boolean;
  addAccount: (input: Omit<Account, "id" | "createdAt">) => Promise<Account>;
  updateAccount: (
    id: string,
    patch: Partial<Omit<Account, "id" | "createdAt">>,
  ) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  getAccount: (id: string) => Account | undefined;
  getAccountWithBalance: (id: string) => AccountWithBalance | undefined;
}

const AccountsContext = createContext<AccountsContextValue | undefined>(
  undefined,
);

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { transactions, isReady: txReady } = useTransactions();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getAccounts();
      setAccounts(stored);
      setIsReady(true);
    })();
  }, []);

  const addAccount = useCallback(
    async (input: Omit<Account, "id" | "createdAt">) => {
      const created = await persistAdd(input);
      setAccounts((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const updateAccount = useCallback(
    async (id: string, patch: Partial<Omit<Account, "id" | "createdAt">>) => {
      const updated = await persistUpdate(id, patch);
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const deleteAccount = useCallback(async (id: string) => {
    await persistDelete(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const accountsWithBalance = useMemo(
    () => computeAccountBalances(accounts, transactions),
    [accounts, transactions],
  );

  const getAccount = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts],
  );

  const getAccountWithBalance = useCallback(
    (id: string) => accountsWithBalance.find((a) => a.id === id),
    [accountsWithBalance],
  );

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts,
      accountsWithBalance,
      isReady: isReady && txReady,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccount,
      getAccountWithBalance,
    }),
    [
      accounts,
      accountsWithBalance,
      isReady,
      txReady,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccount,
      getAccountWithBalance,
    ],
  );

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
};

export function useAccounts(): AccountsContextValue {
  const ctx = useContext(AccountsContext);
  if (!ctx) {
    throw new Error("useAccounts must be used inside <AccountsProvider>");
  }
  return ctx;
}
