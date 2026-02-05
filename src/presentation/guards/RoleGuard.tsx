import React from 'react';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import type { ResourceType, ActionType } from '@/shared/types/roles';

interface RoleGuardProps {
  resource: ResourceType;
  action?: ActionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that checks the current user's permissions before rendering children.
 *
 * - If the user has the required permission (resource + action), renders children.
 * - If not, renders the fallback component, or a default "access denied" message.
 * - While permissions are loading, renders nothing to avoid flicker.
 *
 * The default action checked is 'view' if no action prop is specified.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  resource,
  action = 'view',
  children,
  fallback,
}) => {
  const { hasPermission, isLoading } = usePermissions();

  // While permissions are loading, render nothing
  if (isLoading) {
    return null;
  }

  // Check if the user has the required permission
  if (!hasPermission(resource, action)) {
    // Render explicit fallback if provided
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    // Default fallback: access denied message
    return (
      <div className="flex items-center justify-center min-h-[200px] p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-2xl text-red-600 dark:text-red-400">&#x26D4;</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Acces non autorise
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous n'avez pas les permissions necessaires pour acceder a cette ressource.
            Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
