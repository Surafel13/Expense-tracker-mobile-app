import type { AccountType } from "@app-types/index";

export interface AccountTypeMeta {
  id: AccountType;
  label: string;
  icon: string;
  color: string;
}

export const ACCOUNT_TYPES: Record<AccountType, AccountTypeMeta> = {
  cash: {
    id: "cash",
    label: "Cash",
    icon: "cash-outline",
    color: "#10B981",
  },
  bank: {
    id: "bank",
    label: "Bank Account",
    icon: "business-outline",
    color: "#3B82F6",
  },
  savings: {
    id: "savings",
    label: "Savings",
    icon: "wallet-outline",
    color: "#8B5CF6",
  },
  mobile: {
    id: "mobile",
    label: "Mobile Money",
    icon: "phone-portrait-outline",
    color: "#F59E0B",
  },
};

export const ACCOUNT_TYPE_LIST = Object.values(ACCOUNT_TYPES);

export const DEFAULT_ACCOUNT_ID = "default-cash";

export const UNTRACKED_ACCOUNT_ID = "untracked";
