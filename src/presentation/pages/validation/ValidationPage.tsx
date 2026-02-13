import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { DataTable } from '@/presentation/components/ui/DataTable';
import { SkeletonTable, SkeletonMetricCard } from '@/presentation/components/ui/Skeleton';
import { useToast } from '@/presentation/hooks/useToast';
import { configRepository } from '@/infrastructure/di/container';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

// ============ Types ============
type ValidationStatus = 'pending' | 'approved' | 'rejected';
type FlowDirection = 'Encaissement' | 'Decaissement';

interface ValidationEntry {
  id: string;
  reference: string;
  date: string;
  entity: string;
  direction: FlowDirection;
  category: string;
  amount: number;
  submittedBy: string;
  submittedAt: string;
  status: ValidationStatus;
  comment?: string;
  pole: string;
}

// ============ Mock Data ============
const MOCK_VALIDATION_ENTRIES: ValidationEntry[] = [
  {
    id: 'VAL-001',
    reference: 'FCT-2026-JAN-001',
    date: '2026-01-15',
    entity: 'SODECI',
    direction: 'Encaissement',
    category: 'Vente Energie BT',
    amount: 245_000_000,
    submittedBy: 'Kouame Aya',
    submittedAt: '2026-01-28 09:14',
    status: 'pending',
    pole: 'Direction Commerciale',
  },
  {
    id: 'VAL-002',
    reference: 'OP-CIE-2026-078',
    date: '2026-01-20',
    entity: 'EECI Fournisseur',
    direction: 'Decaissement',
    category: 'Achat Energie',
    amount: 1_320_000_000,
    submittedBy: 'Traore Moussa',
    submittedAt: '2026-01-28 10:32',
    status: 'pending',
    pole: 'Direction Technique',
  },
  {
    id: 'VAL-003',
    reference: 'FCT-2026-JAN-015',
    date: '2026-01-22',
    entity: 'CI-ENERGIES',
    direction: 'Encaissement',
    category: 'Redevance Reseau',
    amount: 890_000_000,
    submittedBy: 'Bamba Sekou',
    submittedAt: '2026-01-27 14:55',
    status: 'pending',
    pole: 'Direction Financiere',
  },
  {
    id: 'VAL-004',
    reference: 'OP-CIE-2026-082',
    date: '2026-01-18',
    entity: 'BIAO CI',
    direction: 'Decaissement',
    category: 'Service Bancaire',
    amount: 15_800_000,
    submittedBy: 'Kone Mariam',
    submittedAt: '2026-01-27 16:03',
    status: 'pending',
    pole: 'Direction Financiere',
  },
  {
    id: 'VAL-005',
    reference: 'OP-CIE-2026-075',
    date: '2026-01-10',
    entity: 'CNPS',
    direction: 'Decaissement',
    category: 'Charges Sociales',
    amount: 78_500_000,
    submittedBy: 'Coulibaly Issa',
    submittedAt: '2026-01-26 08:45',
    status: 'approved',
    comment: 'Conforme au budget previsionnel.',
    pole: 'Direction RH',
  },
  {
    id: 'VAL-006',
    reference: 'FCT-2026-JAN-008',
    date: '2026-01-12',
    entity: 'Etat de Cote d\'Ivoire',
    direction: 'Encaissement',
    category: 'Subvention Etat',
    amount: 2_500_000_000,
    submittedBy: 'Yao Konan',
    submittedAt: '2026-01-25 11:20',
    status: 'approved',
    comment: 'Valide par la DAF.',
    pole: 'Direction Generale',
  },
  {
    id: 'VAL-007',
    reference: 'OP-CIE-2026-069',
    date: '2026-01-08',
    entity: 'Orange CI',
    direction: 'Decaissement',
    category: 'Telecoms',
    amount: 12_300_000,
    submittedBy: 'Diallo Fatoumata',
    submittedAt: '2026-01-24 09:30',
    status: 'rejected',
    comment: 'Montant non conforme au contrat. A revoir.',
    pole: 'Direction SI',
  },
  {
    id: 'VAL-008',
    reference: 'OP-CIE-2026-090',
    date: '2026-01-25',
    entity: 'Total Energies CI',
    direction: 'Decaissement',
    category: 'Achat Combustible',
    amount: 3_450_000_000,
    submittedBy: 'Traore Moussa',
    submittedAt: '2026-01-29 07:50',
    status: 'pending',
    pole: 'Direction Technique',
  },
  {
    id: 'VAL-009',
    reference: 'FCT-2026-JAN-022',
    date: '2026-01-27',
    entity: 'Grands Comptes HT',
    direction: 'Encaissement',
    category: 'Vente Energie HT',
    amount: 1_780_000_000,
    submittedBy: 'Kouame Aya',
    submittedAt: '2026-01-29 10:15',
    status: 'pending',
    pole: 'Direction Commerciale',
  },
];

const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

// ============ Component ============
const ValidationPage: React.FC = () => {
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<ValidationEntry[]>([]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntries(MOCK_VALIDATION_ENTRIES);
      setIsLoading(false);
    }, 800);
    configRepository.getPlans().then(setPlans);
    return () => clearTimeout(timer);
  }, []);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [detailEntry, setDetailEntry] = useState<ValidationEntry | null>(null);

  // Stats
  const stats = useMemo(() => {
    const pending = entries.filter((e) => e.status === 'pending');
    const approved = entries.filter((e) => e.status === 'approved');
    const rejected = entries.filter((e) => e.status === 'rejected');
    const totalPending = pending.reduce((sum, e) => sum + e.amount, 0);
    return { pending: pending.length, approved: approved.length, rejected: rejected.length, totalPending };
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const statusMatch = filterStatus === 'all' || entry.status === filterStatus;
      const dirMatch = filterDirection === 'all' || entry.direction === filterDirection;
      const searchMatch =
        entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && dirMatch && searchMatch;
    });
  }, [entries, filterStatus, filterDirection, searchQuery]);

  // Actions
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await new Promise((r) => setTimeout(r, 800));
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const, comment: 'Valide par la DAF.' } : e)),
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setProcessingId(null);
    addToast({ type: 'success', title: 'Ecriture validee', message: `L'ecriture ${id} a ete approuvee.` });
  };

  const handleReject = async (id: string) => {
    if (!rejectComment.trim()) return;
    setProcessingId(id);
    await new Promise((r) => setTimeout(r, 800));
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as const, comment: rejectComment } : e)),
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setProcessingId(null);
    setShowRejectModal(null);
    setRejectComment('');
    addToast({ type: 'warning', title: 'Ecriture rejetee', message: `L'ecriture ${id} a ete rejetee.` });
  };

  const handleExport = () => {
    const rows = filteredEntries.map((e) => ({
      Reference: e.reference,
      Date: e.date,
      Tiers: e.entity,
      Type: e.direction,
      Categorie: e.category,
      'Montant (FCFA)': e.amount,
      'Soumis par': e.submittedBy,
      'Date soumission': e.submittedAt,
      Statut: e.status === 'pending' ? 'En attente' : e.status === 'approved' ? 'Approuve' : 'Rejete',
      Pole: e.pole,
      Commentaire: e.comment || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Validations');
    XLSX.writeFile(wb, 'Validation_Ecritures_Export.xlsx');
    addToast({ type: 'success', title: 'Export reussi', message: 'Le fichier Excel a ete telecharge.' });
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await handleApprove(id);
    }
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingFiltered = filteredEntries.filter((e) => e.status === 'pending');
    if (selectedIds.size === pendingFiltered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingFiltered.map((e) => e.id)));
    }
  };

  const statusBadge = (status: ValidationStatus) => {
    const map: Record<ValidationStatus, { variant: 'warning' | 'success' | 'error'; label: string }> = {
      pending: { variant: 'warning', label: 'En attente' },
      approved: { variant: 'success', label: 'Approuve' },
      rejected: { variant: 'error', label: 'Rejete' },
    };
    const { variant, label } = map[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Table columns
  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size > 0 && selectedIds.size === filteredEntries.filter((e) => e.status === 'pending').length}
          onChange={toggleSelectAll}
          className="size-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
        />
      ) as React.ReactNode,
      render: (entry: ValidationEntry) =>
        entry.status === 'pending' ? (
          <input
            type="checkbox"
            checked={selectedIds.has(entry.id)}
            onChange={() => toggleSelect(entry.id)}
            className="size-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
          />
        ) : null,
    },
    {
      key: 'reference',
      label: 'Reference',
      sortable: true,
      render: (entry: ValidationEntry) => (
        <div>
          <p className="text-sm font-black text-zinc-900 dark:text-white">{entry.reference}</p>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{entry.date}</p>
        </div>
      ),
    },
    {
      key: 'entity',
      label: 'Tiers',
      sortable: true,
      render: (entry: ValidationEntry) => (
        <div>
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{entry.entity}</p>
          <p className="text-[10px] text-zinc-400 font-medium">{entry.pole}</p>
        </div>
      ),
    },
    {
      key: 'direction',
      label: 'Type',
      sortable: true,
      render: (entry: ValidationEntry) => (
        <div className="flex items-center gap-2">
          <div className={`size-8 rounded-lg flex items-center justify-center ${
            entry.direction === 'Encaissement' ? 'bg-[#22a84c]/10 text-[#22a84c] dark:bg-[#22a84c]/20' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
          }`}>
            <span className="material-symbols-outlined text-base">
              {entry.direction === 'Encaissement' ? 'south_west' : 'north_east'}
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{entry.direction}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categorie',
      render: (entry: ValidationEntry) => (
        <span className="text-xs font-bold text-zinc-500">{entry.category}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      render: (entry: ValidationEntry) => (
        <span className={`text-sm font-black ${
          entry.direction === 'Encaissement' ? 'text-[#22a84c] dark:text-[#2ec45a]' : 'text-red-600 dark:text-red-400'
        }`}>
          {entry.direction === 'Encaissement' ? '+' : '-'}{formatCFA(entry.amount)}
        </span>
      ),
    },
    {
      key: 'submittedBy',
      label: 'Soumis par',
      render: (entry: ValidationEntry) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
              {entry.submittedBy.split(' ').map((n) => n[0]).join('')}
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{entry.submittedBy}</span>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium mt-1 ml-9">{entry.submittedAt}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (entry: ValidationEntry) => statusBadge(entry.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (entry: ValidationEntry) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailEntry(entry)}
            className="p-2 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all active:scale-90"
            title="Voir détails"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          {entry.status === 'pending' ? (
            <>
              <button
                onClick={() => handleApprove(entry.id)}
                disabled={processingId === entry.id}
                className="p-2 rounded-lg bg-[#22a84c]/10 text-[#22a84c] hover:bg-[#22a84c]/20 dark:bg-[#22a84c]/20 dark:hover:bg-[#22a84c]/30 transition-all active:scale-90 disabled:opacity-50"
                title="Approuver"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </button>
              <button
                onClick={() => setShowRejectModal(entry.id)}
                disabled={processingId === entry.id}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-all active:scale-90 disabled:opacity-50"
                title="Rejeter"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
              </button>
            </>
          ) : (
            <span className="text-[10px] text-zinc-400 font-medium italic max-w-[140px] block truncate">
              {entry.comment}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Validation des Ecritures
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Approbation et controle des operations de trésorerie
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon="download" onClick={handleExport}>
            Exporter
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="primary"
              size="md"
              icon="done_all"
              onClick={handleBulkApprove}
            >
              Approuver la selection ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'En attente', value: stats.pending, icon: 'hourglass_top', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' },
            { label: 'Approuvees', value: stats.approved, icon: 'verified', color: '#22a84c', bg: 'bg-[#22a84c]/5 dark:bg-[#22a84c]/10 border-[#22a84c]/30 dark:border-[#22a84c]/20' },
            { label: 'Rejetees', value: stats.rejected, icon: 'block', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' },
            { label: 'Montant en attente', value: null, displayValue: formatCFA(stats.totalPending), icon: 'account_balance_wallet', color: '#e65000', bg: 'bg-primary/5 border-primary/20' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[20px] border p-5 ${stat.bg} relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {stat.label}
                </span>
                <span className="material-symbols-outlined text-xl" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {stat.displayValue ?? stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher par reference, tiers, soumis par..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuve</option>
            <option value="rejected">Rejete</option>
          </select>

          {/* Filter Direction */}
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="Encaissement">Encaissements</option>
            <option value="Decaissement">Decaissements</option>
          </select>

          {/* Filter Plan */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.label.replace(/^Plan\s*/i, '')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={6} columns={8} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEntries}
          emptyMessage="Aucune ecriture trouvee"
          emptyIcon="fact_check"
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-2xl">cancel</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Rejeter l'ecriture</h3>
                <p className="text-xs text-zinc-500 font-bold">{showRejectModal}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">
                  Motif du rejet *
                </label>
                <textarea
                  rows={3}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Indiquer la raison du rejet..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => { setShowRejectModal(null); setRejectComment(''); }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon="cancel"
                  onClick={() => handleReject(showRejectModal)}
                  disabled={!rejectComment.trim()}
                  isLoading={processingId === showRejectModal}
                  className="flex-1"
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${
                  detailEntry.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  detailEntry.status === 'approved' ? 'bg-[#22a84c]/10 dark:bg-[#22a84c]/20' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <span className={`material-symbols-outlined text-2xl ${
                    detailEntry.status === 'pending' ? 'text-amber-600' :
                    detailEntry.status === 'approved' ? 'text-[#22a84c]' :
                    'text-red-600'
                  }`}>
                    {detailEntry.status === 'pending' ? 'hourglass_top' : detailEntry.status === 'approved' ? 'verified' : 'block'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Detail de l'ecriture</h3>
                  <p className="text-xs text-zinc-500 font-bold">{detailEntry.reference}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailEntry(null)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Status + Type */}
              <div className="flex items-center gap-3">
                {statusBadge(detailEntry.status)}
                <Badge variant={detailEntry.direction === 'Encaissement' ? 'success' : 'error'}>
                  {detailEntry.direction}
                </Badge>
              </div>

              {/* Amount */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Montant</p>
                <p className={`text-3xl font-black ${
                  detailEntry.direction === 'Encaissement' ? 'text-[#22a84c]' : 'text-red-600'
                }`}>
                  {detailEntry.direction === 'Encaissement' ? '+' : '-'}{formatCFA(detailEntry.amount)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Date</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{detailEntry.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Tiers</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{detailEntry.entity}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Categorie</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{detailEntry.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Pole</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{detailEntry.pole}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Soumis par</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{detailEntry.submittedBy}</p>
                  <p className="text-xs text-zinc-400">{detailEntry.submittedAt}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Reference</p>
                  <p className="font-medium font-mono text-zinc-900 dark:text-white">{detailEntry.reference}</p>
                </div>
              </div>

              {/* Comment / Blockage detail */}
              {detailEntry.comment && (
                <div className={`p-4 rounded-xl border ${
                  detailEntry.status === 'rejected'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                    : 'bg-[#22a84c]/5 dark:bg-[#22a84c]/10 border-[#22a84c]/30 dark:border-[#22a84c]/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-lg ${
                      detailEntry.status === 'rejected' ? 'text-red-600' : 'text-[#22a84c]'
                    }`}>
                      {detailEntry.status === 'rejected' ? 'error' : 'check_circle'}
                    </span>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      {detailEntry.status === 'rejected' ? 'Motif du rejet' : 'Commentaire de validation'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{detailEntry.comment}</p>
                </div>
              )}

              {detailEntry.status === 'pending' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg text-amber-600">hourglass_top</span>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">En attente de validation</p>
                  </div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Cette ecriture est en attente d'approbation par un valideur habilite.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              {detailEntry.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="md"
                    icon="cancel"
                    onClick={() => { setDetailEntry(null); setShowRejectModal(detailEntry.id); }}
                  >
                    Rejeter
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon="check_circle"
                    onClick={() => { handleApprove(detailEntry.id); setDetailEntry(null); }}
                  >
                    Approuver
                  </Button>
                </>
              )}
              {detailEntry.status !== 'pending' && (
                <Button variant="outline" size="md" onClick={() => setDetailEntry(null)}>
                  Fermer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
