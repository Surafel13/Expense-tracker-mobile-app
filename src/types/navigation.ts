import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Accounts: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  AddTransaction: {
    transactionId?: string;
  };
  AddAccount: {
    accountId?: string;
  };
  AccountDetail: {
    accountId: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
