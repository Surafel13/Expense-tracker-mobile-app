// ─────────────────────────────────────────────────────────────
// AsyncStorage-backed persistence for transactions
// ─────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@constants/index";
import { generateId } from "@utils/id";
import type { Transaction, TransactionInput } from "@app-types/index";

/**
 * Read all transactions from storage.
 * Returns an empty array if nothing is stored yet or data is corrupted.
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Basic shape validation — drop any malformed entries
    return parsed.filter(
      (t): t is Transaction =>
        !!t &&
        typeof t.id === "string" &&
        typeof t.amount === "number" &&
        typeof t.date === "string" &&
        (t.type === "income" || t.type === "expense"),
    );
  } catch (err) {
    console.warn("[storage] getTransactions failed:", err);
    return [];
  }
}

/** Overwrite the full transactions array */
export async function saveTransactions(
  transactions: Transaction[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions),
    );
  } catch (err) {
    console.warn("[storage] saveTransactions failed:", err);
    throw err;
  }
}

/**
 * Create a new transaction.
 * Returns the newly created record.
 */
export async function addTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...input,
    id: generateId(),
    createdAt: now,
  };

  const existing = await getTransactions();
  const updated = [newTx, ...existing];
  await saveTransactions(updated);
  return newTx;
}

/**
 * Update an existing transaction by id.
 * Throws if the id is not found.
 */
export async function updateTransaction(
  id: string,
  patch: TransactionInput,
): Promise<Transaction> {
  const existing = await getTransactions();
  const idx = existing.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Transaction ${id} not found`);

  const updated: Transaction = {
    ...existing[idx],
    ...patch,
  };

  const next = [...existing];
  next[idx] = updated;
  await saveTransactions(next);
  return updated;
}

/** Delete a transaction by id */
export async function deleteTransaction(id: string): Promise<void> {
  const existing = await getTransactions();
  const next = existing.filter((t) => t.id !== id);
  await saveTransactions(next);
}

/** Get a single transaction by id (undefined if not found) */
export async function getTransactionById(
  id: string,
): Promise<Transaction | undefined> {
  const all = await getTransactions();
  return all.find((t) => t.id === id);
}

/**
 * Danger zone: clear all transactions.
 * (Only used if we want a "reset data" feature later.)
 */
export async function clearTransactions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
}
