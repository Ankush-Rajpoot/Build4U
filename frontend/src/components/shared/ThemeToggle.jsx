import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-4 right-4 z-50 p-3 rounded-full 
        bg-white/10 hover:bg-white/20 dark:bg-white/20 dark:hover:bg-white/30
        border border-white/20 dark:border-white/30
        backdrop-blur-sm transition-all duration-200
        text-gray-900 dark:text-dark-text
        hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
    >
      {isLight ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
