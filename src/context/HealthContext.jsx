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

export function HealthProvider({ children }) {
    const { user } = useAuth();
    const [healthLogs, setHealthLogs] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState({
        water: 8,
        sleep: 8,
        steps: 10000,
        weight: 70
    });

    // Sync goals with Firestore
    useEffect(() => {
        if (!user) {
            setGoals({
                water: 8,
                sleep: 8,
                steps: 10000,
                weight: 70
            });
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.healthGoals) setGoals(data.healthGoals);
            } else {
                // Create document/field with defaults if it doesn't exist
                setDoc(userRef, {
                    healthGoals: {
                        water: 8,
                        sleep: 8,
                        steps: 10000,
                        weight: 70
                    }
                }, { merge: true });
            }
        });

        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!user) {
            setHealthLogs([]);
            setWorkouts([]);
            setLoading(false);
            return;
        }

        // Simplify queries to avoid requiring composite index
        const healthQuery = query(
            collection(db, 'healthLogs'),
            where('userId', '==', user.uid)
        );

        const unsubHealth = onSnapshot(healthQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date)
            }));
            // Sort client-side
            data.sort((a, b) => b.date - a.date);
            setHealthLogs(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching health logs:", error);
            setLoading(false);
        });

        const workoutQuery = query(
            collection(db, 'workouts'),
            where('userId', '==', user.uid)
        );

        const unsubWorkout = onSnapshot(workoutQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date)
            }));
            // Sort client-side
            data.sort((a, b) => b.date - a.date);
            setWorkouts(data);
        }, (error) => {
            console.error("Error fetching workouts:", error);
        });

        return () => {
            unsubHealth();
            unsubWorkout();
        };
    }, [user]);

    const addHealthLog = async (log) => {
        if (!user) return;
        await addDoc(collection(db, 'healthLogs'), {
            ...log,
            userId: user.uid,
            date: Timestamp.fromDate(new Date(log.date)),
            createdAt: Timestamp.now()
        });
    };

    const updateHealthLog = async (id, log) => {
        if (!user) return;
        const docRef = doc(db, 'healthLogs', id);
        await updateDoc(docRef, {
            ...log,
            date: Timestamp.fromDate(new Date(log.date)),
            updatedAt: Timestamp.now()
        });
    };

    const deleteHealthLog = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'healthLogs', id));
    };

    const addWorkout = async (workout) => {
        if (!user) return;
        const workoutType = WORKOUT_TYPES.find(w => w.id === workout.type);
        const caloriesBurned = workout.duration * (workoutType?.calPerMin || 5);

        await addDoc(collection(db, 'workouts'), {
            ...workout,
            userId: user.uid,
            caloriesBurned,
            date: Timestamp.fromDate(new Date(workout.date)),
            createdAt: Timestamp.now()
        });
    };

    const deleteWorkout = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'workouts', id));
    };

    const updateGoals = async (newGoals) => {
        setGoals(newGoals); // Optimistic update
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { healthGoals: newGoals }, { merge: true });
        }
    };

    const getTodayLog = () => {
        const today = new Date().toDateString();
        return healthLogs.find(log => new Date(log.date).toDateString() === today);
    };

    const getWeeklyAverage = (metric) => {
        const lastWeek = healthLogs.slice(0, 7);
        if (lastWeek.length === 0) return 0;
        const sum = lastWeek.reduce((acc, log) => acc + (log[metric] || 0), 0);
        return sum / lastWeek.length;
    };

    // Aliases as requested
    const add_health = addHealthLog;
    const get_health = getTodayLog;

    const value = useMemo(() => ({
        healthLogs,
        workouts,
        loading,
        goals,
        addHealthLog,
        updateHealthLog,
        deleteHealthLog,
        addWorkout,
        deleteWorkout,
        updateGoals,
        getTodayLog,
        getWeeklyAverage,
        workoutTypes: WORKOUT_TYPES,
        // Exported aliases
        add_health,
        get_health
    }), [healthLogs, workouts, loading, goals, user]);

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
}

export const useHealth = () => useContext(HealthContext);
