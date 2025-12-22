import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove both to ensure clean state
        root.classList.remove('light', 'dark');
        // Add current theme
        root.classList.add(theme);
        // Persist
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        // Fallback for browsers that don't support View Transitions
        if (!document.startViewTransition) {
            setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
            return;
        }

        document.startViewTransition(() => {
            flushSync(() => {
                setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
            });
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};


