import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    query,
    where,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const HealthContext = createContext();

export const WORKOUT_TYPES = [
    { id: 'running', name: 'Running', icon: '🏃', calPerMin: 10 },
    { id: 'gym', name: 'Gym/Weight Training', icon: '🏋️', calPerMin: 8 },
    { id: 'yoga', name: 'Yoga', icon: '🧘', calPerMin: 4 },
    { id: 'swimming', name: 'Swimming', icon: '🏊', calPerMin: 11 },
    { id: 'cycling', name: 'Cycling', icon: '🚴', calPerMin: 9 },
    { id: 'walking', name: 'Walking', icon: '🚶', calPerMin: 5 },
    { id: 'sports', name: 'Sports', icon: '⚽', calPerMin: 8 },
    { id: 'dancing', name: 'Dancing', icon: '💃', calPerMin: 7 },
    { id: 'home', name: 'Home Workout', icon: '🏠', calPerMin: 6 },
    { id: 'other', name: 'Other', icon: '🎯', calPerMin: 5 },
];

// Preset food database with calories per serving
export const FOOD_DATABASE = {
    vegetarian: [
        { name: 'Idli (2 pcs)', calories: 140, icon: '🍚' },
        { name: 'Dosa', calories: 168, icon: '🫓' },
        { name: 'Poha', calories: 250, icon: '🍲' },
        { name: 'Upma', calories: 220, icon: '🍲' },
        { name: 'Paratha (1 pc)', calories: 300, icon: '🫓' },
        { name: 'Dal Rice', calories: 350, icon: '🍛' },
        { name: 'Paneer Butter Masala', calories: 400, icon: '🧀' },
        { name: 'Rajma Chawal', calories: 380, icon: '🍛' },
        { name: 'Chole Bhature', calories: 500, icon: '🍞' },
        { name: 'Veg Pulao', calories: 300, icon: '🍚' },
        { name: 'Samosa (1 pc)', calories: 260, icon: '🥟' },
        { name: 'Pav Bhaji', calories: 430, icon: '🍞' },
        { name: 'Dhokla (4 pcs)', calories: 180, icon: '🟡' },
        { name: 'Aloo Sabzi + Roti', calories: 320, icon: '🥔' },
        { name: 'Mixed Veg Curry', calories: 180, icon: '🥦' },
        { name: 'Banana', calories: 105, icon: '🍌' },
        { name: 'Apple', calories: 95, icon: '🍎' },
        { name: 'Mango', calories: 202, icon: '🥭' },
        { name: 'Lassi (1 glass)', calories: 170, icon: '🥛' },
        { name: 'Masala Chai', calories: 80, icon: '🍵' },
        { name: 'Sprouts Salad', calories: 120, icon: '🥗' },
        { name: 'Greek Yogurt', calories: 130, icon: '🥛' },
        { name: 'Oatmeal', calories: 210, icon: '🥣' },
        { name: 'Brown Rice (1 cup)', calories: 215, icon: '🍚' },
        { name: 'Avocado Toast', calories: 250, icon: '🥑' },
    ],
    nonVegetarian: [
        { name: 'Chicken Biryani', calories: 490, icon: '🍗' },
        { name: 'Butter Chicken', calories: 430, icon: '🍗' },
        { name: 'Egg Curry + Rice', calories: 380, icon: '🍳' },
        { name: 'Boiled Eggs (2)', calories: 155, icon: '🥚' },
        { name: 'Omelette (2 eggs)', calories: 190, icon: '🍳' },
        { name: 'Chicken Sandwich', calories: 450, icon: '🥪' },
        { name: 'Fish Curry + Rice', calories: 400, icon: '🐟' },
        { name: 'Mutton Curry', calories: 520, icon: '🍖' },
        { name: 'Grilled Chicken (100g)', calories: 165, icon: '🍗' },
        { name: 'Prawn Masala', calories: 280, icon: '🦐' },
        { name: 'Chicken Tikka', calories: 240, icon: '🍢' },
        { name: 'Keema Paratha', calories: 420, icon: '🫓' },
        { name: 'Egg Bhurji + Roti', calories: 310, icon: '🍳' },
        { name: 'Tandoori Chicken (2 pcs)', calories: 300, icon: '🍗' },
        { name: 'Salmon (100g)', calories: 208, icon: '🐟' },
        { name: 'Tuna Salad', calories: 190, icon: '🥗' },
        { name: 'Chicken Roll', calories: 380, icon: '🌯' },
        { name: 'Mutton Biryani', calories: 560, icon: '🍖' },
        { name: 'Fish Fry (2 pcs)', calories: 290, icon: '🐠' },
        { name: 'Chicken Soup', calories: 150, icon: '🍜' },
    ]
};

// Gym exercise database by muscle group
export const GYM_EXERCISES = {
    chest: {
        label: 'Chest', icon: '💪', color: 'bg-red-500/10 text-red-500',
        exercises: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Push-ups', 'Chest Fly', 'Cable Crossover', 'Dips', 'Pec Deck', 'Chest Press Machine']
    },
    back: {
        label: 'Back', icon: '🔙', color: 'bg-blue-500/10 text-blue-500',
        exercises: ['Deadlift', 'Pull-ups', 'Lat Pulldown', 'Seated Cable Row', 'Bent Over Row', 'T-Bar Row', 'Single Arm Dumbbell Row', 'Hyperextension', 'Face Pull']
    },
    legs: {
        label: 'Legs', icon: '🦵', color: 'bg-green-500/10 text-green-500',
        exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl', 'Calf Raises', 'Romanian Deadlift', 'Hack Squat', 'Bulgarian Split Squat', 'Goblet Squat']
    },
    shoulders: {
        label: 'Shoulders', icon: '🏔️', color: 'bg-yellow-500/10 text-yellow-500',
        exercises: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly', 'Arnold Press', 'Upright Row', 'Shrugs', 'Cable Lateral Raise', 'Face Pull']
    },
    arms: {
        label: 'Arms', icon: '💪', color: 'bg-purple-500/10 text-purple-500',
        exercises: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Pushdown', 'Skull Crushers', 'Tricep Dips', 'Close-Grip Bench', 'Overhead Tricep Extension', 'Concentration Curl']
    },
    core: {
        label: 'Core', icon: '🎯', color: 'bg-orange-500/10 text-orange-500',
        exercises: ['Plank', 'Crunches', 'Bicycle Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollout', 'Cable Crunches', 'Mountain Climbers', 'Side Plank', 'Hanging Knee Raises']
    },
    fullbody: {
        label: 'Full Body', icon: '🔥', color: 'bg-rose-500/10 text-rose-500',
        exercises: ['Burpees', 'Clean and Press', 'Kettlebell Swings', 'Thrusters', 'Box Jumps', 'Battle Ropes', 'Sled Push', 'Farmer\'s Walk', 'Jump Squats', 'Medicine Ball Slam']
    }
};

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function HealthProvider({ children }) {
    const { user } = useAuth();
    const [healthLogs, setHealthLogs] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [foodLogs, setFoodLogs] = useState([]);
    const [gymRoutines, setGymRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState({
        water: 8,
        sleep: 8,
        steps: 10000,
        weight: 70,
        calories: 2000
    });

    // Sync goals with Firestore
    useEffect(() => {
        if (!user) {
            setGoals({ water: 8, sleep: 8, steps: 10000, weight: 70, calories: 2000 });
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.healthGoals) setGoals({ calories: 2000, ...data.healthGoals });
            } else {
                setDoc(userRef, {
                    healthGoals: { water: 8, sleep: 8, steps: 10000, weight: 70, calories: 2000 }
                }, { merge: true });
            }
        });

        return unsubscribe;
    }, [user]);

    // Health logs, workouts, food logs, gym routines — Firestore sync
    useEffect(() => {
        if (!user) {
            setHealthLogs([]);
            setWorkouts([]);
            setFoodLogs([]);
            setGymRoutines([]);
            setLoading(false);
            return;
        }

        const healthQuery = query(collection(db, 'healthLogs'), where('userId', '==', user.uid));
        const unsubHealth = onSnapshot(healthQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date)
            }));
            data.sort((a, b) => b.date - a.date);
            setHealthLogs(data);
            setLoading(false);
        }, (error) => { console.error("Error fetching health logs:", error); setLoading(false); });

        const workoutQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid));
        const unsubWorkout = onSnapshot(workoutQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now())
            }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setWorkouts(data);
        }, (error) => { console.error("Error fetching workouts:", error); });

        const foodQuery = query(collection(db, 'foodLogs'), where('userId', '==', user.uid));
        const unsubFood = onSnapshot(foodQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now())
            }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setFoodLogs(data);
        }, (error) => { console.error("Error fetching food logs:", error); });

        const gymQuery = query(collection(db, 'gymRoutines'), where('userId', '==', user.uid));
        const unsubGym = onSnapshot(gymQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now())
            }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setGymRoutines(data);
        }, (error) => { console.error("Error fetching gym routines:", error); });

        return () => { unsubHealth(); unsubWorkout(); unsubFood(); unsubGym(); };
    }, [user]);

    // ---- Health Log CRUD ----
    const addHealthLog = async (log) => {
        if (!user) return;
        await addDoc(collection(db, 'healthLogs'), {
            ...log, userId: user.uid,
            date: Timestamp.fromDate(new Date(log.date)),
            createdAt: Timestamp.now()
        });
    };

    const updateHealthLog = async (id, log) => {
        if (!user) return;
        const docRef = doc(db, 'healthLogs', id);
        await updateDoc(docRef, { ...log, date: Timestamp.fromDate(new Date(log.date)), updatedAt: Timestamp.now() });
    };

    const deleteHealthLog = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'healthLogs', id));
    };

    // ---- Workout CRUD ----
    const addWorkout = async (workout) => {
        if (!user) return;
        const workoutType = WORKOUT_TYPES.find(w => w.id === workout.type);
        const caloriesBurned = workout.duration * (workoutType?.calPerMin || 5);
        await addDoc(collection(db, 'workouts'), {
            ...workout, userId: user.uid, caloriesBurned,
            date: Timestamp.fromDate(new Date(workout.date)),
            createdAt: Timestamp.now()
        });
    };

    const deleteWorkout = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'workouts', id));
    };

    // ---- Food Log CRUD ----
    const addFoodLog = async (log) => {
        if (!user) return;
        await addDoc(collection(db, 'foodLogs'), {
            ...log, userId: user.uid,
            date: Timestamp.fromDate(new Date(log.date)),
            createdAt: Timestamp.now()
        });
    };

    const deleteFoodLog = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'foodLogs', id));
    };

    // ---- Gym Routine CRUD ----
    const addGymRoutine = async (routine) => {
        if (!user) return;
        await addDoc(collection(db, 'gymRoutines'), {
            ...routine, userId: user.uid,
            createdAt: Timestamp.now()
        });
    };

    const deleteGymRoutine = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'gymRoutines', id));
    };

    // ---- Goals ----
    const updateGoals = async (newGoals) => {
        setGoals(newGoals);
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { healthGoals: newGoals }, { merge: true });
        }
    };

    // ---- Helpers ----
    const getTodayLog = () => {
        const today = new Date().toDateString();
        return healthLogs.find(log => new Date(log.date).toDateString() === today);
    };

    const getTodayFoodLogs = () => {
        const today = new Date().toDateString();
        return foodLogs.filter(log => new Date(log.date).toDateString() === today);
    };

    const getTodayCalories = () => {
        return getTodayFoodLogs().reduce((sum, log) => sum + (log.calories || 0), 0);
    };

    const getWeeklyAverage = (metric) => {
        const lastWeek = healthLogs.slice(0, 7);
        if (lastWeek.length === 0) return 0;
        const sum = lastWeek.reduce((acc, log) => acc + (log[metric] || 0), 0);
        return sum / lastWeek.length;
    };

    const add_health = addHealthLog;
    const get_health = getTodayLog;

    const value = useMemo(() => ({
        healthLogs, workouts, foodLogs, gymRoutines,
        loading, goals,
        addHealthLog, updateHealthLog, deleteHealthLog,
        addWorkout, deleteWorkout,
        addFoodLog, deleteFoodLog,
        addGymRoutine, deleteGymRoutine,
        updateGoals,
        getTodayLog, getTodayFoodLogs, getTodayCalories,
        getWeeklyAverage,
        workoutTypes: WORKOUT_TYPES,
        add_health, get_health
    }), [healthLogs, workouts, foodLogs, gymRoutines, loading, goals, user]);

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
}

export const useHealth = () => useContext(HealthContext);
