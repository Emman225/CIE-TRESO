export { View } from './views';
export type { UserRole, ResourceType, ActionType, Permission, RolePermissions } from './roles';

export interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  info?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  entity: string;
  type: 'Payment' | 'Receipt';
  date: string;
  status: 'Completed' | 'Pending' | 'Rejected';
  amount: string;
}

export interface ImportHistory {
  id: string;
  date: string;
  filename: string;
  type: string;
  status: 'Validated' | 'Pending' | 'Rejected';
  errors: number;
  linesProcessed?: number;
  totalAmount?: string;
}

export type Severity = 'critical' | 'warning' | 'info';
export type FlowType = 'RECEIPT' | 'PAYMENT';
export type RubriqueType = 'Manual' | 'Formula' | 'Calculated';
export type AuditActionSimple = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'LOGIN';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
}

export interface Categorie {
  id: string;
  label: string;
  code: string;
  type: FlowType;
  description: string;
  isActive: boolean;
}

export interface Regroupement {
  id: string;
  label: string;
  code: string;
  type: 'Encaissement' | 'Decaissement';
  order: number;
}

export interface Rubrique {
  id: string;
  label: string;
  code: string;
  group: FlowType;
  type: RubriqueType;
  regroupementId?: string;
  categorieId?: string;
}

export interface Pole {
  id: string;
  label: string;
  code: string;
  responsibleUserId?: string;
  isActive: boolean;
}

export interface AuditEntry {
  id: string;
  date: string;
  userId: string;
  userName: string;
  action: AuditActionSimple;
  resource: string;
  details: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
