import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { HealthProvider } from './context/HealthContext';
import { DiaryProvider } from './context/DiaryContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Health from './pages/Health';
import Diary from './pages/Diary';
import Settings from './pages/Settings';

function App() {
    console.log('App component rendering...');
    return (
        <ThemeProvider>
            <ExpenseProvider>
                <HealthProvider>
                    <DiaryProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route element={<Layout />}>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/expenses" element={<Expenses />} />
                                    <Route path="/health" element={<Health />} />
                                    <Route path="/diary" element={<Diary />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </DiaryProvider>
                </HealthProvider>
            </ExpenseProvider>
        </ThemeProvider>
    );
}

export default App;
