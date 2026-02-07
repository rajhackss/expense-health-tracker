import Header from '../components/layout/Header';
import { useExpenses } from '../context/ExpenseContext';
import { useHealth } from '../context/HealthContext';
import {
    Wallet,
    Heart,
    TrendingUp,
    TrendingDown,
    Droplets,
    Moon,
    Footprints,
    Flame
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
    const { expenses, getMonthlyTotal, monthlyBudget } = useExpenses();
    const { healthLogs, workouts, getTodayLog, goals } = useHealth();

    const monthlyTotal = getMonthlyTotal();
    const budgetUsed = (monthlyTotal / monthlyBudget) * 100;
    const todayHealth = getTodayLog();

    // Recent entries
    const recentExpenses = expenses.slice(0, 5);
    const recentWorkouts = workouts.slice(0, 3);

    return (
        <div className="min-h-screen">
            <Header title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {/* Expense Card */}
                    <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Expenses</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{monthlyTotal.toLocaleString()}
                                </h3>
                                <div className="flex items-center gap-1 mt-2">
                                    {budgetUsed > 80 ? (
                                        <TrendingUp size={16} className="text-red-500" />
                                    ) : (
                                        <TrendingDown size={16} className="text-emerald-500" />
                                    )}
                                    <span className={`text-sm ${budgetUsed > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {budgetUsed.toFixed(0)}% of budget
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Wallet className="text-emerald-500" size={24} />
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${budgetUsed > 80 ? 'bg-red-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Health</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {todayHealth ? 'Tracked' : 'Not Tracked'}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Droplets size={14} className="text-blue-500" />
                                        {todayHealth?.water || 0}/{goals.water}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Moon size={14} className="text-indigo-500" />
                                        {todayHealth?.sleep || 0}h
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Heart className="text-rose-500" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Expenses */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Expenses</h3>
                            <span className="text-sm text-primary-500">View all</span>
                        </div>
                        <div className="space-y-3">
                            {recentExpenses.length > 0 ? (
                                recentExpenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{expense.categoryIcon || '💰'}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{expense.description}</p>
                                                <p className="text-xs text-gray-500">{format(new Date(expense.date), 'MMM d')}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            ₹{expense.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No expenses yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Workouts */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Workouts</h3>
                            <span className="text-sm text-primary-500">View all</span>
                        </div>
                        <div className="space-y-3">
                            {recentWorkouts.length > 0 ? (
                                recentWorkouts.map(workout => (
                                    <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{workout.icon || '🏃'}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{workout.name}</p>
                                                <p className="text-xs text-gray-500">{workout.duration} mins</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-orange-500">
                                            <Flame size={14} />
                                            {workout.caloriesBurned} cal
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No workouts yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <a href="/expenses" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                            <Wallet className="text-emerald-500" size={28} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Expense</span>
                        </a>
                        <a href="/health" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer">
                            <Footprints className="text-rose-500" size={28} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Log Health</span>
                        </a>
                        <a href="/health" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors cursor-pointer">
                            <Flame className="text-orange-500" size={28} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Workout</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
