import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { HealthProvider } from './context/HealthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Health from './pages/Health';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ExpenseProvider>
                    <HealthProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route element={
                                    <PrivateRoute>
                                        <Layout />
                                    </PrivateRoute>
                                }>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/expenses" element={<Expenses />} />
                                    <Route path="/health" element={<Health />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </HealthProvider>
                </ExpenseProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
