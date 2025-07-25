export interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
}