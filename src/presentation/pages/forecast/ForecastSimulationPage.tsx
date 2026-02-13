import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Modal } from '@/presentation/components/ui/Modal';
import { MultiScenarioChart } from '@/presentation/components/charts/MultiScenarioChart';
import { useToast } from '@/presentation/hooks/useToast';
import { MONTHS_FR } from '@/shared/constants/appConfig';
import { configRepository } from '@/infrastructure/di/container';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

// ============ Types ============
interface ScenarioParam {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

interface Snapshot {
  id: string;
  name: string;
  date: string;
  scenarioName: string;
  kpis: { label: string; value: string }[];
}

// ============ Mock Data ============
const INITIAL_PARAMS: ScenarioParam[] = [
  { key: 'energie', label: 'Energie', value: 5, min: -20, max: 30, step: 0.5, unit: '%' },
  { key: 'rem_cie', label: 'REM CIE', value: 0, min: -15, max: 25, step: 0.5, unit: '%' },
  { key: 'fonctionnement', label: 'Fonctionnement', value: 0, min: -30, max: 50, step: 1, unit: '%' },
  { key: 'service_bancaire', label: 'Service Bancaire', value: 0, min: -20, max: 30, step: 0.5, unit: '%' },
  { key: 'import', label: 'Import', value: 0, min: -25, max: 40, step: 1, unit: '%' },
  { key: 'annexe', label: 'Annexe', value: 0, min: -15, max: 25, step: 0.5, unit: '%' },
  { key: 'gaz', label: 'Gaz', value: 0, min: -30, max: 50, step: 1, unit: '%' },
];

const BASE_VALUES = [45, 52, 48, 55, 60, 58, 63, 70, 65, 72, 68, 75];

function generateScenarioData(params: ScenarioParam[]) {
  const getVal = (key: string) => (params.find((p) => p.key === key)?.value || 0) / 100;
  const energie = getVal('energie');
  const remCie = getVal('rem_cie');
  const fonct = getVal('fonctionnement');
  const bancaire = getVal('service_bancaire');
  const imp = getVal('import');
  const annexe = getVal('annexe');
  const gaz = getVal('gaz');
  const totalEffect = energie + remCie * 0.8 + fonct * 0.5 - bancaire * 0.3 - imp * 0.4 - annexe * 0.2 - gaz * 0.6;

  return MONTHS_FR.map((month, i) => ({
    month: month.substring(0, 3),
    realistic: Math.round(BASE_VALUES[i] * (1 + totalEffect * 0.7)),
    optimistic: Math.round(BASE_VALUES[i] * (1 + totalEffect * 1.3)),
    pessimistic: Math.round(BASE_VALUES[i] * (1 + totalEffect * 0.3)),
    baseline: BASE_VALUES[i],
  }));
}

const SCENARIO_TABS = [
  { id: 'realistic', label: 'Realiste', icon: 'trending_flat' },
  { id: 'optimistic', label: 'Optimiste', icon: 'trending_up' },
  { id: 'pessimistic', label: 'Pessimiste', icon: 'trending_down' },
];

const ForecastSimulationPage: React.FC = () => {
  const { addToast } = useToast();

  // Parameters state
  const [params, setParams] = useState<ScenarioParam[]>(INITIAL_PARAMS);
  const [activeScenario, setActiveScenario] = useState('realistic');
  const [isSimulating, setIsSimulating] = useState(false);
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');

  useEffect(() => {
    configRepository.getPlans().then(setPlans);
  }, []);

  // Snapshot state
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    {
      id: '1',
      name: 'Baseline Q1 2024',
      date: '2024-03-15 14:30',
      scenarioName: 'Realiste',
      kpis: [
        { label: 'Solde previsionnel', value: '75.2 Mds' },
        { label: 'Flux net moyen', value: '6.3 Mds/mois' },
        { label: 'Risque de rupture', value: 'Faible' },
      ],
    },
    {
      id: '2',
      name: 'Stress Test Fev 2024',
      date: '2024-02-28 10:15',
      scenarioName: 'Pessimiste',
      kpis: [
        { label: 'Solde previsionnel', value: '32.1 Mds' },
        { label: 'Flux net moyen', value: '2.7 Mds/mois' },
        { label: 'Risque de rupture', value: 'Eleve' },
      ],
    },
  ]);

  // Save snapshot modal
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  // Computed chart data
  const chartData = useMemo(() => generateScenarioData(params), [params]);

  // KPI metrics
  const kpis = useMemo(() => {
    const scenarioKey = activeScenario as 'realistic' | 'optimistic' | 'pessimistic';
    const values = chartData.map((d) => d[scenarioKey]);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const lastThree = values.slice(-3);
    const trend = lastThree[2] - lastThree[0];

    return [
      { label: 'Solde previsionnel', value: `${values[values.length - 1]} Mds`, icon: 'account_balance', color: '#e65000' },
      { label: 'Flux net moyen', value: `${avg.toFixed(1)} Mds/mois`, icon: 'swap_vert', color: '#137fec' },
      { label: 'Min / Max', value: `${min} / ${max} Mds`, icon: 'unfold_more', color: '#22a84c' },
      { label: 'Tendance', value: `${trend > 0 ? '+' : ''}${trend} Mds`, icon: trend >= 0 ? 'trending_up' : 'trending_down', color: trend >= 0 ? '#22a84c' : '#ef4444' },
    ];
  }, [chartData, activeScenario]);

  // Update parameter
  const updateParam = useCallback((key: string, value: number) => {
    setParams((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));
  }, []);

  // Run simulation
  const handleRunSimulation = useCallback(async () => {
    setIsSimulating(true);
    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSimulating(false);
    addToast('Simulation executee avec succes', 'success');
  }, [addToast]);

  // Reset parameters
  const handleReset = useCallback(() => {
    setParams(INITIAL_PARAMS);
    addToast('Parametres reinitialises', 'info');
  }, [addToast]);

  // Save snapshot
  const handleSaveSnapshot = useCallback(() => {
    if (!snapshotName.trim()) {
      addToast('Veuillez nommer le snapshot', 'error');
      return;
    }

    const scenarioLabel = SCENARIO_TABS.find((s) => s.id === activeScenario)?.label || activeScenario;
    const newSnapshot: Snapshot = {
      id: String(Date.now()),
      name: snapshotName.trim(),
      date: new Date().toLocaleString('fr-FR'),
      scenarioName: scenarioLabel,
      kpis: kpis.map((k) => ({ label: k.label, value: k.value })),
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);
    setIsSnapshotModalOpen(false);
    setSnapshotName('');
    addToast(`Snapshot "${snapshotName}" sauvegarde`, 'success');
  }, [snapshotName, activeScenario, kpis, addToast]);

  // Export (placeholder)
  const handleExport = useCallback((format: 'excel' | 'pdf') => {
    addToast(`Export ${format.toUpperCase()} en cours de generation...`, 'info');
  }, [addToast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Simulation & Scenarios
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Previsions et simulation de scenarios de trésorerie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="h-9 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Tous les plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.label.replace(/^Plan\s*/i, '')}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" icon="photo_camera" onClick={() => setIsSnapshotModalOpen(true)}>
            Snapshot
          </Button>
          <Button variant="outline" size="sm" icon="table_chart" onClick={() => handleExport('excel')}>
            Excel
          </Button>
          <Button variant="outline" size="sm" icon="picture_as_pdf" onClick={() => handleExport('pdf')}>
            PDF
          </Button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <Tabs tabs={SCENARIO_TABS} activeTab={activeScenario} onTabChange={setActiveScenario} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 h-1 w-full"
              style={{ backgroundColor: kpi.color }}
            />
            <div className="flex items-center gap-3 mb-3">
              <div
                className="size-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <span className="material-symbols-outlined text-xl" style={{ color: kpi.color }}>
                  {kpi.icon}
                </span>
              </div>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                {kpi.label}
              </p>
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Adjustment Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
                  Parametres Analyste
                </h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Ajustements manuels
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {params.map((param) => (
              <div key={param.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    {param.label}
                  </label>
                  <span className="text-sm font-black text-primary">
                    {param.value}{param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={param.value}
                  onChange={(e) => updateParam(param.key, Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-400">{param.min}{param.unit}</span>
                  <span className="text-[10px] text-zinc-400">{param.max}{param.unit}</span>
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-3">
              <Button
                variant="primary"
                size="md"
                icon="play_arrow"
                isLoading={isSimulating}
                onClick={handleRunSimulation}
                className="w-full"
              >
                {isSimulating ? 'SIMULATION...' : 'LANCER LA SIMULATION'}
              </Button>
              <Button variant="ghost" size="sm" icon="restart_alt" onClick={handleReset} className="w-full">
                Reinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Right - Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                Projection Multi-Scenarios
              </h3>
              <p className="text-xs text-zinc-500 font-bold mt-0.5">
                Evolution mensuelle sur 12 mois (en milliards FCFA)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[#e65000]" />
                <span className="text-[10px] font-black text-zinc-400 uppercase">Realiste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[#22a84c]" />
                <span className="text-[10px] font-black text-zinc-400 uppercase">Optimiste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase">Pessimiste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full border-2 border-zinc-400 border-dashed" />
                <span className="text-[10px] font-black text-zinc-400 uppercase">Reference</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <MultiScenarioChart data={chartData} height={420} />
          </div>
        </div>
      </div>

      {/* Snapshot History */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-400">history</span>
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                Historique des Snapshots
              </h3>
              <p className="text-xs text-zinc-500 font-bold">
                {snapshots.length} snapshot{snapshots.length > 1 ? 's' : ''} sauvegarde{snapshots.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">
                photo_camera
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-400">
              Aucun snapshot enregistre
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="px-8 py-5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">photo_camera</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {snapshot.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-400">{snapshot.date}</span>
                      <Badge variant="info">{snapshot.scenarioName}</Badge>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  {snapshot.kpis.map((kpi) => (
                    <div key={kpi.label} className="text-right">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{kpi.label}</p>
                      <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">{kpi.value}</p>
                    </div>
                  ))}
                  <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Snapshot Modal */}
      <Modal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        title="Sauvegarder un snapshot"
        description="Enregistrez l'etat actuel de la simulation pour reference future"
        size="md"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button variant="outline" size="md" onClick={() => setIsSnapshotModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" size="md" icon="save" onClick={handleSaveSnapshot} className="flex-1">
              Sauvegarder
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Nom du snapshot <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="Ex: Budget previsionnel Q2 2024"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Preview KPIs */}
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
              Metriques incluses
            </label>
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">{kpi.label}</p>
                  <p className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500">info</span>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Scenario actif: <span className="font-black">{SCENARIO_TABS.find((s) => s.id === activeScenario)?.label}</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForecastSimulationPage;
