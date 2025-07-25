import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Reports } from './components/Reports';
import { TransactionService } from './services/transactionService';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderContent = () => {
    const transactions = user ? TransactionService.getTransactionsByUser(user.id) : [];

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} />;
      case 'income':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionForm type="income" onSuccess={handleTransactionUpdate} />
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Data Pemasukan</h3>
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'income')}
                onUpdate={handleTransactionUpdate}
              />
            </div>
          </div>
        );
      case 'expense':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionForm type="expense" onSuccess={handleTransactionUpdate} />
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Data Pengeluaran</h3>
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'expense')}
                onUpdate={handleTransactionUpdate}
              />
            </div>
          </div>
        );
      case 'reports':
        return <Reports key={refreshKey} />;
      default:
        return <Dashboard key={refreshKey} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'income':
        return 'Pemasukan';
      case 'expense':
        return 'Pengeluaran';
      case 'reports':
        return 'Laporan Keuangan';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Layout title={getPageTitle()}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;