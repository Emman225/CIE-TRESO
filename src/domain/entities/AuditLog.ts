export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'PROFILE_CREATED'
  | 'PROFILE_UPDATED'
  | 'PROFILE_DELETED'
  | 'DATA_IMPORTED'
  | 'DATA_EXPORTED'
  | 'DATA_REJECTED'
  | 'ENTRY_CREATED'
  | 'ENTRY_UPDATED'
  | 'ENTRY_DELETED'
  | 'FORECAST_CREATED'
  | 'FORECAST_UPDATED'
  | 'SNAPSHOT_SAVED'
  | 'SETTINGS_CHANGED'
  | 'PLAN_CREATED'
  | 'PLAN_CLOSED'
  | 'PERIODE_CLOSED';

export interface AuditLogEntity {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
