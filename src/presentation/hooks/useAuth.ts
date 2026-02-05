import { useContext } from 'react';
import { AuthContext } from '@/presentation/contexts/AuthContext';

/**
 * Hook to access the authentication context.
 * Must be used within an AuthProvider.
 *
 * Returns user, token, isAuthenticated, isLoading, error,
 * login(), logout(), forgotPassword(), and clearError().
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
