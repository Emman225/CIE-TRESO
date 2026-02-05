import React, { useState, useMemo } from 'react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/hooks/useToast';

// ============ Types ============
type EcheanceStatus = 'pending' | 'paid' | 'overdue' | 'scheduled';
type EcheanceType = 'fournisseur' | 'fiscal' | 'social' | 'bancaire' | 'autre';

interface Echeance {
  id: string;
  reference: string;
  label: string;
  beneficiary: string;
  type: EcheanceType;
  dueDate: string;
  amount: number;
  status: EcheanceStatus;
  priority: 'high' | 'medium' | 'low';
  recurrent: boolean;
  notes?: string;
}

// ============ Mock Data ============
const MOCK_ECHEANCES: Echeance[] = [
  {
    id: 'ECH-001',
    reference: 'TVA-2026-01',
    label: 'TVA mensuelle Janvier 2026',
    beneficiary: 'Direction Generale des Impots',
    type: 'fiscal',
    dueDate: '2026-02-15',
    amount: 890_000_000,
    status: 'pending',
    priority: 'high',
    recurrent: true,
    notes: 'Echeance mensuelle obligatoire',
  },
  {
    id: 'ECH-002',
    reference: 'CNPS-2026-01',
    label: 'Cotisations sociales Janvier',
    beneficiary: 'CNPS',
    type: 'social',
    dueDate: '2026-02-10',
    amount: 245_000_000,
    status: 'pending',
    priority: 'high',
    recurrent: true,
  },
  {
    id: 'ECH-003',
    reference: 'TOTAL-2026-003',
    label: 'Facture combustible Q4 2025',
    beneficiary: 'Total Energies CI',
    type: 'fournisseur',
    dueDate: '2026-02-08',
    amount: 3_450_000_000,
    status: 'overdue',
    priority: 'high',
    recurrent: false,
    notes: 'Retard de 2 jours - Relance envoyee',
  },
  {
    id: 'ECH-004',
    reference: 'BIAO-INT-2026',
    label: 'Interets emprunt BIAO CI',
    beneficiary: 'BIAO CI',
    type: 'bancaire',
    dueDate: '2026-02-20',
    amount: 125_000_000,
    status: 'scheduled',
    priority: 'medium',
    recurrent: true,
  },
  {
    id: 'ECH-005',
    reference: 'EECI-2026-001',
    label: 'Reglement achat energie',
    beneficiary: 'EECI',
    type: 'fournisseur',
    dueDate: '2026-02-05',
    amount: 1_780_000_000,
    status: 'paid',
    priority: 'high',
    recurrent: false,
  },
  {
    id: 'ECH-006',
    reference: 'PATENTE-2026',
    label: 'Patente annuelle 2026',
    beneficiary: 'Tresor Public',
    type: 'fiscal',
    dueDate: '2026-03-31',
    amount: 450_000_000,
    status: 'pending',
    priority: 'medium',
    recurrent: true,
  },
  {
    id: 'ECH-007',
    reference: 'ORANGE-2026-02',
    label: 'Abonnement telecoms Fevrier',
    beneficiary: 'Orange CI',
    type: 'fournisseur',
    dueDate: '2026-02-28',
    amount: 18_500_000,
    status: 'scheduled',
    priority: 'low',
    recurrent: true,
  },
  {
    id: 'ECH-008',
    reference: 'NSIA-PRET-Q1',
    label: 'Echeance pret NSIA Q1',
    beneficiary: 'NSIA Banque',
    type: 'bancaire',
    dueDate: '2026-03-15',
    amount: 500_000_000,
    status: 'pending',
    priority: 'high',
    recurrent: true,
  },
  {
    id: 'ECH-009',
    reference: 'SODECI-2026-01',
    label: 'Facture eau Janvier',
    beneficiary: 'SODECI',
    type: 'fournisseur',
    dueDate: '2026-02-12',
    amount: 8_200_000,
    status: 'pending',
    priority: 'low',
    recurrent: true,
  },
  {
    id: 'ECH-010',
    reference: 'IS-ACOMPTE-Q1',
    label: 'Acompte IS Q1 2026',
    beneficiary: 'Direction Generale des Impots',
    type: 'fiscal',
    dueDate: '2026-03-20',
    amount: 1_200_000_000,
    status: 'pending',
    priority: 'high',
    recurrent: true,
  },
];

const TYPE_CONFIG: Record<EcheanceType, { label: string; icon: string; color: string }> = {
  fournisseur: { label: 'Fournisseur', icon: 'inventory_2', color: '#137fec' },
  fiscal: { label: 'Fiscal', icon: 'receipt_long', color: '#f59e0b' },
  social: { label: 'Social', icon: 'groups', color: '#8b5cf6' },
  bancaire: { label: 'Bancaire', icon: 'account_balance', color: '#06b6d4' },
  autre: { label: 'Autre', icon: 'more_horiz', color: '#71717a' },
};

const STATUS_CONFIG: Record<EcheanceStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'A payer', variant: 'warning' },
  paid: { label: 'Paye', variant: 'success' },
  overdue: { label: 'En retard', variant: 'error' },
  scheduled: { label: 'Planifie', variant: 'info' },
};

const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ============ Component ============
const EcheancierPage: React.FC = () => {
  const { addToast } = useToast();

  const [echeances, setEcheances] = useState<Echeance[]>(MOCK_ECHEANCES);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');

  // Stats
  const stats = useMemo(() => {
    const pending = echeances.filter((e) => e.status === 'pending' || e.status === 'scheduled');
    const overdue = echeances.filter((e) => e.status === 'overdue');
    const totalPending = pending.reduce((sum, e) => sum + e.amount, 0);
    const totalOverdue = overdue.reduce((sum, e) => sum + e.amount, 0);
    const next7Days = echeances.filter((e) => {
      const days = getDaysUntil(e.dueDate);
      return days >= 0 && days <= 7 && e.status !== 'paid';
    });
    return { pendingCount: pending.length, overdueCount: overdue.length, totalPending, totalOverdue, next7Days: next7Days.length };
  }, [echeances]);

  // Filtered echeances
  const filteredEcheances = useMemo(() => {
    return echeances
      .filter((e) => filterType === 'all' || e.type === filterType)
      .filter((e) => filterStatus === 'all' || e.status === filterStatus)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [echeances, filterType, filterStatus]);

  // Calendar data
  const calendarData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() || 7; // Monday = 1

    const days: { date: number; echeances: Echeance[] }[] = [];

    // Empty days before first of month
    for (let i = 1; i < startDay; i++) {
      days.push({ date: 0, echeances: [] });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEcheances = echeances.filter((e) => e.dueDate === dateStr);
      days.push({ date: d, echeances: dayEcheances });
    }

    return days;
  }, [echeances, selectedMonth]);

  const handleMarkAsPaid = (id: string) => {
    setEcheances((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'paid' as const } : e))
    );
    addToast({ type: 'success', title: 'Echeance payee', message: 'L\'echeance a ete marquee comme payee.' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Echeancier
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Calendrier des paiements et echeances a venir
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'
              }`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1">list</span>
              Liste
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                viewMode === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'
              }`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1">calendar_month</span>
              Calendrier
            </button>
          </div>
          <Button variant="primary" size="md" icon="add">
            Nouvelle echeance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'A payer', value: stats.pendingCount, subValue: formatCFA(stats.totalPending), icon: 'schedule', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' },
          { label: 'En retard', value: stats.overdueCount, subValue: formatCFA(stats.totalOverdue), icon: 'warning', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' },
          { label: 'Prochains 7 jours', value: stats.next7Days, icon: 'event_upcoming', color: '#137fec', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30' },
          { label: 'Total en attente', value: null, displayValue: formatCFA(stats.totalPending + stats.totalOverdue), icon: 'account_balance_wallet', color: '#e65000', bg: 'bg-primary/5 border-primary/20' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-[20px] border p-5 ${stat.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
              <span className="material-symbols-outlined text-xl" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.displayValue ?? stat.value}</p>
            {stat.subValue && <p className="text-xs text-zinc-500 font-bold mt-1">{stat.subValue}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="py-2 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="all">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="py-2 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        {viewMode === 'calendar' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredEcheances.map((echeance) => {
            const typeConfig = TYPE_CONFIG[echeance.type];
            const statusConfig = STATUS_CONFIG[echeance.status];
            const daysUntil = getDaysUntil(echeance.dueDate);

            return (
              <div
                key={echeance.id}
                className={`bg-white dark:bg-zinc-900 rounded-[20px] border p-5 hover:shadow-lg transition-all ${
                  echeance.status === 'overdue' ? 'border-red-200 dark:border-red-800/30' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Type Icon */}
                  <div
                    className="size-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeConfig.color + '15' }}
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ color: typeConfig.color }}>
                      {typeConfig.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white">{echeance.label}</h3>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      {echeance.priority === 'high' && (
                        <span className="text-red-500 material-symbols-outlined text-base">priority_high</span>
                      )}
                      {echeance.recurrent && (
                        <span className="text-zinc-400 material-symbols-outlined text-base" title="Recurrent">sync</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">{echeance.beneficiary}</p>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1">{echeance.reference}</p>
                  </div>

                  {/* Date */}
                  <div className="text-center lg:text-right">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{formatDate(echeance.dueDate)}</p>
                    <p className={`text-xs font-bold ${
                      daysUntil < 0 ? 'text-red-500' : daysUntil <= 7 ? 'text-orange-500' : 'text-zinc-400'
                    }`}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} jours de retard` : daysUntil === 0 ? 'Aujourd\'hui' : `Dans ${daysUntil} jours`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-center lg:text-right">
                    <p className="text-lg font-black text-zinc-900 dark:text-white">{formatCFA(echeance.amount)}</p>
                    <Badge variant="neutral">{typeConfig.label}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {echeance.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(echeance.id)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-all"
                        title="Marquer comme paye"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </button>
                    )}
                    <button className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                </div>

                {echeance.notes && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 italic flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">info</span>
                      {echeance.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredEcheances.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <span className="material-symbols-outlined text-5xl mb-4 block">event_busy</span>
              <p className="text-sm font-bold">Aucune echeance trouvee</p>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] rounded-xl border p-2 ${
                  day.date === 0
                    ? 'bg-zinc-50 dark:bg-zinc-800/30 border-transparent'
                    : day.echeances.some((e) => e.status === 'overdue')
                      ? 'border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10'
                      : 'border-zinc-100 dark:border-zinc-800 hover:border-primary/30'
                }`}
              >
                {day.date > 0 && (
                  <>
                    <p className="text-xs font-black text-zinc-400 mb-2">{day.date}</p>
                    <div className="space-y-1">
                      {day.echeances.slice(0, 2).map((ech) => {
                        const config = STATUS_CONFIG[ech.status];
                        return (
                          <div
                            key={ech.id}
                            className={`text-[10px] font-bold px-2 py-1 rounded truncate ${
                              config.variant === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              config.variant === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              config.variant === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                            title={ech.label}
                          >
                            {ech.beneficiary}
                          </div>
                        );
                      })}
                      {day.echeances.length > 2 && (
                        <p className="text-[10px] font-bold text-zinc-400">+{day.echeances.length - 2} autres</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcheancierPage;
