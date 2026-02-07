import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <main className="ml-64 min-h-screen transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}
