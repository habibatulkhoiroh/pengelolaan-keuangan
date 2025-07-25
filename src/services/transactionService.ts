import { Transaction } from '../types';

export class TransactionService {
  private static getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  private static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  static addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    return newTransaction;
  }

  static getTransactionsByUser(userId: string): Transaction[] {
    return this.getTransactions().filter(t => t.userId === userId);
  }

  static getTransactionsByUserAndType(userId: string, type: 'income' | 'expense'): Transaction[] {
    return this.getTransactions().filter(t => t.userId === userId && t.type === type);
  }

  static deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length !== transactions.length) {
      this.saveTransactions(filteredTransactions);
      return true;
    }
    
    return false;
  }

  static getFinancialSummary(userId: string) {
    const transactions = this.getTransactionsByUser(userId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpense = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      thisMonthIncome,
      thisMonthExpense,
    };
  }
}