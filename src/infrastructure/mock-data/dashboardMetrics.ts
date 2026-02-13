import type { Metric, Transaction, Alert } from '@/shared/types';

/** Monthly actual vs forecast chart data (values in millions FCFA) */
export const chartData = [
  { month: 'Jan', actual: 1200, forecast: 1100, encaissements: 780, decaissements: 580 },
  { month: 'Fev', actual: 1350, forecast: 1250, encaissements: 820, decaissements: 530 },
  { month: 'Mar', actual: 1100, forecast: 1300, encaissements: 690, decaissements: 590 },
  { month: 'Avr', actual: 1500, forecast: 1400, encaissements: 910, decaissements: 410 },
  { month: 'Mai', actual: 1700, forecast: 1600, encaissements: 1020, decaissements: 320 },
  { month: 'Juin', actual: 1400, forecast: 1550, encaissements: 850, decaissements: 450 },
  { month: 'Juil', actual: 1850, forecast: 1750, encaissements: 1100, decaissements: 250 },
  { month: 'Aout', actual: 1600, forecast: 1650, encaissements: 950, decaissements: 350 },
  { month: 'Sep', actual: 1450, forecast: 1500, encaissements: 870, decaissements: 420 },
  { month: 'Oct', actual: 1550, forecast: 1480, encaissements: 940, decaissements: 390 },
  { month: 'Nov', actual: 1380, forecast: 1420, encaissements: 830, decaissements: 450 },
  { month: 'Dec', actual: 1650, forecast: 1580, encaissements: 1000, decaissements: 350 },
];

/** Backward-compatible alias */
export const data = chartData;

/** Dashboard KPI metrics */
export const metrics: Metric[] = [
  {
    label: 'Solde Actuel',
    value: '1,250,000,000 CFA',
    change: 2.1,
    trend: 'up',
    icon: 'account_balance_wallet',
  },
  {
    label: 'Recettes Mensuelles',
    value: '450,000,000 CFA',
    change: -1.5,
    trend: 'down',
    icon: 'trending_up',
  },
  {
    label: 'Paiements Mensuels',
    value: '380,000,000 CFA',
    change: 0.8,
    trend: 'up',
    icon: 'payments',
  },
  {
    label: 'Precision Forecast',
    value: '+5.2%',
    change: 0,
    trend: 'neutral',
    info: 'En cible',
    icon: 'analytics',
  },
];

/** Recent transactions for dashboard list */
export const transactions: Transaction[] = [
  {
    id: '1',
    entity: 'Expansion Reseau National',
    type: 'Payment',
    date: '12 Oct 2024',
    status: 'Completed',
    amount: '45,000,000 CFA',
  },
  {
    id: '2',
    entity: 'Redevances Municipales',
    type: 'Receipt',
    date: '11 Oct 2024',
    status: 'Pending',
    amount: '122,800,000 CFA',
  },
  {
    id: '3',
    entity: 'Centrale Solaire Abidjan',
    type: 'Payment',
    date: '10 Oct 2024',
    status: 'Completed',
    amount: '88,450,000 CFA',
  },
  {
    id: '4',
    entity: 'Facturation Zone Nord',
    type: 'Receipt',
    date: '09 Oct 2024',
    status: 'Completed',
    amount: '256,000,000 CFA',
  },
  {
    id: '5',
    entity: 'Maintenance Transformateurs',
    type: 'Payment',
    date: '08 Oct 2024',
    status: 'Pending',
    amount: '34,200,000 CFA',
  },
  {
    id: '6',
    entity: 'Vente Energie Aboisso',
    type: 'Receipt',
    date: '07 Oct 2024',
    status: 'Completed',
    amount: '178,500,000 CFA',
  },
  {
    id: '7',
    entity: 'Paiement Combustible Gaz',
    type: 'Payment',
    date: '06 Oct 2024',
    status: 'Completed',
    amount: '95,600,000 CFA',
  },
  {
    id: '8',
    entity: 'Subvention Etat T3',
    type: 'Receipt',
    date: '05 Oct 2024',
    status: 'Pending',
    amount: '320,000,000 CFA',
  },
];

/** Dashboard alert notifications */
export const alerts: Alert[] = [
  {
    id: '1',
    title: 'Trésorerie sous le seuil',
    message:
      'Le solde de trésorerie est passe sous le seuil minimum de 800M FCFA pour le Pole Distribution.',
    severity: 'critical',
    timestamp: 'Il y a 2h',
    read: false,
  },
  {
    id: '2',
    title: 'Ecart de prevision',
    message:
      'Le forecast du mois de Mars presente un ecart de +12% par rapport aux realisations.',
    severity: 'warning',
    timestamp: 'Il y a 5h',
    read: false,
  },
  {
    id: '3',
    title: 'Import en attente de validation',
    message:
      "3 fichiers d'import sont en attente de validation par le controleur.",
    severity: 'info',
    timestamp: 'Il y a 1 jour',
    read: true,
  },
];

/** Domain-level summary for the dashboard donut chart */
export const domainSummary = [
  { domain: 'Energie', encaissements: 4_200_000_000, decaissements: 1_800_000_000, color: '#E65000' },
  { domain: 'Gaz', encaissements: 1_500_000_000, decaissements: 2_100_000_000, color: '#FF8C00' },
  { domain: 'Fonctionnement', encaissements: 800_000_000, decaissements: 1_200_000_000, color: '#2196F3' },
  { domain: 'Service Bancaire', encaissements: 200_000_000, decaissements: 450_000_000, color: '#4CAF50' },
  { domain: 'Impots', encaissements: 350_000_000, decaissements: 1_100_000_000, color: '#9C27B0' },
  { domain: 'REM CIE', encaissements: 1_800_000_000, decaissements: 600_000_000, color: '#FF5722' },
  { domain: 'Annexe', encaissements: 650_000_000, decaissements: 320_000_000, color: '#607D8B' },
];

/** Monthly balance evolution for the dashboard line chart */
export const balanceEvolution = [
  { month: 'Jan', solde: 1_050_000_000 },
  { month: 'Fev', solde: 1_150_000_000 },
  { month: 'Mar', solde: 1_020_000_000 },
  { month: 'Avr', solde: 1_250_000_000 },
  { month: 'Mai', solde: 1_480_000_000 },
  { month: 'Juin', solde: 1_300_000_000 },
  { month: 'Juil', solde: 1_600_000_000 },
  { month: 'Aout', solde: 1_450_000_000 },
  { month: 'Sep', solde: 1_350_000_000 },
  { month: 'Oct', solde: 1_500_000_000 },
  { month: 'Nov', solde: 1_380_000_000 },
  { month: 'Dec', solde: 1_550_000_000 },
];
