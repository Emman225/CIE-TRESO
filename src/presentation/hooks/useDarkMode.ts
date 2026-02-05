import { useContext } from 'react';
import { ThemeContext } from '@/presentation/contexts/ThemeContext';

/**
 * Hook to access the dark mode state from the ThemeContext.
 * Must be used within a ThemeProvider.
 *
 * Returns { isDarkMode, toggleDarkMode }.
 */
export function useDarkMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return context;
}

export default useDarkMode;
