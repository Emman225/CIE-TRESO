export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertType =
  | 'THRESHOLD_EXCEEDED'
  | 'NEGATIVE_BALANCE'
  | 'BUDGET_OVERRUN'
  | 'IMPORT_ERROR'
  | 'PERIODE_CLOSING'
  | 'FORECAST_DEVIATION'
  | 'PAYMENT_DUE'
  | 'SYSTEM';

export interface AlertEntity {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  threshold?: number;
  currentValue?: number;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
