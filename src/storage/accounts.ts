import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@constants/index";
import { generateId } from "@utils/id";
import type { Account } from "@app-types/index";

export async function getAccounts(): Promise<Account[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is Account =>
        !!a &&
        typeof a.id === "string" &&
        typeof a.name === "string" &&
        typeof a.openingBalance === "number" &&
        (a.type === "cash" ||
          a.type === "bank" ||
          a.type === "savings" ||
          a.type === "mobile"),
    );
  } catch (err) {
    console.warn("[accounts] getAccounts failed:", err);
    return [];
  }
}

export async function saveAccounts(accounts: Account[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.warn("[accounts] saveAccounts failed:", err);
    throw err;
  }
}

export async function addAccount(
  input: Omit<Account, "id" | "createdAt">,
): Promise<Account> {
  const newAccount: Account = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const existing = await getAccounts();
  await saveAccounts([...existing, newAccount]);
  return newAccount;
}

export async function updateAccount(
  id: string,
  patch: Partial<Omit<Account, "id" | "createdAt">>,
): Promise<Account> {
  const existing = await getAccounts();
  const idx = existing.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error(`Account ${id} not found`);
  const updated: Account = { ...existing[idx], ...patch };
  const next = [...existing];
  next[idx] = updated;
  await saveAccounts(next);
  return updated;
}

export async function deleteAccount(id: string): Promise<void> {
  const existing = await getAccounts();
  await saveAccounts(existing.filter((a) => a.id !== id));
}

export async function clearAccounts(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
}
