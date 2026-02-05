import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard component that checks authentication status.
 *
 * - While the auth state is loading, renders a centered loading spinner.
 * - If the user is not authenticated, redirects to /login with the current
 *   location saved in state (for post-login redirect).
 * - If authenticated, renders the children.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a100a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
