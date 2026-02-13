import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useToast } from '@/presentation/hooks/useToast';
import { Badge } from '@/presentation/components/ui/Badge';
import { PATH } from '@/shared/constants/routes';
import { configRepository } from '@/infrastructure/di/container';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

const allMonths = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai'];

const CashFlowPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState(allMonths);
  const [selectedPeriod, setSelectedPeriod] = useState('Mars 2024');
  const [selectedPlan, setSelectedPlan] = useState('Plan Trésorerie 2024');
  const [showHistory, setShowHistory] = useState(false);
  const [periodes, setPeriodes] = useState<PeriodeEntity[]>([]);
  const [plans, setPlans] = useState<PlanEntity[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [p, pl] = await Promise.all([
        configRepository.getPeriodes(),
        configRepository.getPlans(),
      ]);
      setPeriodes(p);
      setPlans(pl);
    };
    loadData();
  }, []);

  // History data
  const historyRows = [
    { plan: 'Annuel 2024', date: '12/02/2025 14:32', user: 'KOUASSI M.', detail: 'Validation des ecritures de Janvier', status: 'success' as const },
    { plan: 'Annuel 2024', date: '11/02/2025 09:15', user: 'TRAORE A.', detail: 'Import des donnees bancaires Fevrier', status: 'success' as const },
    { plan: 'Annuel 2025', date: '10/02/2025 16:45', user: 'KONAN B.', detail: 'Creation du plan previsionnel 2025', status: 'success' as const },
    { plan: 'Annuel 2024', date: '09/02/2025 11:20', user: 'DIALLO S.', detail: 'Tentative de cloture periode Mars', status: 'error' as const },
    { plan: 'Annuel 2024', date: '08/02/2025 08:50', user: 'KOUASSI M.', detail: 'Mise a jour des previsions Avril-Mai', status: 'success' as const },
    { plan: 'Annuel 2025', date: '07/02/2025 15:10', user: 'KONE D.', detail: 'Echec de synchronisation des comptes', status: 'error' as const },
    { plan: 'Annuel 2024', date: '06/02/2025 10:30', user: 'TRAORE A.', detail: 'Export des donnees consolidees Q1', status: 'success' as const },
    { plan: 'Annuel 2024', date: '05/02/2025 13:45', user: 'BEDIE R.', detail: 'Ajustement des provisions Decembre', status: 'success' as const },
  ];

  // Stable mock values
  const encaissementHeader = [1432, 1280, 1510, 1390, 1620];
  const encaissementRows = [
    { label: 'Clients Particuliers', values: [520, 480, 510, 490, 560] },
    { label: 'Paiements Mobile Money', values: [380, 340, 420, 360, 440] },
    { label: 'Grands Comptes', values: [532, 460, 580, 540, 620] },
  ];
  const decaissementHeader = [1120, 1080, 1210, 1150, 1340];
  const fluxNet = encaissementHeader.map((v, i) => v - decaissementHeader[i]);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const rows: Record<string, any>[] = [];
      rows.push({ Categorie: 'ENCAISSEMENTS', ...Object.fromEntries(allMonths.map((m, i) => [m, encaissementHeader[i] + ',000'])) });
      encaissementRows.forEach((r) => {
        rows.push({ Categorie: '  ' + r.label, ...Object.fromEntries(allMonths.map((m, i) => [m, r.values[i] + ',000'])) });
      });
      rows.push({ Categorie: 'DECAISSEMENTS', ...Object.fromEntries(allMonths.map((m, i) => [m, '(' + decaissementHeader[i] + ',000)'])) });
      rows.push({ Categorie: 'FLUX NET DE TRESORERIE', ...Object.fromEntries(allMonths.map((m, i) => [m, fluxNet[i] + ',000'])) });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Plan Trésorerie');
      XLSX.writeFile(wb, `Plan_Tresorerie_${selectedPlan.replace(/\s+/g, '_')}.xlsx`);

      addToast({ type: 'success', title: 'Export reussi', message: 'Le fichier Excel a ete telecharge.' });
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Echec de la generation du fichier Excel.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHistory = () => {
    const rows = historyRows.map((r) => ({
      Plan: r.plan,
      'Date & Heure': r.date,
      Utilisateur: r.user,
      Details: r.detail,
      Statut: r.status === 'success' ? 'Succes' : 'Echec',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');
    XLSX.writeFile(wb, 'Historique_Actions_Plan.xlsx');
    addToast({ type: 'success', title: 'Export reussi', message: 'Le fichier Excel a ete telecharge.' });
  };

  const toggleMonth = (month: string) => {
    if (visibleMonths.includes(month)) {
      if (visibleMonths.length > 1) setVisibleMonths((prev) => prev.filter((m) => m !== month));
    } else {
      setVisibleMonths((prev) => [...prev, month]);
    }
  };

  return (
    <div className="space-y-40 mb-12">
      {/* Toast */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
          {toasts.map((t) => (
            <div key={t.id} className={`p-4 rounded-2xl shadow-xl border text-sm font-bold ${
              t.type === 'success' ? 'bg-[#22a84c]/10 border-[#22a84c]/30 text-[#22a84c]' :
              t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <p className="font-black text-xs uppercase tracking-wider">{t.title}</p>
              {t.message && <p className="mt-1 text-xs opacity-80">{t.message}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-zinc-50/30">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Plan de Trésorerie Consolide</h2>
            <p className="text-zinc-500 font-medium mt-1">Reporting multi-entites CIE - Analyse du BFR en temps reel.</p>
          </div>

          {/* Plan selector + actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="h-10 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.label}>{p.label.replace(/^Plan\s*/i, '')}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-10 px-6 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:scale-105"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              {isExporting ? 'EXPORT...' : 'EXPORTER'}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className={`h-10 px-6 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 ${
                  showColumnConfig ? 'bg-zinc-900 text-white' : 'bg-[#e65000] text-white shadow-[#e65000]/20 hover:scale-105'
                }`}
              >
                <span className="material-symbols-outlined text-lg">view_column</span>
                COLONNES
              </button>

              {showColumnConfig && (
                <div className="absolute top-12 right-0 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 z-50">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Mois a afficher</p>
                  <div className="space-y-2">
                    {allMonths.map((m) => (
                      <label key={m} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={visibleMonths.includes(m)}
                          onChange={() => toggleMonth(m)}
                          className="rounded text-[#e65000] focus:ring-[#e65000] border-zinc-300"
                        />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#e65000] text-white text-[10px] font-black uppercase tracking-widest border-b border-[#e65000]">
                <th className="px-8 py-5 w-1/4">Categories de Flux</th>
                {allMonths.map((m, i) =>
                  visibleMonths.includes(m) ? (
                    <th key={m} className={`px-8 py-5 text-center ${m === 'Mars' ? 'bg-[#e65000]/5 text-[#e65000]' : ''}`}>
                      {m}<br />
                      <span className="font-bold opacity-60">
                        {m === 'Mars' ? 'ACTUEL' : ['Janvier', 'Fevrier'].includes(m) ? 'REEL' : 'FORECAST'}
                      </span>
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Encaissements Header */}
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 font-black text-sm group">
                <td className="px-8 py-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e65000] text-xl">expand_more</span>
                  ENCAISSEMENTS
                </td>
                {allMonths.map((m, i) =>
                  visibleMonths.includes(m) ? (
                    <td key={m} className={`px-8 py-5 text-center ${m === 'Mars' ? 'bg-[#e65000]/5 text-[#e65000]' : ''}`}>
                      {encaissementHeader[i].toLocaleString()},000
                    </td>
                  ) : null
                )}
              </tr>
              {encaissementRows.map((row, ri) => (
                <tr key={ri} className="text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-14 py-4 font-bold">{row.label}</td>
                  {allMonths.map((m, i) =>
                    visibleMonths.includes(m) ? (
                      <td key={m} className={`px-8 py-4 text-center ${m === 'Mars' ? 'bg-[#e65000]/5' : ''}`}>
                        {row.values[i].toLocaleString()},000
                      </td>
                    ) : null
                  )}
                </tr>
              ))}

              {/* Decaissements */}
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 font-black text-sm border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-8 py-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e65000] text-xl">expand_more</span>
                  DECAISSEMENTS
                </td>
                {allMonths.map((m, i) =>
                  visibleMonths.includes(m) ? (
                    <td key={m} className={`px-8 py-5 text-center ${m === 'Mars' ? 'bg-[#e65000]/5 text-[#e65000]' : ''}`}>
                      ({decaissementHeader[i].toLocaleString()},000)
                    </td>
                  ) : null
                )}
              </tr>

              {/* Net */}
              <tr className="bg-zinc-900 text-white font-black text-sm">
                <td className="px-8 py-6 uppercase tracking-wider">Flux Net de Trésorerie</td>
                {allMonths.map((m, i) =>
                  visibleMonths.includes(m) ? (
                    <td key={m} className={`px-8 py-6 text-center ${m === 'Mars' ? 'text-[#2ec45a] bg-white/5 font-black text-base' : 'text-zinc-400'}`}>
                      {fluxNet[i].toLocaleString()},000
                    </td>
                  ) : null
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des actions – collapsible */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-zinc-50/30 flex items-center justify-between gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 flex items-center justify-between gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="text-left">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                Historique des actions
                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-[#e65000] text-white text-[10px] font-black">
                  {historyRows.length}
                </span>
              </h3>
              <p className="text-zinc-500 font-medium text-sm mt-1">Journal des operations effectuees sur les plans de trésorerie</p>
            </div>
            <span className={`material-symbols-outlined text-2xl text-zinc-400 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          <button
            onClick={handleExportHistory}
            className="h-10 px-6 rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:scale-105"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            EXPORTER
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showHistory ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#e65000] text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Plan</th>
                  <th className="px-8 py-4">Date & Heure</th>
                  <th className="px-8 py-4">Utilisateur</th>
                  <th className="px-8 py-4">Details</th>
                  <th className="px-8 py-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {historyRows.map((row, i) => (
                  <tr key={i} className="text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-4 font-bold text-zinc-900 dark:text-white">{row.plan}</td>
                    <td className="px-8 py-4 text-zinc-500 font-mono text-xs">{row.date}</td>
                    <td className="px-8 py-4 text-zinc-700 dark:text-zinc-300 font-medium">{row.user}</td>
                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400">{row.detail}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        row.status === 'success'
                          ? 'bg-[#22a84c]/10 text-[#22a84c] dark:bg-[#22a84c]/20 dark:text-[#2ec45a]'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {row.status === 'success' ? 'check_circle' : 'cancel'}
                        </span>
                        {row.status === 'success' ? 'Succes' : 'Echec'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowPlanPage;
