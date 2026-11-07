import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, DEFAULT_ACCOUNT_ID } from "@constants/index";
import { getAccounts, saveAccounts } from "@storage/accounts";
import { getTransactions, saveTransactions } from "@storage/transactions";
import type { Account } from "@app-types/index";

export async function runMigrationOnce(): Promise<void> {
  try {
    const flag = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATION_V2);
    if (flag === "done") return;

    let accounts = await getAccounts();
    if (accounts.length === 0) {
      const defaultAccount: Account = {
        id: DEFAULT_ACCOUNT_ID,
        name: "Cash",
        type: "cash",
        openingBalance: 0,
        allowNegative: false,
        createdAt: new Date().toISOString(),
      };
      accounts = [defaultAccount];
      await saveAccounts(accounts);
    }

    const transactions = await getTransactions();
    let changed = false;
    const migrated = transactions.map((t) => {
      if (t.type === "transfer") return t;
      if (t.accountId) return t;
      changed = true;
      return { ...t, accountId: DEFAULT_ACCOUNT_ID };
    });
    if (changed) await saveTransactions(migrated);

    await AsyncStorage.setItem(STORAGE_KEYS.MIGRATION_V2, "done");
  } catch (err) {
    console.warn("[migration] failed:", err);
  }
}
