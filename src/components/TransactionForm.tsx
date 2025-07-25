import React, { useState } from 'react';
import { TransactionService } from '../services/transactionService';
import { useAuth } from '../contexts/AuthContext';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    income: ['Penjualan', 'Jasa', 'Investasi', 'Lainnya'],
    expense: ['Bahan Baku', 'Operasional', 'Marketing', 'Transport', 'Utilitas', 'Lainnya'],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    TransactionService.addTransaction({
      userId: user.id,
      type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    });

    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });

    onSuccess();
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Tambah {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Jumlah (IDR)
          </label>
          <input
            type="number"
            id="amount"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
          >
            <option value="">Pilih kategori</option>
            {categories[type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <input
            type="text"
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Tanggal
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
          />
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            type === 'income'
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Tambah {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </button>
      </form>
    </div>
  );
};