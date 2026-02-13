import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/hooks/useToast';
import { configRepository } from '@/infrastructure/di/container';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

// ============ Types ============
type ReconciliationStatus = 'matched' | 'unmatched_bank' | 'unmatched_internal' | 'discrepancy';

interface ReconciliationLine {
  id: string;
  date: string;
  bankRef: string;
  internalRef: string;
  description: string;
  bankAmount: number | null;
  internalAmount: number | null;
  status: ReconciliationStatus;
  bank: string;
  direction: 'debit' | 'credit';
}

interface ReconciliationSummary {
  bankBalance: number;
  internalBalance: number;
  matchedCount: number;
  unmatchedBankCount: number;
  unmatchedInternalCount: number;
  discrepancyCount: number;
  discrepancyTotal: number;
}

// ============ Mock Data ============
const MOCK_LINES: ReconciliationLine[] = [
  {
    id: 'REC-001',
    date: '2026-01-31',
    bankRef: 'VIR-2026-0145',
    internalRef: 'FCT-2026-JAN-001',
    description: 'Virement SODECI - Redevance reseau',
    bankAmount: 450_000_000,
    internalAmount: 450_000_000,
    status: 'matched',
    bank: 'BIAO CI',
    direction: 'credit',
  },
  {
    id: 'REC-002',
    date: '2026-01-30',
    bankRef: 'CHQ-2026-0892',
    internalRef: 'OP-CIE-2026-078',
    description: 'Reglement fournisseur EECI',
    bankAmount: 1_320_000_000,
    internalAmount: 1_320_000_000,
    status: 'matched',
    bank: 'BIAO CI',
    direction: 'debit',
  },
  {
    id: 'REC-003',
    date: '2026-01-29',
    bankRef: 'VIR-2026-0152',
    internalRef: 'FCT-2026-JAN-015',
    description: 'Encaissement CI-ENERGIES compensation',
    bankAmount: 890_500_000,
    internalAmount: 890_000_000,
    status: 'discrepancy',
    bank: 'NSIA Banque',
    direction: 'credit',
  },
  {
    id: 'REC-004',
    date: '2026-01-28',
    bankRef: 'FRS-2026-0034',
    internalRef: '',
    description: 'Frais de tenue de compte Janvier',
    bankAmount: 2_500_000,
    internalAmount: null,
    status: 'unmatched_bank',
    bank: 'BIAO CI',
    direction: 'debit',
  },
  {
    id: 'REC-005',
    date: '2026-01-28',
    bankRef: 'AGI-2026-0018',
    internalRef: '',
    description: 'Agios et interets debiteurs',
    bankAmount: 8_750_000,
    internalAmount: null,
    status: 'unmatched_bank',
    bank: 'NSIA Banque',
    direction: 'debit',
  },
  {
    id: 'REC-006',
    date: '2026-01-27',
    bankRef: '',
    internalRef: 'OP-CIE-2026-082',
    description: 'Ordre de virement BIAO - Commission',
    bankAmount: null,
    internalAmount: 15_800_000,
    status: 'unmatched_internal',
    bank: 'BIAO CI',
    direction: 'debit',
  },
  {
    id: 'REC-007',
    date: '2026-01-27',
    bankRef: 'VIR-2026-0148',
    internalRef: 'FCT-2026-JAN-008',
    description: 'Subvention Etat - Electricification rurale',
    bankAmount: 2_500_000_000,
    internalAmount: 2_500_000_000,
    status: 'matched',
    bank: 'Societe Generale CI',
    direction: 'credit',
  },
  {
    id: 'REC-008',
    date: '2026-01-26',
    bankRef: 'PRE-2026-0056',
    internalRef: 'OP-CIE-2026-075',
    description: 'Prelevement CNPS cotisations',
    bankAmount: 78_500_000,
    internalAmount: 78_500_000,
    status: 'matched',
    bank: 'Societe Generale CI',
    direction: 'debit',
  },
  {
    id: 'REC-009',
    date: '2026-01-25',
    bankRef: '',
    internalRef: 'OP-CIE-2026-069',
    description: 'Reglement Orange CI - Telecoms',
    bankAmount: null,
    internalAmount: 12_300_000,
    status: 'unmatched_internal',
    bank: 'BIAO CI',
    direction: 'debit',
  },
  {
    id: 'REC-010',
    date: '2026-01-25',
    bankRef: 'VIR-2026-0139',
    internalRef: 'FCT-2026-JAN-022',
    description: 'Encaissement Grands Comptes HT',
    bankAmount: 1_780_200_000,
    internalAmount: 1_780_000_000,
    status: 'discrepancy',
    bank: 'Ecobank CI',
    direction: 'credit',
  },
  {
    id: 'REC-011',
    date: '2026-01-24',
    bankRef: 'COM-2026-0012',
    internalRef: '',
    description: 'Commission sur virement international',
    bankAmount: 4_200_000,
    internalAmount: null,
    status: 'unmatched_bank',
    bank: 'Ecobank CI',
    direction: 'debit',
  },
  {
    id: 'REC-012',
    date: '2026-01-24',
    bankRef: 'VIR-2026-0135',
    internalRef: 'FCT-2026-JAN-018',
    description: 'Virement Total Energies - Gas supply',
    bankAmount: 3_450_000_000,
    internalAmount: 3_450_000_000,
    status: 'matched',
    bank: 'NSIA Banque',
    direction: 'debit',
  },
];

const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const STATUS_CONFIG: Record<ReconciliationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
  matched: { label: 'Rapproche', variant: 'success', icon: 'check_circle' },
  unmatched_bank: { label: 'Non rapproche (Banque)', variant: 'warning', icon: 'help' },
  unmatched_internal: { label: 'Non rapproche (Interne)', variant: 'info', icon: 'pending' },
  discrepancy: { label: 'Ecart', variant: 'error', icon: 'error' },
};

// ============ Component ============
const RapprochementBancairePage: React.FC = () => {
  const { addToast } = useToast();

  const [lines] = useState<ReconciliationLine[]>(MOCK_LINES);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBank, setFilterBank] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-01');
  const [isReconciling, setIsReconciling] = useState(false);
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');

  useEffect(() => {
    configRepository.getPlans().then(setPlans);
  }, []);

  // Summary
  const summary: ReconciliationSummary = useMemo(() => {
    const matched = lines.filter((l) => l.status === 'matched');
    const unmatchedBank = lines.filter((l) => l.status === 'unmatched_bank');
    const unmatchedInternal = lines.filter((l) => l.status === 'unmatched_internal');
    const discrepancies = lines.filter((l) => l.status === 'discrepancy');

    const discrepancyTotal = discrepancies.reduce((sum, l) => {
      return sum + Math.abs((l.bankAmount ?? 0) - (l.internalAmount ?? 0));
    }, 0);

    // Simulated balances
    const bankBalance = 12_450_000_000;
    const internalBalance = 12_421_850_000;

    return {
      bankBalance,
      internalBalance,
      matchedCount: matched.length,
      unmatchedBankCount: unmatchedBank.length,
      unmatchedInternalCount: unmatchedInternal.length,
      discrepancyCount: discrepancies.length,
      discrepancyTotal,
    };
  }, [lines]);

  // Unique banks
  const uniqueBanks = useMemo(() => {
    return [...new Set(lines.map((l) => l.bank))];
  }, [lines]);

  // Filtered lines
  const filteredLines = useMemo(() => {
    return lines.filter((line) => {
      const statusMatch = filterStatus === 'all' || line.status === filterStatus;
      const bankMatch = filterBank === 'all' || line.bank === filterBank;
      return statusMatch && bankMatch;
    });
  }, [lines, filterStatus, filterBank]);

  // Run reconciliation
  const handleReconciliation = async () => {
    setIsReconciling(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsReconciling(false);
    addToast({ type: 'success', title: 'Rapprochement termine', message: `${summary.matchedCount} lignes rapprochees, ${summary.discrepancyCount} ecarts detectes.` });
  };

  const reconciliationRate = ((summary.matchedCount / lines.length) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Rapprochement Bancaire
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Confrontation des releves bancaires et ecritures internes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="2026-01">Janvier 2026</option>
            <option value="2025-12">Decembre 2025</option>
            <option value="2025-11">Novembre 2025</option>
          </select>
          <Button
            variant="primary"
            size="md"
            icon="sync"
            isLoading={isReconciling}
            onClick={handleReconciliation}
          >
            Lancer le rapprochement
          </Button>
        </div>
      </div>

      {/* Balance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-xl">account_balance</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Solde Releve Bancaire</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">{formatCFA(summary.bankBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Solde Comptable Interne</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">{formatCFA(summary.internalBalance)}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-[24px] border p-6 ${
          summary.bankBalance === summary.internalBalance
            ? 'bg-[#22a84c]/5 dark:bg-[#22a84c]/10 border-[#22a84c]/30 dark:border-[#22a84c]/20'
            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              summary.bankBalance === summary.internalBalance ? 'bg-[#22a84c]/10 dark:bg-[#22a84c]/20' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className={`material-symbols-outlined text-xl ${
                summary.bankBalance === summary.internalBalance ? 'text-[#22a84c]' : 'text-red-600'
              }`}>
                {summary.bankBalance === summary.internalBalance ? 'check_circle' : 'warning'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ecart Global</p>
              <p className={`text-xl font-black ${
                summary.bankBalance === summary.internalBalance ? 'text-[#22a84c]' : 'text-red-600'
              }`}>
                {formatCFA(Math.abs(summary.bankBalance - summary.internalBalance))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Taux rapprochement', value: `${reconciliationRate}%`, icon: 'percent', color: '#22a84c' },
          { label: 'Rapproches', value: String(summary.matchedCount), icon: 'check_circle', color: '#22a84c' },
          { label: 'Non rapproches', value: String(summary.unmatchedBankCount + summary.unmatchedInternalCount), icon: 'help', color: '#f59e0b' },
          { label: 'Ecarts', value: String(summary.discrepancyCount), icon: 'error', color: '#ef4444' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: stat.color }} />
            <span className="material-symbols-outlined text-2xl mb-1 block" style={{ color: stat.color }}>
              {stat.icon}
            </span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="matched">Rapproches</option>
            <option value="unmatched_bank">Non rappr. (Banque)</option>
            <option value="unmatched_internal">Non rappr. (Interne)</option>
            <option value="discrepancy">Ecarts</option>
          </select>

          <select
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Toutes les banques</option>
            {uniqueBanks.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>

          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.label.replace(/^Plan\s*/i, '')}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="md"
            icon="download"
            onClick={() => addToast({ type: 'info', title: 'Export', message: 'Export du rapprochement en cours...' })}
          >
            Exporter en Excel
          </Button>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4">Ref. Banque</th>
              <th className="px-5 py-4">Ref. Interne</th>
              <th className="px-5 py-4 text-right">Montant Banque</th>
              <th className="px-5 py-4 text-right">Montant Interne</th>
              <th className="px-5 py-4 text-right">Ecart</th>
              <th className="px-5 py-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredLines.map((line) => {
              const config = STATUS_CONFIG[line.status];
              const ecart = (line.bankAmount ?? 0) - (line.internalAmount ?? 0);

              return (
                <tr key={line.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">{line.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`size-7 rounded-lg flex items-center justify-center ${
                        line.direction === 'credit' ? 'bg-[#22a84c]/10 text-[#22a84c] dark:bg-[#22a84c]/20' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {line.direction === 'credit' ? 'south_west' : 'north_east'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1">{line.description}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {line.bankRef || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {line.internalRef || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-xs font-black ${line.bankAmount ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-600'}`}>
                      {line.bankAmount ? formatCFA(line.bankAmount) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-xs font-black ${line.internalAmount ? 'text-zinc-900 dark:text-white' : 'text-zinc-300 dark:text-zinc-600'}`}>
                      {line.internalAmount ? formatCFA(line.internalAmount) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {line.status === 'discrepancy' ? (
                      <span className="text-xs font-black text-red-600 dark:text-red-400">
                        {ecart > 0 ? '+' : ''}{formatCFA(ecart)}
                      </span>
                    ) : line.status === 'matched' ? (
                      <span className="text-xs font-bold text-[#22a84c] dark:text-[#2ec45a]">0</span>
                    ) : (
                      <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-sm ${
                        config.variant === 'success' ? 'text-[#22a84c]' :
                        config.variant === 'error' ? 'text-red-500' :
                        config.variant === 'warning' ? 'text-orange-500' :
                        'text-blue-500'
                      }`}>
                        {config.icon}
                      </span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
            <p className="text-sm font-bold">Aucune ligne trouvee</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RapprochementBancairePage;
