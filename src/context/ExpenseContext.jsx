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
    Timestamp,
    getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { id: 'bills', name: 'Bills & Utilities', icon: '📱', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f43f5e' },
    { id: 'health', name: 'Healthcare', icon: '💊', color: '#10b981' },
    { id: 'education', name: 'Education', icon: '📚', color: '#06b6d4' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#6366f1' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#84cc16' },
    { id: 'other', name: 'Other', icon: '📦', color: '#64748b' },
];

export function ExpenseProvider({ children }) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyBudget, setMonthlyBudget] = useState(50000);
    const [salary, setSalaryState] = useState(0);

    // Sync settings with Firestore
    useEffect(() => {
        if (!user) {
            setMonthlyBudget(50000);
            setSalaryState(0);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.budget !== undefined) setMonthlyBudget(data.budget);
                if (data.salary !== undefined) setSalaryState(data.salary);
            } else {
                // Create document with defaults if it doesn't exist
                setDoc(userRef, {
                    budget: 50000,
                    salary: 0,
                    createdAt: Timestamp.now()
                }, { merge: true });
            }
        });

        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        // Simplify query to avoid requiring composite index which causes infinite loading
        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expenseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date)
            }));

            // Sort client-side to avoid index requirement
            expenseData.sort((a, b) => b.date - a.date);

            setExpenses(expenseData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching expenses:", error);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const addExpense = async (expense) => {
        if (!user) return;
        await addDoc(collection(db, 'expenses'), {
            ...expense,
            userId: user.uid,
            date: Timestamp.fromDate(new Date(expense.date)),
            createdAt: Timestamp.now()
        });
    };

    const updateExpense = async (id, expense) => {
        if (!user) return;
        const docRef = doc(db, 'expenses', id);
        await updateDoc(docRef, {
            ...expense,
            date: Timestamp.fromDate(new Date(expense.date)),
            updatedAt: Timestamp.now()
        });
    };

    const deleteExpense = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'expenses', id));
    };

    const updateBudget = async (budget) => {
        setMonthlyBudget(budget); // Optimistic update
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { budget: budget }, { merge: true });
        }
    };

    const setSalary = async (amount) => {
        setSalaryState(amount); // Optimistic update
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { salary: amount }, { merge: true });
        }
    };

    const getMonthlyTotal = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    };

    const getCategoryBreakdown = () => {
        const breakdown = {};
        expenses.forEach(exp => {
            breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
        });
        return breakdown;
    };

    const loadMonthlyData = (month, year) => {
        return expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === month && expDate.getFullYear() === year;
        });
    };

    // Aliases as requested
    const add_expense = addExpense;
    const update_expense = updateExpense;
    const delete_expense = deleteExpense;
    const monthly_expense = getMonthlyTotal;
    const set_salary = setSalary;
    const get_salary = () => salary;
    const saveExpense = addExpense;
    const calculateSummary = getCategoryBreakdown;

    const value = useMemo(() => ({
        expenses,
        loading,
        monthlyBudget,
        salary,
        addExpense,
        updateExpense,
        deleteExpense,
        updateBudget,
        setSalary,
        getMonthlyTotal,
        getCategoryBreakdown,
        categories: EXPENSE_CATEGORIES,
        // Exported aliases
        add_expense,
        update_expense,
        delete_expense,
        monthly_expense,
        set_salary,
        get_salary,
        saveExpense,
        loadMonthlyData,
        calculateSummary
    }), [expenses, loading, monthlyBudget, salary, user]); // Added user to cleanup if needed, though functions depend on ref

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => useContext(ExpenseContext);
