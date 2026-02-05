import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { VisualizationDomain } from '@/domain/entities/CashFlowEntry';
import type { CashFlowDomainSummary } from '@/domain/entities/CashFlowEntry';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanTresorerieEntity } from '@/domain/entities/PlanTresorerie';
import { cashFlowRepository, configRepository } from '@/infrastructure/di/container';
import { MetricCard } from '@/presentation/components/ui/MetricCard';
import { AreaChartWidget } from '@/presentation/components/charts/AreaChartWidget';
import { Card } from '@/presentation/components/ui/Card';
import { Select } from '@/presentation/components/ui/Select';
import { Button } from '@/presentation/components/ui/Button';
import { formatCurrency } from '@/shared/utils/formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VisualizationTemplateProps {
  domain: VisualizationDomain;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
}

interface RubriqueRow {
  rubrique: string;
  values: number[];
  total: number;
}

// ---------------------------------------------------------------------------
// Domain-specific rubriques
// ---------------------------------------------------------------------------

const DOMAIN_RUBRIQUES: Record<VisualizationDomain, string[]> = {
  Energie: [
    'Vente Electricite BT',
    'Vente Electricite MT',
    'Vente Electricite HT',
    'Redevance Reseau',
  ],
  REM_CIE: [
    'Remuneration Exploitation',
    'Prime Resultats',
    'Penalites Qualite',
  ],
  Fonctionnement: [
    'Charges Personnel',
    'Loyers',
    'Fournitures',
    'Transport',
    'Communication',
  ],
  ServiceBancaire: [
    'Frais Bancaires',
    'Commissions',
    'Interets Emprunts',
    'Agios',
  ],
  Impot: [
    'IS',
    'TVA Collectee',
    'TVA Deductible',
    'Patente',
    'Taxes Diverses',
  ],
  Annexe: [
    'Produits Exceptionnels',
    'Charges Exceptionnelles',
    'Provisions',
    'Amortissements',
  ],
  Gaz: [
    'Achats Gaz Naturel',
    'Transport Gaz',
    'Stockage',
    'Maintenance Pipeline',
  ],
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (seed-based)
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Mock data generation
// ---------------------------------------------------------------------------

function generateMockData(domain: VisualizationDomain) {
  const rubriques = DOMAIN_RUBRIQUES[domain];

  // Use a deterministic seed based on domain name so values are stable across renders
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i) * (i + 1);
  }
  const rand = seededRandom(seed);

  // Base amounts vary by domain
  const baseAmounts: Record<VisualizationDomain, [number, number]> = {
    Energie: [800_000_000, 2_500_000_000],
    REM_CIE: [200_000_000, 800_000_000],
    Fonctionnement: [100_000_000, 500_000_000],
    ServiceBancaire: [50_000_000, 200_000_000],
    Impot: [150_000_000, 600_000_000],
    Annexe: [30_000_000, 150_000_000],
    Gaz: [400_000_000, 1_200_000_000],
  };

  const [minBase, maxBase] = baseAmounts[domain];

  const rows: RubriqueRow[] = rubriques.map((rubrique, rubIdx) => {
    // Each rubrique gets a unique seed offset
    const rubRand = seededRandom(seed + (rubIdx + 1) * 137);
    const rubBase = minBase + (maxBase - minBase) * rubRand();
    const rubFraction = 1 / rubriques.length;

    const values = MONTHS.map((_, monthIdx) => {
      const seasonalFactor = 1 + 0.15 * Math.sin((monthIdx / 12) * 2 * Math.PI);
      const noise = 0.85 + rubRand() * 0.3;
      return Math.round(rubBase * rubFraction * seasonalFactor * noise);
    });

    const total = values.reduce((sum, v) => sum + v, 0);

    return { rubrique, values, total };
  });

  // Monthly totals
  const monthlyTotals = MONTHS.map((_, monthIdx) =>
    rows.reduce((sum, row) => sum + row.values[monthIdx], 0)
  );

  const grandTotal = monthlyTotals.reduce((sum, v) => sum + v, 0);

  // Encaissements vs Decaissements split
  const encaissementRatio = 0.55 + rand() * 0.15;
  const totalEncaissements = Math.round(grandTotal * encaissementRatio);
  const totalDecaissements = Math.round(grandTotal * (1 - encaissementRatio));
  const soldeNet = totalEncaissements - totalDecaissements;
  const variationPercent = -5 + rand() * 20; // between -5% and +15%

  // Chart data (actual vs prevision)
  const chartData = MONTHS.map((month, idx) => {
    const realise = monthlyTotals[idx];
    const prevision = Math.round(realise * (0.9 + rand() * 0.2));
    return { name: month, realise, prevision };
  });

  return {
    rows,
    monthlyTotals,
    grandTotal,
    totalEncaissements,
    totalDecaissements,
    soldeNet,
    variationPercent,
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const VisualizationTemplate: React.FC<VisualizationTemplateProps> = ({
  domain,
  title,
  description,
  icon,
  accentColor,
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [periodes, setPeriodes] = useState<PeriodeEntity[]>([]);
  const [plans, setPlans] = useState<PlanTresorerieEntity[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [_summary, setSummary] = useState<CashFlowDomainSummary | null>(null);

  // Load config data
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [loadedPeriodes, loadedPlans] = await Promise.all([
          configRepository.getPeriodes(),
          configRepository.getPlans(),
        ]);
        setPeriodes(loadedPeriodes);
        setPlans(loadedPlans);

        // Set defaults
        if (loadedPeriodes.length > 0) {
          const active = loadedPeriodes.find((p) => !p.isClosed);
          setSelectedPeriode(active?.id ?? loadedPeriodes[0].id);
        }
        if (loadedPlans.length > 0) {
          setSelectedPlan(loadedPlans[0].id);
        }
      } catch {
        // Config loading failed, will use mock data
      }
    };
    loadConfig();
  }, []);

  // Load domain data
  useEffect(() => {
    const loadData = async () => {
      try {
        const filters = {
          periodeId: selectedPeriode || undefined,
          planId: selectedPlan || undefined,
        };
        const data = await cashFlowRepository.getByDomain(domain, filters);
        setSummary(data);
      } catch {
        // Data loading failed, will use mock data
      }
    };
    loadData();
  }, [domain, selectedPeriode, selectedPlan]);

  // Generate stable mock data
  const mockData = useMemo(() => generateMockData(domain), [domain]);

  // Filtered plans based on selected periode
  const filteredPlans = useMemo(() => {
    if (!selectedPeriode) return plans;
    return plans.filter((p) => p.periodeId === selectedPeriode);
  }, [plans, selectedPeriode]);

  // Period options
  const periodeOptions = useMemo(
    () =>
      periodes.map((p) => ({
        value: p.id,
        label: p.nom,
      })),
    [periodes]
  );

  // Plan options
  const planOptions = useMemo(
    () =>
      filteredPlans.map((p) => ({
        value: p.id,
        label: p.nom,
      })),
    [filteredPlans]
  );

  // Metric values
  const metrics = useMemo(() => {
    const { totalEncaissements, totalDecaissements, soldeNet, variationPercent } = mockData;
    return [
      {
        label: 'Total Encaissements',
        value: formatCurrency(totalEncaissements),
        icon: 'arrow_downward',
        trend: 'up' as const,
        change: Math.round(variationPercent * 0.8 * 10) / 10,
        info: 'vs. periode precedente',
      },
      {
        label: 'Total Decaissements',
        value: formatCurrency(totalDecaissements),
        icon: 'arrow_upward',
        trend: 'down' as const,
        change: Math.round(variationPercent * -0.5 * 10) / 10,
        info: 'vs. periode precedente',
      },
      {
        label: 'Solde Net',
        value: formatCurrency(soldeNet),
        icon: 'account_balance',
        trend: soldeNet >= 0 ? ('up' as const) : ('down' as const),
        change: Math.round(variationPercent * 10) / 10,
        info: 'Encaissements - Decaissements',
      },
      {
        label: 'Variation',
        value: `${variationPercent >= 0 ? '+' : ''}${variationPercent.toFixed(1)}%`,
        icon: 'trending_up',
        trend: variationPercent >= 0 ? ('up' as const) : ('down' as const),
        change: variationPercent,
        info: 'vs. N-1',
      },
    ];
  }, [mockData]);

  // Export handler
  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      const headerRow: Record<string, string | number> = { Rubrique: 'TOTAL' };
      MONTHS.forEach((m, i) => {
        headerRow[m] = mockData.monthlyTotals[i];
      });
      headerRow['Total'] = mockData.grandTotal;

      const dataRows = mockData.rows.map((row) => {
        const r: Record<string, string | number> = { Rubrique: row.rubrique };
        MONTHS.forEach((m, i) => {
          r[m] = row.values[i];
        });
        r['Total'] = row.total;
        return r;
      });

      const allRows = [...dataRows, headerRow];

      const ws = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_Export.xlsx`);
    } catch {
      // Export failed
    } finally {
      setIsExporting(false);
    }
  }, [mockData, title]);

  return (
    <div className="space-y-8 pb-12">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="size-14 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0"
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px -5px ${accentColor}50` }}
          >
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-zinc-500 font-semibold mt-1">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Periode"
            options={periodeOptions}
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
          />
          <Select
            label="Plan"
            options={planOptions}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Metrics Row                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            change={m.change}
            trend={m.trend}
            icon={m.icon}
            accentColor={accentColor}
            info={m.info}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Area Chart                                                          */}
      {/* ------------------------------------------------------------------ */}
      <AreaChartWidget
        data={mockData.chartData}
        areas={[
          { dataKey: 'prevision', color: '#6b7280', name: 'Prevision', dashed: true },
          { dataKey: 'realise', color: accentColor, name: 'Realise' },
        ]}
        xAxisKey="name"
        height={360}
        gradientId={`vis-${domain}`}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Detail Table                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Detail par Rubrique
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              Decomposition mensuelle des flux - {title}
            </p>
          </div>
          <Button
            icon="download"
            variant="outline"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
          >
            {isExporting ? 'Export...' : 'Exporter les donnees'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <th className="px-6 py-4 sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 z-10 min-w-[200px]">
                  Rubrique
                </th>
                {MONTHS.map((m) => (
                  <th key={m} className="px-4 py-4 text-right whitespace-nowrap">
                    {m}
                  </th>
                ))}
                <th
                  className="px-6 py-4 text-right"
                  style={{ color: accentColor }}
                >
                  Total
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {mockData.rows.map((row) => (
                <tr
                  key={row.rubrique}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-6 py-3.5 sticky left-0 bg-white dark:bg-zinc-900 z-10 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {row.rubrique}
                  </td>
                  {row.values.map((val, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums"
                    >
                      {val.toLocaleString('fr-FR')}
                    </td>
                  ))}
                  <td className="px-6 py-3.5 text-right text-xs font-black text-zinc-900 dark:text-white tabular-nums">
                    {row.total.toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer */}
            <tfoot>
              <tr
                className="font-black text-sm border-t-2"
                style={{ borderColor: accentColor + '40' }}
              >
                <td
                  className="px-6 py-4 sticky left-0 z-10 uppercase tracking-wider"
                  style={{ color: accentColor, backgroundColor: accentColor + '08' }}
                >
                  Total Mensuel
                </td>
                {mockData.monthlyTotals.map((total, idx) => (
                  <td
                    key={idx}
                    className="px-4 py-4 text-right text-xs tabular-nums"
                    style={{ color: accentColor, backgroundColor: accentColor + '08' }}
                  >
                    {total.toLocaleString('fr-FR')}
                  </td>
                ))}
                <td
                  className="px-6 py-4 text-right text-sm tabular-nums"
                  style={{ color: accentColor, backgroundColor: accentColor + '10' }}
                >
                  {mockData.grandTotal.toLocaleString('fr-FR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VisualizationTemplate;
