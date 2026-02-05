import type { AuditLogEntity, AuditAction } from '@/domain/entities/AuditLog';

export interface CreateAuditLogRequest {
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLogEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IAuditLogRepository {
  getAll(filter?: AuditLogFilter): Promise<PaginatedAuditLogs>;
  getByUserId(userId: string): Promise<AuditLogEntity[]>;
  getById(id: string): Promise<AuditLogEntity | null>;
  log(request: CreateAuditLogRequest): Promise<AuditLogEntity>;
}
