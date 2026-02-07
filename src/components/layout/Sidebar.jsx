import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    Heart,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: Wallet, label: 'Expenses' },
    { path: '/health', icon: Heart, label: 'Health' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out
      ${collapsed ? 'w-20' : 'w-64'} 
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 
              flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                            L
                        </div>
                        <span className="font-bold text-xl text-gradient">LifeSync</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive
                                ? 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
              ${collapsed ? 'justify-center' : ''}
            `}
                    >
                        <item.icon size={22} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Quick Stats */}



            {/* Profile & Logout */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                    flex items-center gap-3 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shrink-0">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>

                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email}
                            </p>
                        </div>
                    )}

                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
