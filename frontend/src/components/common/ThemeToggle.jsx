import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle — Drop this anywhere in the UI to toggle dark/light mode.
 * Variants: 'pill' (default), 'icon', 'badge'
 */
const ThemeToggle = ({ variant = 'pill', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-300
          dark:border-white/10 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/8 dark:bg-white/[0.02]
          border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 bg-white/80
          ${className}`}
      >
        {isDark
          ? <Sun size={16} className="text-amber-400" />
          : <Moon size={16} className="text-slate-500" />
        }
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
          dark:bg-white/[0.03] dark:border dark:border-white/8 dark:text-white/30 dark:hover:text-white dark:hover:bg-white/8
          bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200
          ${className}`}
      >
        {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
        {isDark ? 'Claro' : 'Oscuro'}
      </button>
    );
  }

  // Default: 'pill'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`relative flex items-center w-14 h-7 rounded-full transition-all duration-300 focus:outline-none
        ${isDark ? 'bg-blue-600' : 'bg-slate-200'}
        ${className}`}
    >
      {/* Track icons */}
      <Moon size={11} className={`absolute left-1.5 transition-opacity duration-300 ${isDark ? 'opacity-100 text-white' : 'opacity-0'}`} />
      <Sun size={11} className={`absolute right-1.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100 text-amber-500'}`} />

      {/* Thumb */}
      <span
        className={`absolute w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
          ${isDark ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white'}`}
      />
    </button>
  );
};

export default ThemeToggle;
