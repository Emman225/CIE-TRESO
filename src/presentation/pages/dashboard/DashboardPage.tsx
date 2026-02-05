import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useToast } from '@/presentation/hooks/useToast';
import { MetricCard } from '@/presentation/components/ui/MetricCard';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { BarChartWidget } from '@/presentation/components/charts/BarChartWidget';
import { dashboardRepository } from '@/infrastructure/di/container';
import { PATH } from '@/shared/constants/routes';
import type { Metric, Transaction, Alert } from '@/shared/types';
import type { ChartDataPoint } from '@/domain/repositories/IDashboardRepository';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, addToast } = useToast();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t, a, c] = await Promise.all([
          dashboardRepository.getMetrics(),
          dashboardRepository.getTransactions(),
          dashboardRepository.getAlerts(),
          dashboardRepository.getChartData(),
        ]);
        setMetrics(m);
        setTransactions(t);
        setAlerts(a);
        setChartData(c);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleMetricClick = (m: Metric) => {
    addToast({
      type: 'info',
      title: m.label,
      message: `Valeur actuelle : ${m.value} | Variation : ${m.change >= 0 ? '+' : ''}${m.change}%`,
    });
  };

  const handleTransactionClick = (t: Transaction) => {
    addToast({
      type: t.status === 'Completed' ? 'success' : 'warning',
      title: `Transaction #${t.id}`,
      message: `${t.entity} - ${t.amount} (${t.status === 'Completed' ? 'Valide' : 'En attente'})`,
    });
  };

  const severityVariant = (severity: string) => {
    if (severity === 'critical') return 'error';
    if (severity === 'warning') return 'warning';
    return 'info';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl shadow-xl border text-sm font-bold animate-[slideUp_300ms_ease-out] ${
                t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <p className="font-black text-xs uppercase tracking-wider">{t.title}</p>
              {t.message && <p className="mt-1 text-xs opacity-80">{t.message}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Alert Indicators Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#e65000] text-xl">notifications_active</span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Alertes Actives</h3>
            <Badge variant="error">{alerts.filter(a => !a.read).length}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/30' :
                alert.severity === 'warning' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30' :
                'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-black text-zinc-900 dark:text-white">{alert.title}</h4>
                <Badge variant={severityVariant(alert.severity)}>
                  {alert.severity === 'critical' ? 'Critique' : alert.severity === 'warning' ? 'Alerte' : 'Info'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{alert.message}</p>
              <p className="text-[10px] text-zinc-400 mt-2 font-bold">{alert.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Plan de Tresorerie', icon: 'table_chart', path: PATH.PLAN, color: 'bg-[#e65000]' },
          { label: 'Centre d\'Import', icon: 'cloud_upload', path: PATH.IMPORTS, color: 'bg-[#137fec]' },
          { label: 'Simulation Forecast', icon: 'query_stats', path: PATH.FORECAST, color: 'bg-zinc-900 dark:bg-white dark:text-zinc-900' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`${action.color} text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2`}
          >
            <span className="material-symbols-outlined text-lg">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <MetricCard
            key={idx}
            label={m.label}
            value={m.value}
            change={m.change}
            trend={m.trend}
            info={m.info}
            icon={m.icon}
            onClick={() => handleMetricClick(m)}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Evolution Cash Flow (en Milliards)</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#e65000] shadow-sm shadow-[#e65000]/40"></span> Reel</div>
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#137fec] shadow-sm shadow-[#137fec]/40"></span> Forecast</div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e65000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e65000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                  cursor={{ stroke: '#e65000', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#e65000" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" animationDuration={1500} />
                <Line type="monotone" dataKey="forecast" stroke="#137fec" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#137fec', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Repartition par Flux</h3>
          <BarChartWidget
            items={[
              { label: 'Recettes Directes', value: 65, color: '#e65000' },
              { label: 'Paiements Fournisseurs', value: 42, color: '#137fec' },
              { label: 'Frais Generaux', value: 28, color: '#a1a1aa' },
            ]}
          />
          <div className="mt-8 p-5 bg-[#e65000]/5 rounded-2xl border border-[#e65000]/10 flex items-start gap-3 transform hover:scale-[1.02] transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[#e65000] text-2xl filled">insights</span>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-bold">
                Analyse IA : Les paiements sont <strong className="text-[#e65000]">4% inferieurs</strong> aux previsions, augmentant la liquidite disponible de 120M CFA ce mois-ci.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/30">
          <div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Flux Recents Entrants & Sortants</h3>
            <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">Dernieres 24 heures</p>
          </div>
          <button
            onClick={() => navigate(PATH.PLAN)}
            className="group bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            ACCEDER AU PLAN <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Entite / Projet</th>
                <th className="px-8 py-5">Categorie</th>
                <th className="px-8 py-5">Date d'Execution</th>
                <th className="px-8 py-5">Statut Systeme</th>
                <th className="px-8 py-5 text-right">Montant (CFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => handleTransactionClick(t)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer group active:bg-zinc-100"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 ${
                        t.type === 'Receipt' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {t.type === 'Receipt' ? 'download_for_offline' : 'upload_file'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{t.entity}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-bold">{t.type === 'Receipt' ? 'Encaissement' : 'Decaissement'}</td>
                  <td className="px-8 py-6 text-sm text-zinc-500 font-bold italic">{t.date}</td>
                  <td className="px-8 py-6">
                    <Badge variant={t.status === 'Completed' ? 'success' : 'warning'}>
                      {t.status === 'Completed' ? 'Termine' : 'En cours'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-base font-black text-right text-zinc-900 dark:text-zinc-100 tracking-tight">{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
