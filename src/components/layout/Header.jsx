import { Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

export default function Header({ title }) {
    const { darkMode, toggleDarkMode } = useTheme();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header className="h-16 flex items-center justify-between px-6 
      bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
      border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">

            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className={`relative h-10 transition-all duration-300 ${searchOpen ? 'w-64' : 'w-10'}`}>
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="absolute left-0 top-0 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Search size={20} className="text-gray-500" />
                    </button>
                    {searchOpen && (
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                transition-all animate-fade-in"
                            autoFocus
                        />
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {darkMode ? (
                        <Sun size={20} className="text-amber-500" />
                    ) : (
                        <Moon size={20} className="text-gray-500" />
                    )}
                </button>
            </div>
        </header>
    );
}
