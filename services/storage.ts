import { AppData, Transaction, BudgetEnvelope, Goal, TransactionType, Category, CategoryItem, SyncConfig } from '../types';

const STORAGE_KEY = 'nimbus_data_v1';

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'c1', name: Category.HOUSING, color: '#6366f1', isDefault: true },
  { id: 'c2', name: Category.FOOD, color: '#10b981', isDefault: true },
  { id: 'c3', name: Category.TRANSPORT, color: '#f59e0b', isDefault: true },
  { id: 'c4', name: Category.UTILITIES, color: '#0ea5e9', isDefault: true },
  { id: 'c5', name: Category.ENTERTAINMENT, color: '#f43f5e', isDefault: true },
  { id: 'c6', name: Category.HEALTH, color: '#ec4899', isDefault: true },
  { id: 'c7', name: Category.SHOPPING, color: '#8b5cf6', isDefault: true },
  { id: 'c8', name: Category.INCOME, color: '#10b981', isDefault: true },
  { id: 'c9', name: Category.OTHER, color: '#64748b', isDefault: true },
];

const DEFAULT_DATA: AppData = {
  categories: DEFAULT_CATEGORIES,
  syncConfig: {},
  transactions: [
    { id: '1', amount: 2500, date: new Date().toISOString(), description: 'Paycheck', category: Category.INCOME, type: TransactionType.INCOME },
    { id: '2', amount: 45.50, date: new Date(Date.now() - 86400000).toISOString(), description: 'Grocery Store', category: Category.FOOD, type: TransactionType.EXPENSE },
    { id: '3', amount: 1200, date: new Date(Date.now() - 172800000).toISOString(), description: 'Rent Payment', category: Category.HOUSING, type: TransactionType.EXPENSE },
    { id: '4', amount: 15.00, date: new Date(Date.now() - 200000000).toISOString(), description: 'Netflix', category: Category.ENTERTAINMENT, type: TransactionType.EXPENSE },
    { id: '5', amount: 60.00, date: new Date(Date.now() - 250000000).toISOString(), description: 'Gas Station', category: Category.TRANSPORT, type: TransactionType.EXPENSE },
  ],
  budgets: [
    { id: '1', category: Category.FOOD, limit: 500, spent: 45.50, color: '#10b981' }, // Emerald
    { id: '2', category: Category.HOUSING, limit: 1500, spent: 1200, color: '#6366f1' }, // Indigo
    { id: '3', category: Category.ENTERTAINMENT, limit: 200, spent: 15.00, color: '#f43f5e' }, // Rose
    { id: '4', category: Category.TRANSPORT, limit: 300, spent: 60.00, color: '#f59e0b' }, // Amber
  ],
  goals: [
    { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500, dueDate: '2024-12-31', icon: 'shield' },
    { id: '2', name: 'Vacation to Japan', targetAmount: 5000, currentAmount: 1200, dueDate: '2025-06-01', icon: 'plane' },
  ]
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    // Migration for existing data without categories
    if (!data.categories) {
      data.categories = DEFAULT_CATEGORIES;
    }
    // Migration for syncConfig
    if (!data.syncConfig) {
      data.syncConfig = {};
    }
    saveAppData(data);
    return data;
  }
  return DEFAULT_DATA;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addTransaction = (tx: Omit<Transaction, 'id'>): Transaction => {
  const data = getAppData();
  const newTx = { ...tx, id: Math.random().toString(36).substring(2, 9) };
  
  data.transactions = [newTx, ...data.transactions];
  
  // Update budget spent amount if expense
  if (tx.type === TransactionType.EXPENSE) {
    const budgetIndex = data.budgets.findIndex(b => b.category === tx.category);
    if (budgetIndex >= 0) {
      data.budgets[budgetIndex].spent += tx.amount;
    }
  }

  saveAppData(data);
  return newTx;
};

export const updateGoal = (goalId: string, amount: number) => {
  const data = getAppData();
  const index = data.goals.findIndex(g => g.id === goalId);
  if (index >= 0) {
    data.goals[index].currentAmount = amount;
    saveAppData(data);
  }
};

export const addCategory = (name: string, color: string): CategoryItem => {
  const data = getAppData();
  const newCategory: CategoryItem = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    color
  };
  data.categories.push(newCategory);
  saveAppData(data);
  return newCategory;
};

export const deleteCategory = (id: string) => {
  const data = getAppData();
  data.categories = data.categories.filter(c => c.id !== id);
  saveAppData(data);
};

export const updateSyncConfig = (url: string) => {
  const data = getAppData();
  data.syncConfig = { ...data.syncConfig, googleScriptUrl: url };
  saveAppData(data);
};

export const updateLastSync = () => {
  const data = getAppData();
  data.syncConfig = { ...data.syncConfig, lastSynced: new Date().toISOString() };
  saveAppData(data);
};
