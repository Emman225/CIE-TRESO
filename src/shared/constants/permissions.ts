import type { UserRole, ResourceType, ActionType, RolePermissions, Permission } from '@/shared/types/roles';

const ALL_ACTIONS: ActionType[] = ['view', 'create', 'edit', 'delete', 'export'];
const VIEW_ONLY: ActionType[] = ['view'];
const VIEW_EXPORT: ActionType[] = ['view', 'export'];
const VIEW_CREATE_EDIT: ActionType[] = ['view', 'create', 'edit'];

const ALL_RESOURCES: ResourceType[] = [
  'dashboard',
  'plan',
  'imports',
  'forecast',
  'users',
  'profiles',
  'settings',
  'saisie',
  'visualization',
  'reporting',
];

function buildPermissions(resources: ResourceType[], actions: ActionType[]): Permission[] {
  return resources.map((resource) => ({ resource, actions }));
}

export const ADMIN_PERMISSIONS: RolePermissions = {
  role: 'Admin',
  permissions: buildPermissions(ALL_RESOURCES, ALL_ACTIONS),
};

export const ANALYST_PERMISSIONS: RolePermissions = {
  role: 'Analyst',
  permissions: [
    { resource: 'dashboard', actions: VIEW_EXPORT },
    { resource: 'plan', actions: VIEW_CREATE_EDIT },
    { resource: 'imports', actions: ['view', 'create', 'edit'] },
    { resource: 'forecast', actions: VIEW_CREATE_EDIT },
    { resource: 'saisie', actions: ['view', 'create', 'edit'] },
    { resource: 'visualization', actions: VIEW_EXPORT },
    { resource: 'reporting', actions: VIEW_EXPORT },
    { resource: 'users', actions: VIEW_ONLY },
    { resource: 'profiles', actions: VIEW_ONLY },
    { resource: 'settings', actions: VIEW_ONLY },
  ],
};

export const DIRECTION_PERMISSIONS: RolePermissions = {
  role: 'Direction',
  permissions: [
    { resource: 'dashboard', actions: VIEW_EXPORT },
    { resource: 'plan', actions: VIEW_EXPORT },
    { resource: 'imports', actions: VIEW_ONLY },
    { resource: 'forecast', actions: VIEW_EXPORT },
    { resource: 'saisie', actions: VIEW_ONLY },
    { resource: 'visualization', actions: VIEW_EXPORT },
    { resource: 'reporting', actions: VIEW_EXPORT },
    { resource: 'users', actions: VIEW_ONLY },
    { resource: 'profiles', actions: VIEW_ONLY },
    { resource: 'settings', actions: VIEW_ONLY },
  ],
};

export const CONTROLLER_PERMISSIONS: RolePermissions = {
  role: 'Controller',
  permissions: [
    { resource: 'dashboard', actions: VIEW_EXPORT },
    { resource: 'plan', actions: VIEW_EXPORT },
    { resource: 'imports', actions: ['view', 'create', 'edit', 'export'] },
    { resource: 'forecast', actions: VIEW_EXPORT },
    { resource: 'saisie', actions: ['view', 'create', 'edit', 'export'] },
    { resource: 'visualization', actions: VIEW_EXPORT },
    { resource: 'reporting', actions: VIEW_EXPORT },
    { resource: 'users', actions: VIEW_ONLY },
    { resource: 'profiles', actions: VIEW_ONLY },
    { resource: 'settings', actions: VIEW_ONLY },
  ],
};

export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  Admin: ADMIN_PERMISSIONS,
  Analyst: ANALYST_PERMISSIONS,
  Direction: DIRECTION_PERMISSIONS,
  Controller: CONTROLLER_PERMISSIONS,
};

export function hasPermission(
  role: UserRole,
  resource: ResourceType,
  action: ActionType
): boolean {
  const rolePerms = DEFAULT_PERMISSIONS[role];
  if (!rolePerms) return false;

  const resourcePerm = rolePerms.permissions.find((p) => p.resource === resource);
  if (!resourcePerm) return false;

  return resourcePerm.actions.includes(action);
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return DEFAULT_PERMISSIONS[role]?.permissions ?? [];
}
