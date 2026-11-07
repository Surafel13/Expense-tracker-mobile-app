import type {
  AccountWithBalance,
  Account,
  Transaction,
} from "@app-types/index";

export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
): AccountWithBalance[] {
  const map = new Map<string, number>();
  for (const a of accounts) map.set(a.id, a.openingBalance);

  for (const t of transactions) {
    if (t.type === "income" && t.accountId) {
      const curr = map.get(t.accountId);
      if (curr !== undefined) map.set(t.accountId, curr + t.amount);
    } else if (t.type === "expense" && t.accountId) {
      const curr = map.get(t.accountId);
      if (curr !== undefined) map.set(t.accountId, curr - t.amount);
    } else if (t.type === "transfer") {
      if (t.fromAccountId) {
        const curr = map.get(t.fromAccountId);
        if (curr !== undefined) map.set(t.fromAccountId, curr - t.amount);
      }
      if (t.toAccountId) {
        const curr = map.get(t.toAccountId);
        if (curr !== undefined) map.set(t.toAccountId, curr + t.amount);
      }
    }
  }

  return accounts.map((a) => ({
    ...a,
    balance: map.get(a.id) ?? a.openingBalance,
  }));
}

export function computeAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  let balance = account.openingBalance;
  for (const t of transactions) {
    if (t.type === "income" && t.accountId === account.id) {
      balance += t.amount;
    } else if (t.type === "expense" && t.accountId === account.id) {
      balance -= t.amount;
    } else if (t.type === "transfer") {
      if (t.fromAccountId === account.id) balance -= t.amount;
      if (t.toAccountId === account.id) balance += t.amount;
    }
  }
  return balance;
}

export function getAccountTransactions(
  accountId: string,
  transactions: Transaction[],
): Transaction[] {
  return transactions.filter(
    (t) =>
      t.accountId === accountId ||
      t.fromAccountId === accountId ||
      t.toAccountId === accountId,
  );
}
