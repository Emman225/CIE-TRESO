/**
 * Dependency Injection Container
 *
 * Singleton instances of all mock repositories.
 * In production, swap these with real API-backed implementations.
 */

// Repository interface types
import type { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import type { IAuditLogRepository } from '@/domain/repositories/IAuditLogRepository';
import type { IConfigRepository } from '@/domain/repositories/ConfigRepository';
import type { ICashFlowRepository } from '@/domain/repositories/CashFlowRepository';
import type { IImportRepository } from '@/domain/repositories/IImportRepository';
import type { IReportRepository } from '@/domain/repositories/IReportRepository';
import type { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import type { IForecastRepository } from '@/domain/repositories/IForecastRepository';

// Mock implementations
import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { MockUserRepository } from '@/infrastructure/repositories/MockUserRepository';
import { MockProfileRepository } from '@/infrastructure/repositories/MockProfileRepository';
import { MockAuditLogRepository } from '@/infrastructure/repositories/MockAuditLogRepository';
import { MockConfigRepository } from '@/infrastructure/repositories/MockConfigRepository';
import { MockCashFlowRepository } from '@/infrastructure/repositories/MockCashFlowRepository';
import { MockImportRepository } from '@/infrastructure/repositories/MockImportRepository';
import { MockReportRepository } from '@/infrastructure/repositories/MockReportRepository';
import { MockDashboardRepository } from '@/infrastructure/repositories/MockDashboardRepository';
import { MockForecastRepository } from '@/infrastructure/repositories/MockForecastRepository';

// --- Auth & Security ---
export const authRepository: IAuthRepository = new MockAuthRepository();
export const userRepository: IUserRepository = new MockUserRepository();
export const profileRepository: IProfileRepository = new MockProfileRepository();
export const auditLogRepository: IAuditLogRepository = new MockAuditLogRepository();

// --- Configuration ---
export const configRepository: IConfigRepository = new MockConfigRepository();

// --- Business ---
export const cashFlowRepository: ICashFlowRepository = new MockCashFlowRepository();
export const importRepository: IImportRepository = new MockImportRepository();
export const reportRepository: IReportRepository = new MockReportRepository();
export const dashboardRepository: IDashboardRepository = new MockDashboardRepository();
export const forecastRepository: IForecastRepository = new MockForecastRepository();
