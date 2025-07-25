// Global variables
let transactions = [];
let storeName = 'Toko Serbaguna';
let charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadStoreName();
    loadTransactions();
    setupEventListeners();
    setDefaultDates();
    showApp();
    initializeCharts();
});

// Setup event listeners
function setupEventListeners() {
    // Transaction forms
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
}

// Set default dates for reports
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
}

// Store name functions
function loadStoreName() {
    const savedStoreName = localStorage.getItem('storeName');
    if (savedStoreName) {
        storeName = savedStoreName;
        document.getElementById('store-name').textContent = storeName;
    }
}

function saveStoreName() {
    localStorage.setItem('storeName', storeName);
}

function editStoreName() {
    const newName = prompt('Masukkan nama toko baru:', storeName);
    if (newName && newName.trim() !== '') {
        storeName = newName.trim();
        document.getElementById('store-name').textContent = storeName;
        saveStoreName();
    }
}

// Load transactions from localStorage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Show app
function showApp() {
    // Load dashboard
    updateDashboard();
    updateTransactionLists();
    updateCharts();
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Update navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update content based on section
    if (sectionName === 'dashboard') {
        updateDashboard();
        updateCharts();
    } else if (sectionName === 'income') {
        updateIncomeList();
    } else if (sectionName === 'expense') {
        updateExpenseList();
    }
}

// Transaction functions
function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const category = document.getElementById('incomeCategory').value;
    const description = document.getElementById('incomeDescription').value;
    const date = document.getElementById('incomeDate').value;
    
    addTransaction('income', amount, category, description, date);
    document.getElementById('incomeForm').reset();
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
    
    updateDashboard();
    updateIncomeList();
    updateCharts();
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    
    addTransaction('expense', amount, category, description, date);
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    updateDashboard();
    updateExpenseList();
    updateCharts();
}

function addTransaction(type, amount, category, description, date) {
    const transaction = {
        id: Date.now().toString(),
        userId: 'default',
        type,
        amount,
        category,
        description,
        date,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
}

function deleteTransaction(id) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        updateTransactionLists();
        updateCharts();
    }
}

// Update functions
function updateDashboard() {
    const userTransactions = transactions;
    
    const totalIncome = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // This month calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = userTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpense = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyBalance = monthlyIncome - monthlyExpense;
    
    // Update UI
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('monthly-balance').textContent = formatCurrency(monthlyBalance);
    
    // Update balance color
    const balanceElement = document.getElementById('total-balance');
    const monthlyElement = document.getElementById('monthly-balance');
    
    balanceElement.className = balance >= 0 ? 'income-text' : 'expense-text';
    monthlyElement.className = monthlyBalance >= 0 ? 'income-text' : 'expense-text';
    
    // Update recent transactions
    updateRecentTransactions();
}

function updateRecentTransactions() {
    const userTransactions = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const recentList = document.getElementById('recent-list');
    
    if (userTransactions.length === 0) {
        recentList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Belum ada transaksi</p>';
        return;
    }
    
    recentList.innerHTML = userTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${transaction.category}</p>
            </div>
            <div class="transaction-amount">
                <div class="amount ${transaction.type === 'income' ? 'income-text' : 'expense-text'}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                <div class="date">${formatDate(transaction.date)}</div>
            </div>
        </div>
    `).join('');
}

function updateTransactionLists() {
    updateIncomeList();
    updateExpenseList();
}

function updateIncomeList() {
    const incomeTransactions = transactions
        .filter(t => t.type === 'income')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    updateTransactionList('income-list', incomeTransactions);
}

function updateExpenseList() {
    const expenseTransactions = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    updateTransactionList('expense-list', expenseTransactions);
}

function updateTransactionList(elementId, transactionList) {
    const listElement = document.getElementById(elementId);
    
    if (transactionList.length === 0) {
        listElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Belum ada transaksi</p>';
        return;
    }
    
    listElement.innerHTML = transactionList.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${transaction.category} • ${formatDate(transaction.date)}</p>
            </div>
            <div class="transaction-amount">
                <div class="amount ${transaction.type === 'income' ? 'income-text' : 'expense-text'}">
                    ${formatCurrency(transaction.amount)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Reports function
function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Pilih tanggal mulai dan akhir');
        return;
    }
    
    const userTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return transactionDate >= start && transactionDate <= end;
    });
    
    const totalIncome = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = totalIncome - totalExpense;
    
    // Update report stats
    document.getElementById('report-income').textContent = formatCurrency(totalIncome);
    document.getElementById('report-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('report-profit').textContent = formatCurrency(profit);
    document.getElementById('report-profit').className = profit >= 0 ? 'income-text' : 'expense-text';
    
    // Update category reports
    updateCategoryReport('income', userTransactions, totalIncome);
    updateCategoryReport('expense', userTransactions, totalExpense);
}

function updateCategoryReport(type, transactions, total) {
    const typeTransactions = transactions.filter(t => t.type === type);
    const categories = {};
    
    typeTransactions.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    
    const categoryData = Object.entries(categories).map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
    }));
    
    const elementId = type === 'income' ? 'income-categories' : 'expense-categories';
    const element = document.getElementById(elementId);
    
    if (categoryData.length === 0) {
        element.innerHTML = '<p style="text-align: center; color: #6b7280;">Tidak ada data</p>';
        return;
    }
    
    element.innerHTML = categoryData.map(item => `
        <div class="category-item">
            <div class="category-header" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span class="category-name">${item.category}</span>
                <span class="category-amount">${formatCurrency(item.amount)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${type}" style="width: ${item.percentage}%"></div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Chart functions
function initializeCharts() {
    // Monthly trend chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    charts.monthly = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pemasukan',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Pengeluaran',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    }
                }
            }
        }
    });

    // Income categories chart
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    charts.income = new Chart(incomeCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#10b981',
                    '#059669',
                    '#047857',
                    '#065f46',
                    '#064e3b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });

    // Expense categories chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    charts.expense = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ef4444',
                    '#dc2626',
                    '#b91c1c',
                    '#991b1b',
                    '#7f1d1d'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function updateCharts() {
    updateMonthlyChart();
    updateCategoryCharts();
}

function updateMonthlyChart() {
    // Get last 6 months data
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        
        const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === date.getMonth() && 
                   transactionDate.getFullYear() === date.getFullYear();
        });
        
        const monthIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
    }
    
    charts.monthly.data.labels = months;
    charts.monthly.data.datasets[0].data = incomeData;
    charts.monthly.data.datasets[1].data = expenseData;
    charts.monthly.update();
}

function updateCategoryCharts() {
    // Income categories
    const incomeCategories = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
        incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
    });
    
    charts.income.data.labels = Object.keys(incomeCategories);
    charts.income.data.datasets[0].data = Object.values(incomeCategories);
    charts.income.update();
    
    // Expense categories
    const expenseCategories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });
    
    charts.expense.data.labels = Object.keys(expenseCategories);
    charts.expense.data.datasets[0].data = Object.values(expenseCategories);
    charts.expense.update();
}