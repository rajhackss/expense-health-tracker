import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true;
    });

    const [themeColor, setThemeColor] = useState(() => {
        return localStorage.getItem('themeColor') || 'purple';
    });

    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || 'medium';
    });

    const [borderRadius, setBorderRadius] = useState(() => {
        return localStorage.getItem('borderRadius') || 'default';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('themeColor', themeColor);
        if (themeColor === 'purple') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeColor);
        }
    }, [themeColor]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.setAttribute('data-font', fontSize);
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem('borderRadius', borderRadius);
        document.documentElement.setAttribute('data-radius', borderRadius);
    }, [borderRadius]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <ThemeContext.Provider value={{
            darkMode, toggleDarkMode,
            themeColor, setThemeColor,
            fontSize, setFontSize,
            borderRadius, setBorderRadius
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
