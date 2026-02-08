import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Modal from '../components/shared/Modal';
import { useExpenses, EXPENSE_CATEGORIES } from '../context/ExpenseContext';
import {
    Plus,
    Trash2,
    Edit2,
    Filter,
    Calendar,
    TrendingUp,
    PieChart
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Expenses() {
    const {
        expenses,
        loading,
        addExpense,
        deleteExpense,
        updateExpense,
        monthlyBudget,
        updateBudget,
        getMonthlyTotal,
        categories
    } = useExpenses();

    const location = useLocation();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateFilter, setDateFilter] = useState('month');

    const [formData, setFormData] = useState({
        amount: '',
        category: 'food',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [budgetInput, setBudgetInput] = useState(monthlyBudget);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowAddModal(true);
            // Optional: Clear state to avoid reopening on refresh, 
            // but react-router-dom state persists on refresh so we might just leave it 
            // or we'd need to replace history which is complex. 
            // For now, this is sufficient.
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const resetForm = () => {
        setFormData({
            amount: '',
            category: 'food',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
        setEditingExpense(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const category = categories.find(c => c.id === formData.category);
        const expenseData = {
            amount: parseFloat(formData.amount),
            category: formData.category,
            categoryIcon: category?.icon,
            categoryColor: category?.color,
            description: formData.description,
            date: formData.date
        };

        if (editingExpense) {
            await updateExpense(editingExpense.id, expenseData);
        } else {
            await addExpense(expenseData);
        }

        setShowAddModal(false);
        resetForm();
    };

    const handleEdit = (expense) => {
        setFormData({
            amount: expense.amount.toString(),
            category: expense.category,
            description: expense.description,
            date: format(new Date(expense.date), 'yyyy-MM-dd')
        });
        setEditingExpense(expense);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

    const handleBudgetSave = () => {
        updateBudget(parseFloat(budgetInput));
        setShowBudgetModal(false);
    };

    // Filter expenses
    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;

        let matchesDate = true;
        const expenseDate = new Date(expense.date);
        const now = new Date();

        if (dateFilter === 'month') {
            matchesDate = isWithinInterval(expenseDate, {
                start: startOfMonth(now),
                end: endOfMonth(now)
            });
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            matchesDate = expenseDate >= weekAgo;
        }

        return matchesCategory && matchesDate;
    });

    const monthlyTotal = getMonthlyTotal();
    const budgetPercentage = (monthlyTotal / monthlyBudget) * 100;

    // Chart data
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const chartData = {
        labels: Object.keys(categoryTotals).map(cat =>
            categories.find(c => c.id === cat)?.name || cat
        ),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(cat =>
                categories.find(c => c.id === cat)?.color || '#64748b'
            ),
            borderWidth: 0
        }]
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header title="Expenses" />

            <div className="p-6 space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Budget Card */}
                    <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">Monthly Budget</p>
                                <h3 className="text-3xl font-bold mt-1">₹{monthlyBudget.toLocaleString()}</h3>
                            </div>
                            <button
                                onClick={() => setShowBudgetModal(true)}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Spent: ₹{monthlyTotal.toLocaleString()}</span>
                                <span>{budgetPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${budgetPercentage > 90 ? 'bg-red-400' : 'bg-white'
                                        }`}
                                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* This Month */}
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Calendar className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₹{monthlyTotal.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <TrendingUp className="text-purple-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {filteredExpenses.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expenses List */}
                    <div className="lg:col-span-2 card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Transactions</h3>
                            <div className="flex items-center gap-3">
                                {/* Date Filter */}
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="all">All Time</option>
                                    <option value="month">This Month</option>
                                    <option value="week">This Week</option>
                                </select>

                                {/* Category Filter */}
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>

                                {/* Add Button */}
                                <button
                                    onClick={() => { resetForm(); setShowAddModal(true); }}
                                    className="btn-expense flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span className="hidden sm:inline">Add</span>
                                </button>
                            </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        <th className="pb-3 font-medium">Description</th>
                                        <th className="pb-3 font-medium">Category</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium text-right">Amount</th>
                                        <th className="pb-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length > 0 ? (
                                        filteredExpenses.map(expense => {
                                            const category = categories.find(c => c.id === expense.category);
                                            return (
                                                <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-4">
                                                        <span className="font-medium text-gray-900 dark:text-white">{expense.description}</span>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                                                            style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                                                            {category?.icon} {category?.name}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                                                        {format(new Date(expense.date), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="py-4 text-right font-semibold text-gray-900 dark:text-white">
                                                        ₹{expense.amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(expense)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <Edit2 size={16} className="text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(expense.id)}
                                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                            >
                                                                <Trash2 size={16} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                                No expenses found. Click "Add" to create one!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="text-primary-500" size={20} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">By Category</h3>
                        </div>
                        {Object.keys(categoryTotals).length > 0 ? (
                            <Doughnut
                                data={chartData}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                padding: 20
                                            }
                                        }
                                    },
                                    cutout: '60%'
                                }}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                No data to display
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); resetForm(); }}
                title={editingExpense ? 'Edit Expense' : 'Add Expense'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="input"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-3 rounded-xl text-center transition-all ${formData.category === cat.id
                                        ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    title={cat.name}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            placeholder="What was this expense for?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-expense flex-1">
                            {editingExpense ? 'Update' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Budget Modal */}
            <Modal
                isOpen={showBudgetModal}
                onClose={() => setShowBudgetModal(false)}
                title="Set Monthly Budget"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Monthly Budget (₹)
                        </label>
                        <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            className="input"
                            placeholder="Enter your monthly budget"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setShowBudgetModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button onClick={handleBudgetSave} className="btn-expense flex-1">
                            Save Budget
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
