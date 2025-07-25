import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TransactionService } from '../services/transactionService';
import { Transaction } from '../types';
import * as XLSX from 'xlsx';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const allTransactions = user ? TransactionService.getTransactionsByUser(user.id) : [];

  const filteredTransactions = allTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getCategoryData = (type: 'income' | 'expense') => {
    const transactions = filteredTransactions.filter(t => t.type === type);
    const categories: { [key: string]: number } = {};

    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / (type === 'income' ? totalIncome : totalExpense)) * 100,
    }));
  };

  const handleExportToExcel = () => {
    const worksheetData = filteredTransactions.map(t => ({
      Tanggal: t.date,
      Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: t.category,
      Jumlah: t.amount
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, 'laporan_keuangan.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Periode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Tanggal Akhir
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
            />
          </div>
        </div>
        <button
          onClick={handleExportToExcel}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
        >
          Ekspor ke Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Total Pemasukan</h4>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Total Pengeluaran</h4>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Keuntungan</h4>
          <p className={`text-3xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Kategori Pemasukan</h4>
          {getCategoryData('income').map((item) => (
            <div key={item.category} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{item.category}</span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Kategori Pengeluaran</h4>
          {getCategoryData('expense').map((item) => (
            <div key={item.category} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{item.category}</span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
