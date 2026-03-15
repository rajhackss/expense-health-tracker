import Header from '../components/layout/Header';
import { useExpenses } from '../context/ExpenseContext';
import { useHealth } from '../context/HealthContext';
import Modal from '../components/shared/Modal';
import { useState } from 'react';

import {
    Wallet,
    Heart,
    TrendingUp,
    TrendingDown,
    Droplets,
    Moon,
    Flame,
    Apple
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
    const { expenses, getMonthlyTotal, monthlyBudget } = useExpenses();
    const { healthLogs, workouts, getTodayLog, getTodayCalories, goals } = useHealth();

    const [showAllExpensesModal, setShowAllExpensesModal] = useState(false);
    const [showAllWorkoutsModal, setShowAllWorkoutsModal] = useState(false);

    const monthlyTotal = getMonthlyTotal();
    const budgetUsed = (monthlyTotal / monthlyBudget) * 100;
    const todayHealth = getTodayLog();
    const todayCalories = getTodayCalories();

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
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Flame size={14} className="text-emerald-500" />
                                        {todayCalories} kcal
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Heart className="text-rose-500" size={24} />
                            </div>
                        </div>
                        {/* Calorie Progress */}
                        {todayCalories > 0 && (
                            <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${todayCalories > (goals.calories || 2000) ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min((todayCalories / (goals.calories || 2000)) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Expenses */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Expenses</h3>
                            <button 
                                onClick={() => setShowAllExpensesModal(true)}
                                className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-semibold"
                            >
                                View all
                            </button>
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
                            <button 
                                onClick={() => setShowAllWorkoutsModal(true)}
                                className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-semibold"
                            >
                                View all
                            </button>
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

                {/* Importance of Fitness Video */}
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Importance of Fitness</h3>
                    </div>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                        <iframe 
                            className="absolute top-0 left-0 w-full h-full" 
                            src="https://www.youtube.com/embed/5m6qpyeDrqI?si=p8DBi2pco0ZrrvnQ" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>

            {/* All Expenses Modal */}
            <Modal isOpen={showAllExpensesModal} onClose={() => setShowAllExpensesModal(false)} title="All Expenses">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {expenses.length > 0 ? (
                        expenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{expense.categoryIcon || '💰'}</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{expense.description}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    ₹{expense.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No expenses logged yet</p>
                    )}
                </div>
                <div className="pt-4">
                    <button onClick={() => setShowAllExpensesModal(false)} className="btn-secondary w-full">Close</button>
                </div>
            </Modal>

            {/* All Workouts Modal */}
            <Modal isOpen={showAllWorkoutsModal} onClose={() => setShowAllWorkoutsModal(false)} title="All Workouts">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {workouts.length > 0 ? (
                        workouts.map(workout => (
                            <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{workout.icon || '🏃'}</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{workout.name}</p>
                                        <p className="text-xs text-gray-500">{workout.duration} mins • {format(new Date(workout.date), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 text-sm text-orange-500 font-medium">
                                    <Flame size={14} />
                                    {workout.caloriesBurned} cal
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No workouts logged yet</p>
                    )}
                </div>
                <div className="pt-4">
                    <button onClick={() => setShowAllWorkoutsModal(false)} className="btn-secondary w-full">Close</button>
                </div>
            </Modal>
        </div>
    );
}
