import type {
  IAuditLogRepository,
  CreateAuditLogRequest,
  AuditLogFilter,
  PaginatedAuditLogs,
} from '@/domain/repositories/IAuditLogRepository';
import type { AuditLogEntity, AuditAction } from '@/domain/entities/AuditLog';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_LOGS: AuditLogEntity[] = [
  {
    id: 'log-001',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'LOGIN',
    resource: 'Session',
    details: 'Connexion reussie depuis 192.168.1.10',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-15T14:30:00.000Z',
  },
  {
    id: 'log-002',
    userId: 'usr-002',
    userName: 'Marie Tanoh',
    action: 'DATA_IMPORTED',
    resource: 'Import',
    resourceId: 'imp-001',
    details: 'Import du fichier Releve_BACI_Mars.xlsx - 245 lignes traitees',
    ipAddress: '192.168.1.25',
    timestamp: '2024-03-15T11:20:00.000Z',
  },
  {
    id: 'log-003',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'PLAN_CREATED',
    resource: 'PlanTresorerie',
    resourceId: 'plan-001',
    details: 'Creation du plan annuel 2024 avec 12 periodes',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-15T09:00:00.000Z',
  },
  {
    id: 'log-004',
    userId: 'usr-004',
    userName: 'Salimata Yao',
    action: 'SETTINGS_CHANGED',
    resource: 'Rubrique',
    resourceId: 'rub-gas-001',
    details: 'Modification du type de saisie: Manuel -> Formule pour PAY_EXP_GAS',
    ipAddress: '192.168.1.50',
    timestamp: '2024-03-14T16:45:00.000Z',
  },
  {
    id: 'log-005',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'USER_DELETED',
    resource: 'User',
    resourceId: 'usr-test',
    details: 'Suppression du compte test@cie.ci',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-14T09:00:00.000Z',
  },
  {
    id: 'log-006',
    userId: 'usr-002',
    userName: 'Marie Tanoh',
    action: 'DATA_EXPORTED',
    resource: 'Report',
    resourceId: 'rpt-q1',
    details: 'Export Excel du rapport trimestriel consolide Q1 2024',
    ipAddress: '192.168.1.25',
    timestamp: '2024-03-13T17:30:00.000Z',
  },
  {
    id: 'log-007',
    userId: 'usr-003',
    userName: 'Amadou Koffi',
    action: 'LOGIN',
    resource: 'Session',
    details: 'Connexion reussie depuis 192.168.1.45',
    ipAddress: '192.168.1.45',
    timestamp: '2024-03-13T14:15:00.000Z',
  },
  {
    id: 'log-008',
    userId: 'usr-004',
    userName: 'Salimata Yao',
    action: 'ENTRY_CREATED',
    resource: 'CashFlowEntry',
    resourceId: 'cf-001',
    details: 'Saisie manuelle: 45,000,000 FCFA - Vente Energie Janvier',
    ipAddress: '192.168.1.50',
    timestamp: '2024-03-12T10:00:00.000Z',
  },
  {
    id: 'log-009',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'PROFILE_UPDATED',
    resource: 'Profile',
    resourceId: 'prf-002',
    details: 'Ajout permission export sur module Forecast pour profil Analyste',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-11T15:30:00.000Z',
  },
  {
    id: 'log-010',
    userId: 'usr-002',
    userName: 'Marie Tanoh',
    action: 'DATA_IMPORTED',
    resource: 'Import',
    resourceId: 'imp-002',
    details: 'Import du fichier Charges_Personnel_Fev.csv - 89 lignes traitees',
    ipAddress: '192.168.1.25',
    timestamp: '2024-03-10T09:45:00.000Z',
  },
  {
    id: 'log-011',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'USER_CREATED',
    resource: 'User',
    resourceId: 'usr-004',
    details: 'Creation du compte Salimata Yao - Role Controller',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-09T16:00:00.000Z',
  },
  {
    id: 'log-012',
    userId: 'usr-003',
    userName: 'Amadou Koffi',
    action: 'FORECAST_CREATED',
    resource: 'Scenario',
    resourceId: 'scn-002',
    details: 'Creation du scenario optimiste avec hypothese croissance +30%',
    ipAddress: '192.168.1.45',
    timestamp: '2024-03-08T11:00:00.000Z',
  },
  {
    id: 'log-013',
    userId: 'usr-002',
    userName: 'Marie Tanoh',
    action: 'SNAPSHOT_SAVED',
    resource: 'Snapshot',
    resourceId: 'snap-001',
    details: 'Sauvegarde du snapshot Q1 pour scenario de base',
    ipAddress: '192.168.1.25',
    timestamp: '2024-03-07T14:00:00.000Z',
  },
  {
    id: 'log-014',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'LOGIN_FAILED',
    resource: 'Session',
    details: 'Tentative de connexion echouee - mot de passe incorrect',
    ipAddress: '10.0.0.55',
    timestamp: '2024-03-06T08:30:00.000Z',
  },
  {
    id: 'log-015',
    userId: 'usr-004',
    userName: 'Salimata Yao',
    action: 'DATA_REJECTED',
    resource: 'Import',
    resourceId: 'imp-003',
    details: 'Rejet de l\'import Budget_Prev_2024.xlsx - trop d\'erreurs de validation',
    ipAddress: '192.168.1.50',
    timestamp: '2024-03-05T16:20:00.000Z',
  },
  {
    id: 'log-016',
    userId: 'usr-003',
    userName: 'Amadou Koffi',
    action: 'FORECAST_UPDATED',
    resource: 'Scenario',
    resourceId: 'scn-001',
    details: 'Mise a jour des parametres du scenario de base - inflation ajustee a 4%',
    ipAddress: '192.168.1.45',
    timestamp: '2024-03-04T10:15:00.000Z',
  },
  {
    id: 'log-017',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'PERIODE_CLOSED',
    resource: 'Periode',
    resourceId: 'per-2023',
    details: 'Cloture de l\'exercice 2023',
    ipAddress: '192.168.1.10',
    timestamp: '2024-03-01T18:00:00.000Z',
  },
  {
    id: 'log-018',
    userId: 'usr-002',
    userName: 'Marie Tanoh',
    action: 'ENTRY_UPDATED',
    resource: 'CashFlowEntry',
    resourceId: 'cf-005',
    details: 'Modification montant: 120,000,000 -> 135,000,000 FCFA - Facturation Industrielle',
    ipAddress: '192.168.1.25',
    timestamp: '2024-02-28T14:30:00.000Z',
  },
  {
    id: 'log-019',
    userId: 'usr-001',
    userName: 'Jean Kouassi',
    action: 'PASSWORD_RESET',
    resource: 'User',
    resourceId: 'usr-003',
    details: 'Reinitialisation du mot de passe pour Amadou Koffi',
    ipAddress: '192.168.1.10',
    timestamp: '2024-02-27T09:00:00.000Z',
  },
  {
    id: 'log-020',
    userId: 'usr-004',
    userName: 'Salimata Yao',
    action: 'ENTRY_DELETED',
    resource: 'CashFlowEntry',
    resourceId: 'cf-old-001',
    details: 'Suppression entree dupliquee - Frais Bancaires Decembre',
    ipAddress: '192.168.1.50',
    timestamp: '2024-02-26T11:45:00.000Z',
  },
];

export class MockAuditLogRepository implements IAuditLogRepository {
  private logs: AuditLogEntity[] = INITIAL_LOGS.map((l) => ({ ...l }));

  async log(request: CreateAuditLogRequest): Promise<AuditLogEntity> {
    await delay(200);

    const entry: AuditLogEntity = {
      id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
      userId: request.userId,
      userName: request.userName,
      action: request.action,
      resource: request.resource,
      resourceId: request.resourceId,
      details: request.details,
      ipAddress: request.ipAddress ?? '127.0.0.1',
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    return { ...entry };
  }

  async getByUserId(userId: string): Promise<AuditLogEntity[]> {
    await delay(300);
    return this.logs
      .filter((l) => l.userId === userId)
      .map((l) => ({ ...l }));
  }

  async getById(id: string): Promise<AuditLogEntity | null> {
    await delay(200);
    const entry = this.logs.find((l) => l.id === id);
    return entry ? { ...entry } : null;
  }

  async getAll(filter?: AuditLogFilter): Promise<PaginatedAuditLogs> {
    await delay(400);

    let filtered = [...this.logs];

    if (filter?.userId) {
      filtered = filtered.filter((l) => l.userId === filter.userId);
    }
    if (filter?.action) {
      filtered = filtered.filter((l) => l.action === filter.action);
    }
    if (filter?.resource) {
      filtered = filtered.filter((l) =>
        l.resource.toLowerCase().includes(filter.resource!.toLowerCase())
      );
    }
    if (filter?.startDate) {
      const start = new Date(filter.startDate).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() >= start);
    }
    if (filter?.endDate) {
      const end = new Date(filter.endDate).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() <= end);
    }

    // Sort by timestamp descending (most recent first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize).map((l) => ({ ...l }));

    return { data, total, page, pageSize, totalPages };
  }
}
