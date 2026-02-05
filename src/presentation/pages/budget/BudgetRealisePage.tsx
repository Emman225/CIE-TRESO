import React, { useState, useMemo } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { DateRangePicker } from '@/presentation/components/ui/DateRangePicker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';

// Types
type CategoryType = 'encaissement' | 'decaissement';
type VarianceStatus = 'favorable' | 'defavorable' | 'neutre';

interface BudgetLine {
  id: string;
  category: string;
  type: CategoryType;
  budgetAmount: number;
  realAmount: number;
  variance: number;
  variancePercent: number;
  status: VarianceStatus;
  subCategories?: {
    name: string;
    budget: number;
    real: number;
  }[];
}

interface MonthlyData {
  month: string;
  budgetEncaissement: number;
  realEncaissement: number;
  budgetDecaissement: number;
  realDecaissement: number;
}

// Mock data
const mockBudgetLines: BudgetLine[] = [
  {
    id: '1',
    category: 'Ventes Énergie',
    type: 'encaissement',
    budgetAmount: 45000000000,
    realAmount: 47500000000,
    variance: 2500000000,
    variancePercent: 5.56,
    status: 'favorable',
    subCategories: [
      { name: 'Particuliers', budget: 20000000000, real: 21000000000 },
      { name: 'Entreprises', budget: 15000000000, real: 16500000000 },
      { name: 'Industries', budget: 10000000000, real: 10000000000 },
    ],
  },
  {
    id: '2',
    category: 'Subventions État',
    type: 'encaissement',
    budgetAmount: 8000000000,
    realAmount: 7200000000,
    variance: -800000000,
    variancePercent: -10.0,
    status: 'defavorable',
  },
  {
    id: '3',
    category: 'Autres Produits',
    type: 'encaissement',
    budgetAmount: 2500000000,
    realAmount: 2800000000,
    variance: 300000000,
    variancePercent: 12.0,
    status: 'favorable',
  },
  {
    id: '4',
    category: 'Achats Énergie',
    type: 'decaissement',
    budgetAmount: 25000000000,
    realAmount: 26500000000,
    variance: -1500000000,
    variancePercent: -6.0,
    status: 'defavorable',
    subCategories: [
      { name: 'CI-ENERGIES', budget: 15000000000, real: 16000000000 },
      { name: 'Producteurs IPP', budget: 10000000000, real: 10500000000 },
    ],
  },
  {
    id: '5',
    category: 'Charges de Personnel',
    type: 'decaissement',
    budgetAmount: 12000000000,
    realAmount: 11800000000,
    variance: 200000000,
    variancePercent: 1.67,
    status: 'favorable',
  },
  {
    id: '6',
    category: 'Fonctionnement',
    type: 'decaissement',
    budgetAmount: 5000000000,
    realAmount: 4950000000,
    variance: 50000000,
    variancePercent: 1.0,
    status: 'neutre',
    subCategories: [
      { name: 'Fournitures', budget: 2000000000, real: 1900000000 },
      { name: 'Services', budget: 2000000000, real: 2050000000 },
      { name: 'Déplacements', budget: 1000000000, real: 1000000000 },
    ],
  },
  {
    id: '7',
    category: 'Investissements',
    type: 'decaissement',
    budgetAmount: 8000000000,
    realAmount: 6200000000,
    variance: 1800000000,
    variancePercent: 22.5,
    status: 'favorable',
  },
  {
    id: '8',
    category: 'Impôts et Taxes',
    type: 'decaissement',
    budgetAmount: 3500000000,
    realAmount: 3650000000,
    variance: -150000000,
    variancePercent: -4.29,
    status: 'defavorable',
  },
  {
    id: '9',
    category: 'Services Bancaires',
    type: 'decaissement',
    budgetAmount: 800000000,
    realAmount: 780000000,
    variance: 20000000,
    variancePercent: 2.5,
    status: 'neutre',
  },
];

const mockMonthlyData: MonthlyData[] = [
  { month: 'Jan', budgetEncaissement: 4500, realEncaissement: 4800, budgetDecaissement: 4200, realDecaissement: 4100 },
  { month: 'Fév', budgetEncaissement: 4300, realEncaissement: 4200, budgetDecaissement: 4000, realDecaissement: 4300 },
  { month: 'Mar', budgetEncaissement: 4700, realEncaissement: 5100, budgetDecaissement: 4500, realDecaissement: 4400 },
  { month: 'Avr', budgetEncaissement: 4400, realEncaissement: 4600, budgetDecaissement: 4300, realDecaissement: 4500 },
  { month: 'Mai', budgetEncaissement: 4600, realEncaissement: 4900, budgetDecaissement: 4400, realDecaissement: 4200 },
  { month: 'Jun', budgetEncaissement: 4800, realEncaissement: 5000, budgetDecaissement: 4600, realDecaissement: 4700 },
  { month: 'Jul', budgetEncaissement: 5000, realEncaissement: 4700, budgetDecaissement: 4800, realDecaissement: 5000 },
  { month: 'Aoû', budgetEncaissement: 4200, realEncaissement: 4400, budgetDecaissement: 4100, realDecaissement: 4000 },
  { month: 'Sep', budgetEncaissement: 4600, realEncaissement: 4800, budgetDecaissement: 4400, realDecaissement: 4300 },
  { month: 'Oct', budgetEncaissement: 4900, realEncaissement: 5200, budgetDecaissement: 4700, realDecaissement: 4600 },
  { month: 'Nov', budgetEncaissement: 5100, realEncaissement: 5300, budgetDecaissement: 4900, realDecaissement: 4800 },
  { month: 'Déc', budgetEncaissement: 5400, realEncaissement: 5500, budgetDecaissement: 5200, realDecaissement: 5100 },
];

const formatAmount = (value: number): string => {
  if (Math.abs(value) >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} Mds`;
  }
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(0)} M`;
  }
  return value.toLocaleString('fr-FR');
};

const formatFullAmount = (value: number): string => {
  return value.toLocaleString('fr-FR') + ' FCFA';
};

const BudgetRealisePage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2025-01-01',
    end: '2025-12-31',
  });
  const [selectedType, setSelectedType] = useState<'all' | CategoryType>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Filter budget lines
  const filteredLines = useMemo(() => {
    if (selectedType === 'all') return mockBudgetLines;
    return mockBudgetLines.filter((line) => line.type === selectedType);
  }, [selectedType]);

  // Calculate totals
  const totals = useMemo(() => {
    const encaissementLines = mockBudgetLines.filter((l) => l.type === 'encaissement');
    const decaissementLines = mockBudgetLines.filter((l) => l.type === 'decaissement');

    const totalBudgetEnc = encaissementLines.reduce((sum, l) => sum + l.budgetAmount, 0);
    const totalRealEnc = encaissementLines.reduce((sum, l) => sum + l.realAmount, 0);
    const totalBudgetDec = decaissementLines.reduce((sum, l) => sum + l.budgetAmount, 0);
    const totalRealDec = decaissementLines.reduce((sum, l) => sum + l.realAmount, 0);

    return {
      encaissement: {
        budget: totalBudgetEnc,
        real: totalRealEnc,
        variance: totalRealEnc - totalBudgetEnc,
        variancePercent: ((totalRealEnc - totalBudgetEnc) / totalBudgetEnc) * 100,
      },
      decaissement: {
        budget: totalBudgetDec,
        real: totalRealDec,
        variance: totalBudgetDec - totalRealDec,
        variancePercent: ((totalBudgetDec - totalRealDec) / totalBudgetDec) * 100,
      },
      solde: {
        budget: totalBudgetEnc - totalBudgetDec,
        real: totalRealEnc - totalRealDec,
      },
    };
  }, []);

  // Toggle category expansion
  const toggleCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Get status color
  const getStatusColor = (status: VarianceStatus, type: CategoryType): string => {
    if (status === 'neutre') return 'text-zinc-500';
    if (type === 'encaissement') {
      return status === 'favorable' ? 'text-emerald-600' : 'text-red-600';
    } else {
      // For decaissement, less spending is favorable
      return status === 'favorable' ? 'text-emerald-600' : 'text-red-600';
    }
  };

  const getStatusBg = (status: VarianceStatus, type: CategoryType): string => {
    if (status === 'neutre') return 'bg-zinc-100 dark:bg-zinc-800';
    if (type === 'encaissement') {
      return status === 'favorable' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30';
    } else {
      return status === 'favorable' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30';
    }
  };

  // Chart data for comparison
  const chartData = mockBudgetLines.map((line) => ({
    name: line.category.length > 15 ? line.category.substring(0, 15) + '...' : line.category,
    fullName: line.category,
    Budget: line.budgetAmount / 1000000000,
    Réalisé: line.realAmount / 1000000000,
    type: line.type,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Budget vs Réalisé
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Analyse des écarts entre prévisions budgétaires et réalisations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
          />
          <Button variant="outline" size="sm" icon="download">
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Encaissements */}
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Encaissements
            </span>
            <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-lg">trending_up</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Budget</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatAmount(totals.encaissement.budget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Réalisé</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatAmount(totals.encaissement.real)}</span>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
              <span className="text-zinc-500">Écart</span>
              <span className={`font-black ${totals.encaissement.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals.encaissement.variance >= 0 ? '+' : ''}{formatAmount(totals.encaissement.variance)}
                <span className="text-xs ml-1">({totals.encaissement.variancePercent.toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Décaissements */}
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Décaissements
            </span>
            <div className="size-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-lg">trending_down</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Budget</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatAmount(totals.decaissement.budget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Réalisé</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatAmount(totals.decaissement.real)}</span>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
              <span className="text-zinc-500">Économie</span>
              <span className={`font-black ${totals.decaissement.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals.decaissement.variance >= 0 ? '+' : ''}{formatAmount(totals.decaissement.variance)}
                <span className="text-xs ml-1">({totals.decaissement.variancePercent.toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Solde Net */}
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Solde Net
            </span>
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">account_balance</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Budgété</span>
              <span className={`font-bold ${totals.solde.budget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatAmount(totals.solde.budget)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Réalisé</span>
              <span className={`font-bold ${totals.solde.real >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatAmount(totals.solde.real)}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
              <span className="text-zinc-500">Écart</span>
              <span className={`font-black ${totals.solde.real - totals.solde.budget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals.solde.real - totals.solde.budget >= 0 ? '+' : ''}{formatAmount(totals.solde.real - totals.solde.budget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedType === 'all'
                ? 'bg-primary text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedType('encaissement')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedType === 'encaissement'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Encaissements
          </button>
          <button
            onClick={() => setSelectedType('decaissement')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedType === 'decaissement'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Décaissements
          </button>
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white dark:bg-zinc-900 shadow-sm' : ''
            }`}
          >
            <span className="material-symbols-outlined text-lg">table_rows</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'chart' ? 'bg-white dark:bg-zinc-900 shadow-sm' : ''
            }`}
          >
            <span className="material-symbols-outlined text-lg">bar_chart</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-4">Catégorie</div>
            <div className="col-span-2 text-right">Budget</div>
            <div className="col-span-2 text-right">Réalisé</div>
            <div className="col-span-2 text-right">Écart</div>
            <div className="col-span-2 text-right">%</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredLines.map((line) => (
              <React.Fragment key={line.id}>
                {/* Main Row */}
                <div
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${
                    line.subCategories ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => line.subCategories && toggleCategory(line.id)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    {line.subCategories && (
                      <span
                        className={`material-symbols-outlined text-lg text-zinc-400 transition-transform ${
                          expandedCategories.has(line.id) ? 'rotate-90' : ''
                        }`}
                      >
                        chevron_right
                      </span>
                    )}
                    <div
                      className={`size-3 rounded-full ${
                        line.type === 'encaissement' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-bold text-zinc-900 dark:text-white">{line.category}</span>
                  </div>
                  <div className="col-span-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {formatAmount(line.budgetAmount)}
                  </div>
                  <div className="col-span-2 text-right font-bold text-zinc-900 dark:text-white">
                    {formatAmount(line.realAmount)}
                  </div>
                  <div className={`col-span-2 text-right font-bold ${getStatusColor(line.status, line.type)}`}>
                    {line.variance >= 0 ? '+' : ''}{formatAmount(line.variance)}
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black ${getStatusBg(
                        line.status,
                        line.type
                      )} ${getStatusColor(line.status, line.type)}`}
                    >
                      {line.variancePercent >= 0 ? '+' : ''}{line.variancePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Sub-categories */}
                {line.subCategories && expandedCategories.has(line.id) && (
                  <div className="bg-zinc-50/50 dark:bg-zinc-800/20">
                    {line.subCategories.map((sub, idx) => {
                      const subVariance = sub.real - sub.budget;
                      const subVariancePercent = (subVariance / sub.budget) * 100;
                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-4 px-6 py-3 items-center border-l-4 border-zinc-200 dark:border-zinc-700 ml-6"
                        >
                          <div className="col-span-4 pl-8 text-sm text-zinc-600 dark:text-zinc-400">
                            {sub.name}
                          </div>
                          <div className="col-span-2 text-right text-sm text-zinc-500">
                            {formatAmount(sub.budget)}
                          </div>
                          <div className="col-span-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {formatAmount(sub.real)}
                          </div>
                          <div
                            className={`col-span-2 text-right text-sm font-medium ${
                              subVariance >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {subVariance >= 0 ? '+' : ''}{formatAmount(subVariance)}
                          </div>
                          <div className="col-span-2 text-right text-xs text-zinc-500">
                            {subVariancePercent >= 0 ? '+' : ''}{subVariancePercent.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Table Footer - Totals */}
          <div className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            {selectedType !== 'decaissement' && (
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 font-black text-emerald-600">Total Encaissements</div>
                <div className="col-span-2 text-right font-bold text-zinc-700 dark:text-zinc-300">
                  {formatAmount(totals.encaissement.budget)}
                </div>
                <div className="col-span-2 text-right font-black text-zinc-900 dark:text-white">
                  {formatAmount(totals.encaissement.real)}
                </div>
                <div
                  className={`col-span-2 text-right font-black ${
                    totals.encaissement.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {totals.encaissement.variance >= 0 ? '+' : ''}{formatAmount(totals.encaissement.variance)}
                </div>
                <div className="col-span-2 text-right font-black text-emerald-600">
                  {totals.encaissement.variancePercent >= 0 ? '+' : ''}{totals.encaissement.variancePercent.toFixed(1)}%
                </div>
              </div>
            )}
            {selectedType !== 'encaissement' && (
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-t border-zinc-200 dark:border-zinc-700">
                <div className="col-span-4 font-black text-red-600">Total Décaissements</div>
                <div className="col-span-2 text-right font-bold text-zinc-700 dark:text-zinc-300">
                  {formatAmount(totals.decaissement.budget)}
                </div>
                <div className="col-span-2 text-right font-black text-zinc-900 dark:text-white">
                  {formatAmount(totals.decaissement.real)}
                </div>
                <div
                  className={`col-span-2 text-right font-black ${
                    totals.decaissement.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {totals.decaissement.variance >= 0 ? '+' : ''}{formatAmount(totals.decaissement.variance)}
                </div>
                <div
                  className={`col-span-2 text-right font-black ${
                    totals.decaissement.variancePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {totals.decaissement.variancePercent >= 0 ? '+' : ''}{totals.decaissement.variancePercent.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar Chart Comparison */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-6">
              Comparaison par Catégorie
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis type="number" tickFormatter={(v) => `${v} Mds`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)} Mds FCFA`]}
                    labelFormatter={(label) => chartData.find((d) => d.name === label)?.fullName || label}
                  />
                  <Legend />
                  <Bar dataKey="Budget" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Réalisé" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.type === 'encaissement' ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Evolution */}
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-6">
              Évolution Mensuelle
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v} M`} />
                  <Tooltip formatter={(value: number) => [`${value} M FCFA`]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="budgetEncaissement"
                    name="Budget Encaiss."
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="realEncaissement"
                    name="Réel Encaiss."
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="budgetDecaissement"
                    name="Budget Décaiss."
                    stroke="#d4d4d8"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="realDecaissement"
                    name="Réel Décaiss."
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Variance Analysis */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">
          Analyse des Écarts Significatifs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Favorable variances */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">thumb_up</span>
              Écarts Favorables
            </h4>
            {mockBudgetLines
              .filter((l) => l.status === 'favorable' && Math.abs(l.variancePercent) > 5)
              .map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{line.category}</span>
                  <span className="text-sm font-black text-emerald-600">
                    +{formatAmount(Math.abs(line.variance))} ({line.variancePercent > 0 ? '+' : ''}{line.variancePercent.toFixed(1)}%)
                  </span>
                </div>
              ))}
          </div>

          {/* Unfavorable variances */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">thumb_down</span>
              Écarts Défavorables
            </h4>
            {mockBudgetLines
              .filter((l) => l.status === 'defavorable' && Math.abs(l.variancePercent) > 3)
              .map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{line.category}</span>
                  <span className="text-sm font-black text-red-600">
                    {formatAmount(line.variance)} ({line.variancePercent.toFixed(1)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetRealisePage;
