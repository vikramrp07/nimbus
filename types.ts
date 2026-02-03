export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum Category {
  HOUSING = 'Housing',
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  SHOPPING = 'Shopping',
  INCOME = 'Income',
  OTHER = 'Other',
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
}

export interface BudgetEnvelope {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  icon: string;
}

export interface SyncConfig {
  googleScriptUrl?: string;
  lastSynced?: string;
}

export interface AppData {
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  goals: Goal[];
  categories: CategoryItem[];
  syncConfig?: SyncConfig;
}
