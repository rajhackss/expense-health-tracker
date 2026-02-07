import Header from '../components/layout/Header';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useHealth } from '../context/HealthContext';
import {
    Sun,
    Moon,
    Download,
    Upload,
    Trash2,
    Database,
    Palette
} from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
    const { darkMode, toggleDarkMode } = useTheme();
    const { expenses, monthlyBudget } = useExpenses();
    const { healthLogs, workouts, goals } = useHealth();

    const [exportStatus, setExportStatus] = useState('');

    const exportData = () => {
        const data = {
            expenses,
            monthlyBudget,
            healthLogs,
            workouts,
            healthGoals: goals,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifesync-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus('Data exported successfully!');
        setTimeout(() => setExportStatus(''), 3000);
    };

    const clearLocalData = () => {
        if (confirm('Are you sure you want to clear all local data? This will reset your budget and goals settings.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen">
            <Header title="Settings" />

            <div className="p-6 max-w-3xl">
                <div className="space-y-6">
                    {/* Appearance */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Palette className="text-purple-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
                                <p className="text-sm text-gray-500">Customize how the app looks</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                {darkMode ? <Moon className="text-indigo-500" size={20} /> : <Sun className="text-amber-500" size={20} />}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                    <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-14 h-7 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'left-8' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Database className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
                                <p className="text-sm text-gray-500">Export or manage your data</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Data Stats */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
                                    <p className="text-sm text-gray-500">Expenses</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthLogs.length}</p>
                                    <p className="text-sm text-gray-500">Health Logs</p>
                                </div>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportData}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl 
                  bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 
                  hover:bg-emerald-500/20 transition-colors font-medium"
                            >
                                <Download size={20} />
                                Export All Data (JSON)
                            </button>

                            {exportStatus && (
                                <p className="text-center text-emerald-500 text-sm animate-fade-in">{exportStatus}</p>
                            )}

                            {/* Clear Local Data */}
                            <button
                                onClick={clearLocalData}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl 
                  bg-red-500/10 text-red-600 dark:text-red-400 
                  hover:bg-red-500/20 transition-colors font-medium"
                            >
                                <Trash2 size={20} />
                                Clear Local Settings
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                This only clears local settings (budget, goals). Cloud data remains in Firebase.
                            </p>
                        </div>
                    </div>

                    {/* About */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About LifeSync</h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>Version 1.0.0</p>
                            <p>A comprehensive life tracking application for managing expenses, health, and daily journaling.</p>
                            <p className="pt-2">
                                Built with React, Tailwind CSS, and Firebase ❤️
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
