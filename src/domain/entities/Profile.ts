import type { ResourceType, ActionType } from '@/shared/types/roles';

export interface Permission {
  resource: ResourceType;
  actions: ActionType[];
}

export interface ProfileEntity {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
