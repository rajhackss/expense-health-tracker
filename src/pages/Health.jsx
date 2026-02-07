import { useState } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/shared/Modal';
import { useHealth, WORKOUT_TYPES } from '../context/HealthContext';
import {
    Plus,
    Trash2,
    Droplets,
    Moon,
    Footprints,
    Scale,
    Flame,
    Target,
    TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Health() {
    const {
        healthLogs,
        workouts,
        loading,
        goals,
        addHealthLog,
        deleteHealthLog,
        addWorkout,
        deleteWorkout,
        updateGoals,
        getTodayLog,
        workoutTypes
    } = useHealth();

    const [showHealthModal, setShowHealthModal] = useState(false);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);

    const [healthForm, setHealthForm] = useState({
        weight: '',
        water: '',
        sleep: '',
        steps: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [workoutForm, setWorkoutForm] = useState({
        type: 'running',
        duration: '',
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [goalsForm, setGoalsForm] = useState(goals);

    const todayLog = getTodayLog();

    const handleHealthSubmit = async (e) => {
        e.preventDefault();
        await addHealthLog({
            weight: parseFloat(healthForm.weight) || 0,
            water: parseInt(healthForm.water) || 0,
            sleep: parseFloat(healthForm.sleep) || 0,
            steps: parseInt(healthForm.steps) || 0,
            date: healthForm.date
        });
        setShowHealthModal(false);
        setHealthForm({
            weight: '',
            water: '',
            sleep: '',
            steps: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        const workoutType = workoutTypes.find(w => w.id === workoutForm.type);
        await addWorkout({
            type: workoutForm.type,
            name: workoutType?.name,
            icon: workoutType?.icon,
            duration: parseInt(workoutForm.duration),
            notes: workoutForm.notes,
            date: workoutForm.date
        });
        setShowWorkoutModal(false);
        setWorkoutForm({
            type: 'running',
            duration: '',
            notes: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const handleGoalsSave = () => {
        updateGoals(goalsForm);
        setShowGoalsModal(false);
    };

    // Chart data - last 7 days
    const last7Logs = healthLogs.slice(0, 7).reverse();

    const weightChartData = {
        labels: last7Logs.map(log => format(new Date(log.date), 'MMM d')),
        datasets: [{
            label: 'Weight (kg)',
            data: last7Logs.map(log => log.weight),
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const waterChartData = {
        labels: last7Logs.map(log => format(new Date(log.date), 'MMM d')),
        datasets: [{
            label: 'Water (glasses)',
            data: last7Logs.map(log => log.water),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: false },
            x: { grid: { display: false } }
        }
    };

    // Calculate totals
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header title="Health Tracker" />

            <div className="p-6 space-y-6">
                {/* Today's Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Droplets className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Water</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {todayLog?.water || 0}/{goals.water}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.min(((todayLog?.water || 0) / goals.water) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Moon className="text-indigo-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sleep</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {todayLog?.sleep || 0}h
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${Math.min(((todayLog?.sleep || 0) / goals.sleep) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Footprints className="text-green-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Steps</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {(todayLog?.steps || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${Math.min(((todayLog?.steps || 0) / goals.steps) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Scale className="text-rose-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {todayLog?.weight || '--'} kg
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setShowHealthModal(true)} className="btn-health flex items-center gap-2">
                        <Plus size={18} />
                        Log Health
                    </button>
                    <button onClick={() => setShowWorkoutModal(true)} className="btn bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 flex items-center gap-2">
                        <Flame size={18} />
                        Add Workout
                    </button>
                    <button onClick={() => { setGoalsForm(goals); setShowGoalsModal(true); }} className="btn-secondary flex items-center gap-2">
                        <Target size={18} />
                        Set Goals
                    </button>
                </div>

                {/* Charts and Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weight Chart */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-rose-500" size={20} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Weight Trend</h3>
                        </div>
                        {last7Logs.length > 0 ? (
                            <Line data={weightChartData} options={chartOptions} />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Log your weight to see trends
                            </div>
                        )}
                    </div>

                    {/* Water Chart */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="text-blue-500" size={20} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Water Intake</h3>
                        </div>
                        {last7Logs.length > 0 ? (
                            <Line data={waterChartData} options={chartOptions} />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                Log your water intake to see trends
                            </div>
                        )}
                    </div>
                </div>

                {/* Workouts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats */}
                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <h3 className="font-semibold mb-4">Workout Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-orange-100 text-sm">Total Workouts</p>
                                <p className="text-3xl font-bold">{totalWorkouts}</p>
                            </div>
                            <div>
                                <p className="text-orange-100 text-sm">Calories Burned</p>
                                <p className="text-3xl font-bold">{totalCaloriesBurned.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Workouts */}
                    <div className="lg:col-span-2 card">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
                        <div className="space-y-3">
                            {workouts.slice(0, 5).length > 0 ? (
                                workouts.slice(0, 5).map(workout => (
                                    <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{workout.icon}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{workout.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {workout.duration} mins • {format(new Date(workout.date), 'MMM d')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-orange-500 font-medium">
                                                <Flame size={16} />
                                                {workout.caloriesBurned} cal
                                            </span>
                                            <button
                                                onClick={() => deleteWorkout(workout.id)}
                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No workouts logged yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Health Logs */}
                <div className="card">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Health Log History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Weight</th>
                                    <th className="pb-3 font-medium">Water</th>
                                    <th className="pb-3 font-medium">Sleep</th>
                                    <th className="pb-3 font-medium">Steps</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {healthLogs.slice(0, 10).length > 0 ? (
                                    healthLogs.slice(0, 10).map(log => (
                                        <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-3 text-gray-900 dark:text-white">
                                                {format(new Date(log.date), 'MMM d, yyyy')}
                                            </td>
                                            <td className="py-3">{log.weight} kg</td>
                                            <td className="py-3">{log.water} glasses</td>
                                            <td className="py-3">{log.sleep} hours</td>
                                            <td className="py-3">{log.steps?.toLocaleString()}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => deleteHealthLog(log.id)}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            No health logs yet. Start tracking today!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Health Log Modal */}
            <Modal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} title="Log Health">
                <form onSubmit={handleHealthSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={healthForm.weight}
                                onChange={(e) => setHealthForm({ ...healthForm, weight: e.target.value })}
                                className="input"
                                placeholder="e.g., 70.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Water (glasses)
                            </label>
                            <input
                                type="number"
                                value={healthForm.water}
                                onChange={(e) => setHealthForm({ ...healthForm, water: e.target.value })}
                                className="input"
                                placeholder="e.g., 8"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sleep (hours)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={healthForm.sleep}
                                onChange={(e) => setHealthForm({ ...healthForm, sleep: e.target.value })}
                                className="input"
                                placeholder="e.g., 7.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Steps
                            </label>
                            <input
                                type="number"
                                value={healthForm.steps}
                                onChange={(e) => setHealthForm({ ...healthForm, steps: e.target.value })}
                                className="input"
                                placeholder="e.g., 10000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={healthForm.date}
                            onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowHealthModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-health flex-1">
                            Save Log
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Workout Modal */}
            <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Add Workout">
                <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Workout Type
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {workoutTypes.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setWorkoutForm({ ...workoutForm, type: type.id })}
                                    className={`p-3 rounded-xl text-center transition-all ${workoutForm.type === type.id
                                            ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/30'
                                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    title={type.name}
                                >
                                    <span className="text-xl">{type.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            value={workoutForm.duration}
                            onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                            className="input"
                            placeholder="e.g., 30"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes (optional)
                        </label>
                        <input
                            type="text"
                            value={workoutForm.notes}
                            onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                            className="input"
                            placeholder="How did it go?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={workoutForm.date}
                            onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowWorkoutModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-1">
                            Add Workout
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Goals Modal */}
            <Modal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} title="Set Health Goals">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Daily Water (glasses)
                            </label>
                            <input
                                type="number"
                                value={goalsForm.water}
                                onChange={(e) => setGoalsForm({ ...goalsForm, water: parseInt(e.target.value) })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Daily Sleep (hours)
                            </label>
                            <input
                                type="number"
                                value={goalsForm.sleep}
                                onChange={(e) => setGoalsForm({ ...goalsForm, sleep: parseFloat(e.target.value) })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Daily Steps
                            </label>
                            <input
                                type="number"
                                value={goalsForm.steps}
                                onChange={(e) => setGoalsForm({ ...goalsForm, steps: parseInt(e.target.value) })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={goalsForm.weight}
                                onChange={(e) => setGoalsForm({ ...goalsForm, weight: parseFloat(e.target.value) })}
                                className="input"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setShowGoalsModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button onClick={handleGoalsSave} className="btn-health flex-1">
                            Save Goals
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
