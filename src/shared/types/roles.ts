export type UserRole = 'Admin' | 'Analyst' | 'Direction' | 'Controller';

export type ResourceType =
  | 'dashboard'
  | 'plan'
  | 'imports'
  | 'forecast'
  | 'users'
  | 'profiles'
  | 'settings'
  | 'saisie'
  | 'visualization'
  | 'reporting'
  | 'validation'
  | 'position'
  | 'rapprochement'
  | 'notifications'
  | 'echeancier'
  | 'budget'
  | 'historique';

export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'export';

export interface Permission {
  resource: ResourceType;
  actions: ActionType[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}
