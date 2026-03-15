import { useState, useMemo } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/shared/Modal';
import { useHealth, WORKOUT_TYPES, FOOD_DATABASE, GYM_EXERCISES, DAYS_OF_WEEK, MEAL_TYPES } from '../context/HealthContext';
import {
    Plus, Trash2, Droplets, Moon, Footprints, Scale, Flame,
    Target, TrendingUp, UtensilsCrossed, Dumbbell, Apple,
    ChevronDown, ChevronUp, Calendar, BarChart2
} from 'lucide-react';
import { format } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, Title, Tooltip, Legend, Filler
);

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'health', label: 'Health', icon: '🩺' },
    { id: 'food', label: 'Food Calories', icon: '🥗' },
    { id: 'gym', label: 'Gym Planner', icon: '🏋️' },
];

export default function Health() {
    const {
        healthLogs, workouts, foodLogs, gymRoutines, loading, goals,
        addHealthLog, deleteHealthLog, addWorkout, deleteWorkout,
        addFoodLog, deleteFoodLog, addGymRoutine, deleteGymRoutine,
        updateGoals, getTodayLog, getTodayCalories,
        workoutTypes

    } = useHealth();

    const [activeTab, setActiveTab] = useState('health');

    // ── Health modals ──
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);

    // ── Food modals ──
    const [showFoodModal, setShowFoodModal] = useState(false);

    // ── Gym modals ──
    const [showGymModal, setShowGymModal] = useState(false);
    const [showAllWorkoutsModal, setShowAllWorkoutsModal] = useState(false);
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');

    // ── Forms ──
    const [healthForm, setHealthForm] = useState({
        weight: '', water: '', sleep: '', steps: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [workoutForm, setWorkoutForm] = useState({
        type: 'running', duration: '', notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const [goalsForm, setGoalsForm] = useState(goals);

    const [foodForm, setFoodForm] = useState({
        name: '', category: 'vegetarian', calories: '',
        mealType: 'Breakfast', date: format(new Date(), 'yyyy-MM-dd')
    });

    const [gymForm, setGymForm] = useState({
        muscleGroup: 'chest', exercise: '', sets: '3',
        reps: '10', weight: '', scheduleDays: [], notes: ''
    });

    const todayLog = getTodayLog();
    const todayCalories = getTodayCalories();

    // ── Handlers ──
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
        setHealthForm({ weight: '', water: '', sleep: '', steps: '', date: format(new Date(), 'yyyy-MM-dd') });
    };

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        const workoutType = workoutTypes.find(w => w.id === workoutForm.type);
        await addWorkout({
            type: workoutForm.type, name: workoutType?.name,
            icon: workoutType?.icon, duration: parseInt(workoutForm.duration),
            notes: workoutForm.notes, date: workoutForm.date
        });
        setShowWorkoutModal(false);
        setWorkoutForm({ type: 'running', duration: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') });
    };

    const handleGoalsSave = () => {
        updateGoals(goalsForm);
        setShowGoalsModal(false);
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        await addFoodLog({
            name: foodForm.name, category: foodForm.category,
            calories: parseInt(foodForm.calories) || 0,
            mealType: foodForm.mealType, date: foodForm.date
        });
        setShowFoodModal(false);
        setFoodForm({ name: '', category: 'vegetarian', calories: '', mealType: 'Breakfast', date: format(new Date(), 'yyyy-MM-dd') });
    };

    const handleGymSubmit = async (e) => {
        e.preventDefault();
        const group = GYM_EXERCISES[gymForm.muscleGroup];
        await addGymRoutine({
            muscleGroup: gymForm.muscleGroup,
            muscleGroupLabel: group?.label || gymForm.muscleGroup,
            muscleGroupIcon: group?.icon || '💪',
            exercise: gymForm.exercise,
            sets: parseInt(gymForm.sets) || 0,
            reps: parseInt(gymForm.reps) || 0,
            weight: parseFloat(gymForm.weight) || 0,
            scheduleDays: gymForm.scheduleDays,
            notes: gymForm.notes
        });
        setShowGymModal(false);
        setGymForm({ muscleGroup: 'chest', exercise: '', sets: '3', reps: '10', weight: '', scheduleDays: [], notes: '' });
    };

    const toggleScheduleDay = (day) => {
        setGymForm(prev => ({
            ...prev,
            scheduleDays: prev.scheduleDays.includes(day)
                ? prev.scheduleDays.filter(d => d !== day)
                : [...prev.scheduleDays, day]
        }));
    };

    const selectQuickFood = (food, category) => {
        setFoodForm(prev => ({ ...prev, name: food.name, calories: food.calories.toString(), category }));
    };

    // ── Chart data ──
    const last7Logs = healthLogs.slice(0, 7).reverse();

    const weightChartData = {
        labels: last7Logs.map(log => format(new Date(log.date), 'MMM d')),
        datasets: [{ label: 'Weight (kg)', data: last7Logs.map(l => l.weight), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.1)', fill: true, tension: 0.4 }]
    };

    const waterChartData = {
        labels: last7Logs.map(log => format(new Date(log.date), 'MMM d')),
        datasets: [{ label: 'Water (glasses)', data: last7Logs.map(l => l.water), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }]
    };

    const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false }, x: { grid: { display: false } } } };

    // ── Calorie chart (last 7 days per day) ──
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const calorieChartData = {
        labels: last7Days.map(d => format(d, 'EEE')),
        datasets: [{
            label: 'Calories',
            data: last7Days.map(day => {
                const dayStr = day.toDateString();
                return foodLogs.filter(f => new Date(f.date).toDateString() === dayStr)
                    .reduce((s, f) => s + (f.calories || 0), 0);
            }),
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderColor: '#10b981', borderWidth: 1, borderRadius: 6
        }]
    };

    const calorieChartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } };

    // ── Meal breakdown ──
    const todayFoodLogs = foodLogs.filter(f => new Date(f.date).toDateString() === new Date().toDateString());
    const mealBreakdown = MEAL_TYPES.reduce((acc, meal) => {
        acc[meal] = todayFoodLogs.filter(f => f.mealType === meal).reduce((s, f) => s + f.calories, 0);
        return acc;
    }, {});

    // ── Stats ──
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // ── Gym schedule grouping ──
    const gymByDay = useMemo(() => {
        const map = {};
        DAYS_OF_WEEK.forEach(day => { map[day] = []; });
        gymRoutines.forEach(r => {
            (r.scheduleDays || []).forEach(day => {
                if (map[day]) map[day].push(r);
            });
        });
        return map;
    }, [gymRoutines]);

    const dietPlan = [
        { day: 'Day 1', title: 'High Protein', desc: 'Grilled chicken breast, Quinoa, Steamed broccoli', icon: '🍗', color: 'bg-rose-500/10 text-rose-500' },
        { day: 'Day 2', title: 'Low Carb', desc: 'Baked salmon, Asparagus, Avocado salad', icon: '🥑', color: 'bg-green-500/10 text-green-500' },
        { day: 'Day 3', title: 'Balanced', desc: 'Turkey wrap with whole wheat, Sweet potato', icon: '🥪', color: 'bg-blue-500/10 text-blue-500' },
        { day: 'Day 4', title: 'Plant-Based', desc: 'Lentil soup, Tofu stir-fry, Brown rice', icon: '🥬', color: 'bg-emerald-500/10 text-emerald-500' },
        { day: 'Day 5', title: 'Lean Muscle', desc: 'Greek yogurt with berries, Lean steak, Veggies', icon: '🥩', color: 'bg-red-500/10 text-red-500' },
        { day: 'Day 6', title: 'Recovery', desc: 'Oatmeal with protein powder, Mixed nuts', icon: '🥣', color: 'bg-orange-500/10 text-orange-500' },
    ];

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
                {/* ── TAB NAV ──────────────────────────────────────────── */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════════
                    HEALTH TAB
                ══════════════════════════════════════════════════════════ */}
                {activeTab === 'health' && (
                    <>
                        {/* Today's Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard
                                icon={<Droplets className="text-blue-500" size={20} />}
                                iconBg="bg-blue-500/10"
                                label="Water" value={`${todayLog?.water || 0}/${goals.water}`}
                                progress={(todayLog?.water || 0) / goals.water}
                                barColor="bg-blue-500"
                            />
                            <MetricCard
                                icon={<Moon className="text-indigo-500" size={20} />}
                                iconBg="bg-indigo-500/10"
                                label="Sleep" value={`${todayLog?.sleep || 0}h`}
                                progress={(todayLog?.sleep || 0) / goals.sleep}
                                barColor="bg-indigo-500"
                            />
                            <MetricCard
                                icon={<Footprints className="text-green-500" size={20} />}
                                iconBg="bg-green-500/10"
                                label="Steps" value={(todayLog?.steps || 0).toLocaleString()}
                                progress={(todayLog?.steps || 0) / goals.steps}
                                barColor="bg-green-500"
                            />
                            <MetricCard
                                icon={<Scale className="text-rose-500" size={20} />}
                                iconBg="bg-rose-500/10"
                                label="Weight" value={`${todayLog?.weight || '--'} kg`}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setShowHealthModal(true)} className="btn-health flex items-center gap-2">
                                <Plus size={18} /> Log Health
                            </button>
                            <button onClick={() => setShowWorkoutModal(true)} className="btn bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 flex items-center gap-2">
                                <Flame size={18} /> Add Workout
                            </button>
                            <button onClick={() => { setGoalsForm(goals); setShowGoalsModal(true); }} className="btn-secondary flex items-center gap-2">
                                <Target size={18} /> Set Goals
                            </button>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="text-rose-500" size={20} />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Weight Trend</h3>
                                </div>
                                {last7Logs.length > 0
                                    ? <Line data={weightChartData} options={chartOptions} />
                                    : <EmptyChart msg="Log your weight to see trends" />}
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-2 mb-4">
                                    <Droplets className="text-blue-500" size={20} />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Water Intake</h3>
                                </div>
                                {last7Logs.length > 0
                                    ? <Line data={waterChartData} options={chartOptions} />
                                    : <EmptyChart msg="Log your water intake to see trends" />}
                            </div>
                        </div>

                        {/* Workouts */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                <div className="lg:col-span-2 card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Workouts</h3>
                                        {workouts.length > 5 && (
                                            <button 
                                                onClick={() => setShowAllWorkoutsModal(true)}
                                                className="text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
                                            >
                                                View all
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {workouts.slice(0, 5).length > 0 ? (
                                            workouts.slice(0, 5).map(workout => (
                                                <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{workout.icon}</span>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{workout.name}</p>
                                                            <p className="text-sm text-gray-500">{workout.duration} mins • {format(new Date(workout.date), 'MMM d')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1 text-orange-500 font-medium">
                                                            <Flame size={16} /> {workout.caloriesBurned} cal
                                                        </span>
                                                        <button onClick={() => deleteWorkout(workout.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
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

                            {/* 6-Day Diet Plan */}
                            <div className="card">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-2xl">🥗</span>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">6-Day Diet Plan</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dietPlan.map((day, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{day.day}</p>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                                                </div>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${day.color}`}>
                                                    {day.icon}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{day.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Health Log History */}
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
                                                    <td className="py-3 text-gray-900 dark:text-white">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                                                    <td className="py-3">{log.weight} kg</td>
                                                    <td className="py-3">{log.water} glasses</td>
                                                    <td className="py-3">{log.sleep} hours</td>
                                                    <td className="py-3">{log.steps?.toLocaleString()}</td>
                                                    <td className="py-3 text-right">
                                                        <button onClick={() => deleteHealthLog(log.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
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
                    </>
                )}

                {/* ══════════════════════════════════════════════════════════
                    FOOD CALORIES TAB
                ══════════════════════════════════════════════════════════ */}
                {activeTab === 'food' && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Today's Calories */}
                            <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white col-span-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <p className="text-emerald-100 text-sm">Today's Calories</p>
                                        <p className="text-3xl font-bold">{todayCalories.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-emerald-100 mb-2">Goal: {goals.calories?.toLocaleString() || 2000} kcal</div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min((todayCalories / (goals.calories || 2000)) * 100, 100)}%` }} />
                                </div>
                            </div>

                            {/* Meal Breakdown */}
                            {MEAL_TYPES.map(meal => {
                                const mealIcons = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };
                                const mealColors = { Breakfast: 'text-yellow-500 bg-yellow-500/10', Lunch: 'text-orange-500 bg-orange-500/10', Dinner: 'text-indigo-500 bg-indigo-500/10', Snack: 'text-green-500 bg-green-500/10' };
                                return (
                                    <div key={meal} className="card flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${mealColors[meal]}`}>
                                            {mealIcons[meal]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{meal}</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">{mealBreakdown[meal] || 0} kcal</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart + Log Button */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart2 size={20} className="text-emerald-500" /> Calorie Trends (7 days)
                            </h2>
                            <button onClick={() => setShowFoodModal(true)} className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2">
                                <Plus size={18} /> Log Food
                            </button>
                        </div>

                        <div className="card">
                            {foodLogs.length > 0
                                ? <Bar data={calorieChartData} options={calorieChartOptions} />
                                : <EmptyChart msg="Log your meals to see calorie trends" />}
                        </div>

                        {/* Food Log History */}
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <UtensilsCrossed size={18} className="text-emerald-500" /> Food Log History
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 font-medium">Food</th>
                                            <th className="pb-3 font-medium">Type</th>
                                            <th className="pb-3 font-medium">Meal</th>
                                            <th className="pb-3 font-medium">Calories</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foodLogs.slice(0, 15).length > 0 ? (
                                            foodLogs.slice(0, 15).map(log => (
                                                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800">
                                                    <td className="py-3 font-medium text-gray-900 dark:text-white">{log.name}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.category === 'vegetarian' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                            {log.category === 'vegetarian' ? '🥦 Veg' : '🍗 Non-Veg'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-600 dark:text-gray-400">{log.mealType}</td>
                                                    <td className="py-3 font-semibold text-emerald-500">{log.calories} kcal</td>
                                                    <td className="py-3 text-gray-500">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                                                    <td className="py-3 text-right">
                                                        <button onClick={() => deleteFoodLog(log.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                                    No food logs yet. Start tracking your meals!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════════════════
                    GYM WORKOUT PLANNER TAB
                ══════════════════════════════════════════════════════════ */}
                {activeTab === 'gym' && (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card bg-gradient-to-br from-violet-500 to-purple-600 text-white col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-violet-100 text-sm">Total Routines Planned</p>
                                        <p className="text-4xl font-bold mt-1">{gymRoutines.length}</p>
                                        <p className="text-violet-200 text-sm mt-2">
                                            {Object.values(gymByDay).filter(arr => arr.length > 0).length} active days/week
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">🏋️</div>
                                </div>
                            </div>
                            {Object.entries(GYM_EXERCISES).slice(0, 2).map(([key, group]) => (
                                <div key={key} className="card">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${group.color}`}>
                                        {group.icon}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.label}</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {gymRoutines.filter(r => r.muscleGroup === key).length} exercises
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Add Routine Button */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={20} className="text-violet-500" /> Weekly Schedule
                            </h2>
                            <button
                                onClick={() => setShowGymModal(true)}
                                className="btn bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-600 hover:to-purple-700 flex items-center gap-2"
                            >
                                <Plus size={18} /> Plan Workout
                            </button>
                        </div>

                        {/* Muscle Group Cards — quick overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {Object.entries(GYM_EXERCISES).map(([key, group]) => (
                                <button
                                    key={key}
                                    onClick={() => { setSelectedMuscleGroup(key); setGymForm(prev => ({ ...prev, muscleGroup: key, exercise: '' })); setShowGymModal(true); }}
                                    className={`p-3 rounded-xl text-center transition-all hover:scale-105 border border-transparent hover:border-violet-200 dark:hover:border-violet-800 bg-gray-50 dark:bg-gray-800 group`}
                                >
                                    <span className={`block text-2xl mb-1`}>{group.icon}</span>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{group.label}</span>
                                    <span className="block text-xs text-gray-400 mt-0.5">{gymRoutines.filter(r => r.muscleGroup === key).length} exercises</span>
                                </button>
                            ))}
                        </div>

                        {/* Weekly Schedule View */}
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-violet-500" /> Weekly Training Plan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day} className="min-h-[120px]">
                                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 text-center">
                                            {day.slice(0, 3)}
                                        </div>
                                        <div className="space-y-2">
                                            {gymByDay[day].length > 0 ? gymByDay[day].map(routine => (
                                                <div key={routine.id} className={`p-2 rounded-lg text-xs ${GYM_EXERCISES[routine.muscleGroup]?.color || 'bg-gray-100 text-gray-600'} dark:bg-opacity-20`}>
                                                    <div className="font-semibold truncate">{routine.exercise}</div>
                                                    <div className="text-gray-500 dark:text-gray-400">{routine.sets}×{routine.reps}</div>
                                                </div>
                                            )) : (
                                                <div className="h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600 text-xl">
                                                    +
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All Routines List */}
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Dumbbell size={18} className="text-violet-500" /> All Planned Exercises
                            </h3>
                            <div className="space-y-3">
                                {gymRoutines.length > 0 ? gymRoutines.map(routine => (
                                    <div key={routine.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${GYM_EXERCISES[routine.muscleGroup]?.color || 'bg-gray-200'}`}>
                                                {routine.muscleGroupIcon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{routine.exercise}</p>
                                                <p className="text-sm text-gray-500">{routine.muscleGroupLabel}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{routine.sets}</p>
                                                <p className="text-xs text-gray-500">Sets</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{routine.reps}</p>
                                                <p className="text-xs text-gray-500">Reps</p>
                                            </div>
                                            {routine.weight > 0 && (
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{routine.weight}</p>
                                                    <p className="text-xs text-gray-500">kg</p>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                                                {(routine.scheduleDays || []).map(d => (
                                                    <span key={d} className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-xs font-medium">
                                                        {d.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={() => deleteGymRoutine(routine.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-500 py-12">
                                        No gym routines planned yet. Click "Plan Workout" to get started!
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════════ */}

            {/* Health Log Modal */}
            <Modal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} title="Log Health">
                <form onSubmit={handleHealthSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Weight (kg)', key: 'weight', type: 'number', step: '0.1', ph: 'e.g., 70.5' },
                            { label: 'Water (glasses)', key: 'water', type: 'number', ph: 'e.g., 8' },
                            { label: 'Sleep (hours)', key: 'sleep', type: 'number', step: '0.5', ph: 'e.g., 7.5' },
                            { label: 'Steps', key: 'steps', type: 'number', ph: 'e.g., 10000' },
                        ].map(({ label, key, type, step, ph }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                                <input type={type} step={step} value={healthForm[key]}
                                    onChange={e => setHealthForm({ ...healthForm, [key]: e.target.value })}
                                    className="input" placeholder={ph} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                        <input type="date" value={healthForm.date}
                            onChange={e => setHealthForm({ ...healthForm, date: e.target.value })} className="input" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowHealthModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-health flex-1">Save Log</button>
                    </div>
                </form>
            </Modal>

            {/* Workout Modal */}
            <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Add Workout">
                <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workout Type</label>
                        <div className="grid grid-cols-5 gap-2">
                            {workoutTypes.map(type => (
                                <button key={type.id} type="button"
                                    onClick={() => setWorkoutForm({ ...workoutForm, type: type.id })}
                                    className={`p-3 rounded-xl text-center transition-all ${workoutForm.type === type.id ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                    title={type.name}>
                                    <span className="text-xl">{type.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                        <input type="number" value={workoutForm.duration}
                            onChange={e => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                            className="input" placeholder="e.g., 30" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                        <input type="text" value={workoutForm.notes}
                            onChange={e => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                            className="input" placeholder="How did it go?" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                        <input type="date" value={workoutForm.date}
                            onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })} className="input" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowWorkoutModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-1">Add Workout</button>
                    </div>
                </form>
            </Modal>

            {/* Goals Modal */}
            <Modal isOpen={showGoalsModal} onClose={() => setShowGoalsModal(false)} title="Set Health Goals">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Daily Water (glasses)', key: 'water', type: 'number', parse: parseInt },
                            { label: 'Daily Sleep (hours)', key: 'sleep', type: 'number', step: '0.5', parse: parseFloat },
                            { label: 'Daily Steps', key: 'steps', type: 'number', parse: parseInt },
                            { label: 'Target Weight (kg)', key: 'weight', type: 'number', step: '0.1', parse: parseFloat },
                            { label: 'Daily Calories (kcal)', key: 'calories', type: 'number', parse: parseInt },
                        ].map(({ label, key, type, step, parse }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                                <input type={type} step={step} value={goalsForm[key] || ''}
                                    onChange={e => setGoalsForm({ ...goalsForm, [key]: parse(e.target.value) })}
                                    className="input" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setShowGoalsModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleGoalsSave} className="btn-health flex-1">Save Goals</button>
                    </div>
                </div>
            </Modal>

            {/* Food Log Modal */}
            <Modal isOpen={showFoodModal} onClose={() => setShowFoodModal(false)} title="Log Food">
                <form onSubmit={handleFoodSubmit} className="space-y-4">
                    {/* Veg / Non-Veg Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Food Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'vegetarian', label: '🥦 Vegetarian', active: 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/30' },
                                { value: 'nonVegetarian', label: '🍗 Non-Vegetarian', active: 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-900/30' }
                            ].map(opt => (
                                <button key={opt.value} type="button"
                                    onClick={() => setFoodForm({ ...foodForm, category: opt.value })}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${foodForm.category === opt.value ? opt.active : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick food picks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Pick</label>
                        <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1">
                            {(FOOD_DATABASE[foodForm.category] || FOOD_DATABASE.vegetarian).map((food, i) => (
                                <button key={i} type="button"
                                    onClick={() => selectQuickFood(food, foodForm.category)}
                                    className={`px-2 py-1.5 rounded-lg text-left text-xs transition-all border ${foodForm.name === food.name ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                    <span className="mr-1">{food.icon}</span>
                                    <span className="font-medium">{food.name}</span>
                                    <span className="block text-gray-400">{food.calories} kcal</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Input */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Food Name</label>
                            <input type="text" value={foodForm.name}
                                onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                                className="input" placeholder="e.g., Dal Rice" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories (kcal)</label>
                            <input type="number" value={foodForm.calories}
                                onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })}
                                className="input" placeholder="e.g., 350" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal Type</label>
                            <select value={foodForm.mealType}
                                onChange={e => setFoodForm({ ...foodForm, mealType: e.target.value })}
                                className="input">
                                {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                            <input type="date" value={foodForm.date}
                                onChange={e => setFoodForm({ ...foodForm, date: e.target.value })}
                                className="input" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowFoodModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex-1">Log Food</button>
                    </div>
                </form>
            </Modal>

            {/* Gym Routine Modal */}
            <Modal isOpen={showGymModal} onClose={() => setShowGymModal(false)} title="Plan Gym Workout">
                <form onSubmit={handleGymSubmit} className="space-y-4">
                    {/* Muscle Group */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Muscle Group</label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(GYM_EXERCISES).map(([key, group]) => (
                                <button key={key} type="button"
                                    onClick={() => setGymForm(prev => ({ ...prev, muscleGroup: key, exercise: '' }))}
                                    className={`p-2 rounded-xl text-center transition-all text-xs font-semibold ${gymForm.muscleGroup === key ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                    <span className="text-xl block mb-0.5">{group.icon}</span>
                                    {group.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Exercise */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercise</label>
                        <select value={gymForm.exercise}
                            onChange={e => setGymForm({ ...gymForm, exercise: e.target.value })}
                            className="input" required>
                            <option value="">Select an exercise…</option>
                            {GYM_EXERCISES[gymForm.muscleGroup]?.exercises.map(ex => (
                                <option key={ex} value={ex}>{ex}</option>
                            ))}
                            <option value="__custom__">Custom exercise…</option>
                        </select>
                        {gymForm.exercise === '__custom__' && (
                            <input type="text" className="input mt-2" placeholder="Enter exercise name"
                                onChange={e => setGymForm({ ...gymForm, exercise: e.target.value })} />
                        )}
                    </div>

                    {/* Sets / Reps / Weight */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sets</label>
                            <input type="number" min="1" value={gymForm.sets}
                                onChange={e => setGymForm({ ...gymForm, sets: e.target.value })}
                                className="input" placeholder="3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reps</label>
                            <input type="number" min="1" value={gymForm.reps}
                                onChange={e => setGymForm({ ...gymForm, reps: e.target.value })}
                                className="input" placeholder="10" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                            <input type="number" step="0.5" value={gymForm.weight}
                                onChange={e => setGymForm({ ...gymForm, weight: e.target.value })}
                                className="input" placeholder="60" />
                        </div>
                    </div>

                    {/* Schedule Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <button key={day} type="button"
                                    onClick={() => toggleScheduleDay(day)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${gymForm.scheduleDays.includes(day) ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                        <input type="text" value={gymForm.notes}
                            onChange={e => setGymForm({ ...gymForm, notes: e.target.value })}
                            className="input" placeholder="e.g., Focus on form, increase weight next week" />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowGymModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn bg-gradient-to-r from-violet-500 to-purple-600 text-white flex-1">Save Routine</button>
                    </div>
                </form>
            </Modal>

            {/* All Workouts Modal */}
            <Modal isOpen={showAllWorkoutsModal} onClose={() => setShowAllWorkoutsModal(false)} title="All Workouts">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {workouts.map(workout => (
                        <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{workout.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{workout.name}</p>
                                    <p className="text-sm text-gray-500">{workout.duration} mins • {format(new Date(workout.date), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-orange-500 font-medium">
                                    <Flame size={16} /> {workout.caloriesBurned} cal
                                </span>
                                <button onClick={() => deleteWorkout(workout.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4">
                    <button onClick={() => setShowAllWorkoutsModal(false)} className="btn-secondary w-full">Close</button>
                </div>
            </Modal>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function MetricCard({ icon, iconBg, label, value, progress, barColor }) {
    return (
        <div className="card">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>{icon}</div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>
            {progress !== undefined && (
                <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(progress * 100, 100)}%` }} />
                </div>
            )}
        </div>
    );
}

function EmptyChart({ msg }) {
    return <div className="h-48 flex items-center justify-center text-gray-500">{msg}</div>;
}
