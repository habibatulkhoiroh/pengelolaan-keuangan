import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TransactionService } from '../services/transactionService';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const summary = user ? TransactionService.getFinancialSummary(user.id) : null;
  const recentTransactions = user ? TransactionService.getTransactionsByUser(user.id).slice(-5).reverse() : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const exportToExcel = () => {
    if (!user || recentTransactions.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(recentTransactions.map(t => ({
      Tanggal: new Date(t.date).toLocaleDateString('id-ID'),
      Deskripsi: t.description,
      Kategori: t.category,
      Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Jumlah: t.amount,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Laporan_Transaksi_${user.name || 'user'}.xlsx`);
  };

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... Kartu Saldo, Pemasukan, Pengeluaran, Bulan Ini ... */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saldo Total</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
              <p className={`text-2xl font-bold ${(summary.thisMonthIncome - summary.thisMonthExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.thisMonthIncome - summary.thisMonthExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Transaksi Terbaru</h3>
          {recentTransactions.length > 0 && (
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm"
            >
              Ekspor ke Excel
            </button>
          )}
        </div>
        <div className="p-6">
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
