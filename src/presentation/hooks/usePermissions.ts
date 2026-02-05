import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { profileRepository } from '@/infrastructure/di/container';
import { ProfileEntity } from '@/domain/entities/Profile';
import type { ResourceType, ActionType } from '@/shared/types/roles';

interface UsePermissionsReturn {
  isLoading: boolean;
  profile: ProfileEntity | null;
  isAdmin: boolean;
  hasPermission: (resource: ResourceType, action: ActionType) => boolean;
  canView: (resource: ResourceType) => boolean;
  canCreate: (resource: ResourceType) => boolean;
  canEdit: (resource: ResourceType) => boolean;
  canDelete: (resource: ResourceType) => boolean;
  canExport: (resource: ResourceType) => boolean;
}

/**
 * Hook that loads the current user's profile from the profileRepository
 * and returns permission-checking functions based on the profile's permissions.
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the user's profile when the user or profileId changes
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user?.profileId) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedProfile = await profileRepository.findById(user.profileId);
        if (!cancelled) {
          setProfile(fetchedProfile);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.profileId]);

  // Build a lookup map from the profile permissions for fast checking
  const permissionMap = useMemo(() => {
    const map = new Map<string, Set<ActionType>>();
    if (profile?.permissions) {
      for (const perm of profile.permissions) {
        map.set(perm.resource, new Set(perm.actions));
      }
    }
    return map;
  }, [profile]);

  const hasPermission = useCallback(
    (resource: ResourceType, action: ActionType): boolean => {
      const actions = permissionMap.get(resource);
      return actions?.has(action) ?? false;
    },
    [permissionMap]
  );

  const canView = useCallback(
    (resource: ResourceType): boolean => hasPermission(resource, 'view'),
    [hasPermission]
  );

  const canCreate = useCallback(
    (resource: ResourceType): boolean => hasPermission(resource, 'create'),
    [hasPermission]
  );

  const canEdit = useCallback(
    (resource: ResourceType): boolean => hasPermission(resource, 'edit'),
    [hasPermission]
  );

  const canDelete = useCallback(
    (resource: ResourceType): boolean => hasPermission(resource, 'delete'),
    [hasPermission]
  );

  const canExport = useCallback(
    (resource: ResourceType): boolean => hasPermission(resource, 'export'),
    [hasPermission]
  );

  // Check if user is an admin (has Admin role or can manage users/profiles)
  const isAdmin = useMemo(() => {
    if (profile?.role === 'Admin') return true;
    // Also check if user has permission to manage users and profiles
    const canManageUsers = permissionMap.get('users')?.has('view') ?? false;
    const canManageProfiles = permissionMap.get('profiles')?.has('view') ?? false;
    return canManageUsers && canManageProfiles;
  }, [profile, permissionMap]);

  return {
    isLoading,
    profile,
    isAdmin,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
  };
}

export default usePermissions;
