import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { DataTable } from '@/presentation/components/ui/DataTable';
import { SkeletonCard, SkeletonTable } from '@/presentation/components/ui/Skeleton';
import { useToast } from '@/presentation/hooks/useToast';
import { reportRepository, auditLogRepository } from '@/infrastructure/di/container';
import type { AuditEntry, AuditActionSimple } from '@/shared/types';
import type { AuditLogEntity, AuditAction } from '@/domain/entities/AuditLog';

// ============ Report Templates ============
interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  formats: ('excel' | 'pdf')[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'consolidated',
    title: 'Rapport Consolide',
    description: 'Vue globale des encaissements et decaissements avec analyse des ecarts par rapport au budget previsionnel.',
    icon: 'summarize',
    category: 'Tresorerie',
    formats: ['excel', 'pdf'],
  },
  {
    id: 'cashflow',
    title: 'Flux de Tresorerie',
    description: 'Detail mensuel des flux entrants et sortants avec evolution du solde de tresorerie.',
    icon: 'swap_vert',
    category: 'Tresorerie',
    formats: ['excel', 'pdf'],
  },
  {
    id: 'forecast-vs-actual',
    title: 'Previsions vs Realise',
    description: 'Comparaison entre les previsions budgetaires et les montants realises avec taux de realisation.',
    icon: 'compare_arrows',
    category: 'Analyse',
    formats: ['excel', 'pdf'],
  },
  {
    id: 'kpi-dashboard',
    title: 'Indicateurs de Performance',
    description: 'Tableau de bord des KPIs cles: taux de recouvrement, delais de paiement, ratio de liquidite.',
    icon: 'speed',
    category: 'Performance',
    formats: ['pdf'],
  },
];

// ============ Action Badge Config ============
const ACTION_BADGE_MAP: Record<AuditActionSimple, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; icon: string }> = {
  CREATE: { variant: 'success', icon: 'add_circle' },
  UPDATE: { variant: 'info', icon: 'edit' },
  DELETE: { variant: 'error', icon: 'delete' },
  IMPORT: { variant: 'warning', icon: 'upload_file' },
  EXPORT: { variant: 'neutral', icon: 'download' },
  LOGIN: { variant: 'neutral', icon: 'login' },
};

const ReportingPage: React.FC = () => {
  const { addToast } = useToast();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Audit filters
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Map domain AuditAction to simplified AuditActionSimple
  const mapAction = (action: AuditAction): AuditActionSimple => {
    const mapping: Record<string, AuditActionSimple> = {
      LOGIN: 'LOGIN', LOGOUT: 'LOGIN', LOGIN_FAILED: 'LOGIN',
      USER_CREATED: 'CREATE', USER_UPDATED: 'UPDATE', USER_DELETED: 'DELETE',
      USER_ACTIVATED: 'UPDATE', USER_DEACTIVATED: 'UPDATE',
      PROFILE_CREATED: 'CREATE', PROFILE_UPDATED: 'UPDATE', PROFILE_DELETED: 'DELETE',
      DATA_IMPORTED: 'IMPORT', DATA_EXPORTED: 'EXPORT', DATA_REJECTED: 'DELETE',
      ENTRY_CREATED: 'CREATE', ENTRY_UPDATED: 'UPDATE', ENTRY_DELETED: 'DELETE',
      FORECAST_CREATED: 'CREATE', FORECAST_UPDATED: 'UPDATE', SNAPSHOT_SAVED: 'CREATE',
      SETTINGS_CHANGED: 'UPDATE', PLAN_CREATED: 'CREATE', PLAN_CLOSED: 'UPDATE',
      PERIODE_CLOSED: 'UPDATE', PASSWORD_RESET_REQUEST: 'UPDATE', PASSWORD_RESET: 'UPDATE',
    };
    return mapping[action] || 'UPDATE';
  };

  // Load audit data from repository
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await auditLogRepository.getAll({ pageSize: 100 });
        const mapped: AuditEntry[] = result.data.map((log: AuditLogEntity) => ({
          id: log.id,
          date: new Date(log.timestamp).toLocaleString('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }),
          userId: log.userId,
          userName: log.userName,
          action: mapAction(log.action),
          resource: log.resource,
          details: log.details || '',
        }));
        setAuditEntries(mapped);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  // Report generation state
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    auditEntries.forEach((e) => users.set(e.userId, e.userName));
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }, [auditEntries]);

  // Filtered audit entries
  const filteredAudit = useMemo(() => {
    return auditEntries.filter((entry) => {
      const searchMatch =
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchQuery.toLowerCase());
      const actionMatch = filterAction === 'all' || entry.action === filterAction;
      const userMatch = filterUser === 'all' || entry.userId === filterUser;
      return searchMatch && actionMatch && userMatch;
    });
  }, [auditEntries, searchQuery, filterAction, filterUser]);

  // Generate report with actual file download
  const handleGenerateReport = async (template: ReportTemplate, format: 'excel' | 'pdf') => {
    setGeneratingReport(`${template.id}-${format}`);

    try {
      const config = { title: template.title, year: 2024 };
      if (format === 'excel') {
        await reportRepository.generateExcelReport(config);
      } else {
        await reportRepository.generatePdfReport(config);
      }
      addToast({ type: 'success', title: 'Rapport genere', message: `"${template.title}" telecharge en ${format.toUpperCase()}.` });
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: `Impossible de generer le rapport "${template.title}".` });
    } finally {
      setGeneratingReport(null);
    }
  };

  // Export audit trail
  const handleExportAudit = async (format: 'excel' | 'pdf') => {
    setGeneratingReport(`audit-${format}`);
    try {
      const config = { title: 'Journal Audit' };
      if (format === 'excel') {
        await reportRepository.generateExcelReport(config);
      } else {
        await reportRepository.generatePdfReport(config);
      }
      addToast({ type: 'success', title: 'Export termine', message: `Journal d'audit telecharge en ${format.toUpperCase()}.` });
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible d\'exporter le journal d\'audit.' });
    } finally {
      setGeneratingReport(null);
    }
  };

  // Audit table columns
  const auditColumns = [
    {
      key: 'date',
      label: 'Date & Heure',
      sortable: true,
      render: (entry: AuditEntry) => (
        <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">
          {entry.date}
        </span>
      ),
    },
    {
      key: 'userName',
      label: 'Utilisateur',
      sortable: true,
      render: (entry: AuditEntry) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
            {entry.userName[0]}
          </div>
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            {entry.userName}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (entry: AuditEntry) => {
        const config = ACTION_BADGE_MAP[entry.action];
        return (
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-sm ${
              config.variant === 'success' ? 'text-green-500' :
              config.variant === 'error' ? 'text-red-500' :
              config.variant === 'warning' ? 'text-orange-500' :
              config.variant === 'info' ? 'text-blue-500' :
              'text-zinc-400'
            }`}>
              {config.icon}
            </span>
            <Badge variant={config.variant}>
              {entry.action}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'resource',
      label: 'Ressource',
      sortable: true,
      render: (entry: AuditEntry) => (
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
          {entry.resource}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (entry: AuditEntry) => (
        <span className="text-xs text-zinc-400 font-medium line-clamp-1">
          {entry.details}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Reporting
        </h1>
        <p className="text-sm text-zinc-500 font-semibold mt-1">
          Rapports et analyses de tresorerie
        </p>
      </div>

      {/* Report Generator Cards */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-zinc-400">description</span>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            Generateur de rapports
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} lines={4} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        {template.icon}
                      </span>
                    </div>
                    <Badge variant="neutral">{template.category}</Badge>
                  </div>

                  <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-2">
                    {template.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {template.formats.includes('excel') && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon="table_chart"
                      isLoading={generatingReport === `${template.id}-excel`}
                      onClick={() => handleGenerateReport(template, 'excel')}
                      className="flex-1"
                    >
                      Excel
                    </Button>
                  )}
                  {template.formats.includes('pdf') && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon="picture_as_pdf"
                      isLoading={generatingReport === `${template.id}-pdf`}
                      onClick={() => handleGenerateReport(template, 'pdf')}
                      className="flex-1"
                    >
                      PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-400">history</span>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                Journal d'audit
              </h2>
              <p className="text-xs text-zinc-500 font-bold">
                {filteredAudit.length} entree{filteredAudit.length > 1 ? 's' : ''} trouvee{filteredAudit.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="table_chart"
              isLoading={generatingReport === 'audit-excel'}
              onClick={() => handleExportAudit('excel')}
            >
              Excel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="picture_as_pdf"
              isLoading={generatingReport === 'audit-pdf'}
              onClick={() => handleExportAudit('pdf')}
            >
              PDF
            </Button>
          </div>
        </div>

        {/* Audit Filters */}
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Rechercher dans le journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Filter by Action */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="all">Toutes les actions</option>
              <option value="CREATE">Creation</option>
              <option value="UPDATE">Modification</option>
              <option value="DELETE">Suppression</option>
              <option value="IMPORT">Import</option>
              <option value="EXPORT">Export</option>
              <option value="LOGIN">Connexion</option>
            </select>

            {/* Filter by User */}
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="all">Tous les utilisateurs</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Table */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <DataTable
            columns={auditColumns}
            data={filteredAudit}
            emptyMessage="Aucune entree dans le journal"
            emptyIcon="history"
          />
        )}
      </div>

      {/* Action Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(['CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT', 'LOGIN'] as AuditActionSimple[]).map((action) => {
          const count = auditEntries.filter((e) => e.action === action).length;
          const config = ACTION_BADGE_MAP[action];
          const colorMap: Record<string, string> = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            neutral: '#71717a',
          };
          const color = colorMap[config.variant];

          return (
            <div
              key={action}
              className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4 text-center relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: color }}
              />
              <span
                className="material-symbols-outlined text-2xl mb-2 block"
                style={{ color }}
              >
                {config.icon}
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{count}</p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                {action}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportingPage;
