import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/hooks/useToast';
import { configRepository } from '@/infrastructure/di/container';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

// ============ Types ============
interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  type: 'Courant' | 'Epargne' | 'Devises';
  currency: string;
  balance: number;
  availableBalance: number;
  lastMovement: string;
  status: 'active' | 'restricted' | 'closed';
  color: string;
}

interface DailyPosition {
  date: string;
  total: number;
  encaissements: number;
  decaissements: number;
}

interface RecentMovement {
  id: string;
  date: string;
  description: string;
  bank: string;
  amount: number;
  direction: 'in' | 'out';
  balance: number;
}

// ============ Mock Data ============
const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ACC-001',
    bank: 'BIAO CI',
    accountNumber: 'CI93 0001 0000 0521 4530 001',
    type: 'Courant',
    currency: 'FCFA',
    balance: 12_450_000_000,
    availableBalance: 11_200_000_000,
    lastMovement: '2026-02-03 16:45',
    status: 'active',
    color: '#e65000',
  },
  {
    id: 'ACC-002',
    bank: 'NSIA Banque',
    accountNumber: 'CI93 0012 0000 0845 7210 005',
    type: 'Courant',
    currency: 'FCFA',
    balance: 8_780_000_000,
    availableBalance: 8_780_000_000,
    lastMovement: '2026-02-03 14:20',
    status: 'active',
    color: '#137fec',
  },
  {
    id: 'ACC-003',
    bank: 'Societe Generale CI',
    accountNumber: 'CI93 0015 0000 0312 8940 002',
    type: 'Courant',
    currency: 'FCFA',
    balance: 5_320_000_000,
    availableBalance: 4_800_000_000,
    lastMovement: '2026-02-02 09:10',
    status: 'active',
    color: '#8b5cf6',
  },
  {
    id: 'ACC-004',
    bank: 'Ecobank CI',
    accountNumber: 'CI93 0023 0000 0678 1230 001',
    type: 'Epargne',
    currency: 'FCFA',
    balance: 15_000_000_000,
    availableBalance: 15_000_000_000,
    lastMovement: '2026-01-31 11:00',
    status: 'active',
    color: '#06b6d4',
  },
  {
    id: 'ACC-005',
    bank: 'BICICI',
    accountNumber: 'CI93 0008 0000 0945 6780 003',
    type: 'Devises',
    currency: 'EUR',
    balance: 2_150_000,
    availableBalance: 2_150_000,
    lastMovement: '2026-01-28 15:30',
    status: 'active',
    color: '#f59e0b',
  },
  {
    id: 'ACC-006',
    bank: 'BOA CI',
    accountNumber: 'CI93 0018 0000 0134 5670 001',
    type: 'Courant',
    currency: 'FCFA',
    balance: 890_000_000,
    availableBalance: 450_000_000,
    lastMovement: '2026-02-01 08:45',
    status: 'restricted',
    color: '#84cc16',
  },
];

const DAILY_POSITIONS: DailyPosition[] = [
  { date: '24 Jan', total: 38.2, encaissements: 4.5, decaissements: 3.8 },
  { date: '25 Jan', total: 38.9, encaissements: 3.2, decaissements: 2.5 },
  { date: '26 Jan', total: 39.5, encaissements: 5.1, decaissements: 4.5 },
  { date: '27 Jan', total: 40.1, encaissements: 2.8, decaissements: 2.2 },
  { date: '28 Jan', total: 39.8, encaissements: 1.9, decaissements: 2.2 },
  { date: '29 Jan', total: 40.5, encaissements: 4.2, decaissements: 3.5 },
  { date: '30 Jan', total: 41.2, encaissements: 3.6, decaissements: 2.9 },
  { date: '31 Jan', total: 41.8, encaissements: 5.8, decaissements: 5.2 },
  { date: '01 Fev', total: 42.1, encaissements: 3.1, decaissements: 2.8 },
  { date: '02 Fev', total: 42.5, encaissements: 2.5, decaissements: 2.1 },
  { date: '03 Fev', total: 42.4, encaissements: 1.8, decaissements: 1.9 },
  { date: '04 Fev', total: 42.6, encaissements: 3.4, decaissements: 3.2 },
];

const RECENT_MOVEMENTS: RecentMovement[] = [
  { id: 'MOV-001', date: '04 Fev 08:32', description: 'Virement SODECI - Redevance reseau', bank: 'BIAO CI', amount: 450_000_000, direction: 'in', balance: 12_450_000_000 },
  { id: 'MOV-002', date: '04 Fev 07:15', description: 'Paiement fournisseur Total Energies', bank: 'NSIA Banque', amount: 1_200_000_000, direction: 'out', balance: 8_780_000_000 },
  { id: 'MOV-003', date: '03 Fev 16:45', description: 'Encaissement factures clients BT', bank: 'BIAO CI', amount: 890_000_000, direction: 'in', balance: 12_000_000_000 },
  { id: 'MOV-004', date: '03 Fev 14:20', description: 'Reglement charges salariales', bank: 'Societe Generale CI', amount: 2_100_000_000, direction: 'out', balance: 5_320_000_000 },
  { id: 'MOV-005', date: '03 Fev 11:05', description: 'Virement CI-ENERGIES compensation', bank: 'NSIA Banque', amount: 3_200_000_000, direction: 'in', balance: 9_980_000_000 },
  { id: 'MOV-006', date: '02 Fev 15:30', description: 'Frais bancaires mensuels', bank: 'Ecobank CI', amount: 12_500_000, direction: 'out', balance: 15_000_000_000 },
  { id: 'MOV-007', date: '02 Fev 09:10', description: 'Paiement DGI - TVA mensuelle', bank: 'Societe Generale CI', amount: 780_000_000, direction: 'out', balance: 7_420_000_000 },
  { id: 'MOV-008', date: '01 Fev 14:00', description: 'Recouvrement Grands Comptes HT', bank: 'BIAO CI', amount: 1_560_000_000, direction: 'in', balance: 11_110_000_000 },
];

const formatCFA = (amount: number): string => {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' Mds';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(0) + ' M';
  return new Intl.NumberFormat('fr-FR').format(amount);
};

const formatFullCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

// ============ Component ============
const PositionTresoreriePage: React.FC = () => {
  const { addToast } = useToast();
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');

  useEffect(() => {
    configRepository.getPlans().then(setPlans);
  }, []);

  // Totals
  const totals = useMemo(() => {
    const fcfaAccounts = BANK_ACCOUNTS.filter((a) => a.currency === 'FCFA');
    const totalBalance = fcfaAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalAvailable = fcfaAccounts.reduce((sum, a) => sum + a.availableBalance, 0);
    const activeCount = BANK_ACCOUNTS.filter((a) => a.status === 'active').length;
    return { totalBalance, totalAvailable, blocked: totalBalance - totalAvailable, activeCount };
  }, []);

  // Bank distribution for bar chart
  const bankDistribution = useMemo(() => {
    return BANK_ACCOUNTS.filter((a) => a.currency === 'FCFA').map((a) => ({
      name: a.bank.split(' ')[0],
      value: a.balance / 1_000_000_000,
      color: a.color,
    }));
  }, []);

  const filteredMovements = useMemo(() => {
    if (selectedBank === 'all') return RECENT_MOVEMENTS;
    return RECENT_MOVEMENTS.filter((m) => m.bank === selectedBank);
  }, [selectedBank]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Position de Trésorerie
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Soldes bancaires et mouvements en temps reel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#22a84c]/10 dark:bg-[#22a84c]/15 rounded-xl border border-[#22a84c]/30 dark:border-[#22a84c]/20">
            <div className="size-2 rounded-full bg-[#22a84c] animate-pulse" />
            <span className="text-xs font-black text-[#22a84c] dark:text-[#2ec45a]">Temps reel</span>
          </div>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Tous les plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.label.replace(/^Plan\s*/i, '')}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            icon="download"
            onClick={() => addToast({ type: 'info', title: 'Export', message: 'Export de la position en cours...' })}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Solde Total', value: formatCFA(totals.totalBalance) + ' FCFA', icon: 'account_balance', color: '#e65000' },
          { label: 'Disponible', value: formatCFA(totals.totalAvailable) + ' FCFA', icon: 'payments', color: '#22a84c' },
          { label: 'Bloque / Engage', value: formatCFA(totals.blocked) + ' FCFA', icon: 'lock', color: '#f59e0b' },
          { label: 'Comptes Actifs', value: String(totals.activeCount), icon: 'account_balance_wallet', color: '#137fec' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-5 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: kpi.color }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{kpi.label}</span>
                <span className="material-symbols-outlined text-lg" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
              <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position Evolution */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Evolution de la Position (Milliards FCFA)
            </h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#e65000]" /> Solde</div>
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#22a84c]" /> Entrees</div>
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-400" /> Sorties</div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_POSITIONS}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e65000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e65000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="total" stroke="#e65000" strokeWidth={3} fillOpacity={1} fill="url(#gradTotal)" name="Solde" />
                <Area type="monotone" dataKey="encaissements" stroke="#22a84c" strokeWidth={2} fillOpacity={0} strokeDasharray="4 2" name="Entrees" />
                <Area type="monotone" dataKey="decaissements" stroke="#ef4444" strokeWidth={2} fillOpacity={0} strokeDasharray="4 2" name="Sorties" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-6">
            Repartition par Banque
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" Mds" />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toFixed(1)} Mds FCFA`, 'Solde']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {bankDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-zinc-400">account_balance</span>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            Comptes Bancaires
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BANK_ACCOUNTS.map((account) => (
            <div
              key={account.id}
              className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: account.color }} />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.bank.split(' ')[0].substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{account.bank}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{account.accountNumber}</p>
                  </div>
                </div>
                <Badge variant={account.status === 'active' ? 'success' : account.status === 'restricted' ? 'warning' : 'error'}>
                  {account.status === 'active' ? 'Actif' : account.status === 'restricted' ? 'Restreint' : 'Ferme'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Solde</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white">
                    {formatCFA(account.balance)} {account.currency}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Disponible</span>
                  <span className="text-sm font-bold text-[#22a84c] dark:text-[#2ec45a]">
                    {formatCFA(account.availableBalance)} {account.currency}
                  </span>
                </div>
                {account.balance !== account.availableBalance && (
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(account.availableBalance / account.balance) * 100}%`,
                        backgroundColor: account.color,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge variant="neutral">{account.type}</Badge>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">{account.lastMovement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-400">swap_vert</span>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Derniers Mouvements
            </h2>
          </div>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="py-2 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Toutes les banques</option>
            {BANK_ACCOUNTS.map((a) => (
              <option key={a.id} value={a.bank}>{a.bank}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Banque</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4 text-right">Solde apres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">{mov.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-lg flex items-center justify-center ${
                        mov.direction === 'in' ? 'bg-[#22a84c]/10 text-[#22a84c] dark:bg-[#22a84c]/20' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                      }`}>
                        <span className="material-symbols-outlined text-base">
                          {mov.direction === 'in' ? 'south_west' : 'north_east'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{mov.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-zinc-500">{mov.bank}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-black ${
                      mov.direction === 'in' ? 'text-[#22a84c] dark:text-[#2ec45a]' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {mov.direction === 'in' ? '+' : '-'}{formatFullCFA(mov.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {formatFullCFA(mov.balance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionTresoreriePage;
