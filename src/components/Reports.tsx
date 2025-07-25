import React, { useContext, useState } from 'react';
import { TransactionContext } from '../contexts/TransactionContext';
import { Transaction } from '../types';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { transactions } = useContext(TransactionContext);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const filteredTransactions = transactions.filter((trx: Transaction) => {
    const trxDate = new Date(trx.date).getTime();
    const start = new Date(dateRange.startDate).getTime();
    const end = new Date(dateRange.endDate).getTime();
    return trxDate >= start && trxDate <= end;
  });

  const totalIncome = filteredTransactions
    .filter((trx) => trx.type === 'income')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const totalExpense = filteredTransactions
    .filter((trx) => trx.type === 'expense')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const profit = totalIncome - totalExpense;

  const exportToExcel = () => {
    const data = [
      ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'],
      ...filteredTransactions.map(trx => [
        trx.date,
        trx.description,
        trx.category,
        trx.type,
        trx.amount
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

    const filename = `laporan-keuangan-${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Laporan Keuangan</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Dari Tanggal:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sampai Tanggal:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
        >
          Ekspor Excel
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <p><strong>Total Pemasukan:</strong> Rp{totalIncome.toLocaleString()}</p>
        <p><strong>Total Pengeluaran:</strong> Rp{totalExpense.toLocaleString()}</p>
        <p><strong>Keuntungan:</strong> Rp{profit.toLocaleString()}</p>
      </div>

      <table className="w-full table-auto border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Deskripsi</th>
            <th className="border px-2 py-1">Kategori</th>
            <th className="border px-2 py-1">Tipe</th>
            <th className="border px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((trx, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{trx.date}</td>
              <td className="border px-2 py-1">{trx.description}</td>
              <td className="border px-2 py-1">{trx.category}</td>
              <td className="border px-2 py-1 capitalize">{trx.type}</td>
              <td className="border px-2 py-1">Rp{trx.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
