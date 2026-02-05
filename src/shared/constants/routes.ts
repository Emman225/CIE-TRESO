import { View } from '@/shared/types/views';

export const ROUTES: Record<View, string> = {
  [View.Login]: '/login',
  [View.ForgotPassword]: '/forgot-password',
  [View.Dashboard]: '/',
  [View.Plan]: '/plan',
  [View.SaisieEncaissement]: '/saisie/encaissement',
  [View.SaisieDecaissement]: '/saisie/decaissement',
  [View.Imports]: '/imports',
  [View.Forecast]: '/forecast',
  [View.Reporting]: '/reporting',
  [View.Validation]: '/validation',
  [View.Position]: '/position',
  [View.Rapprochement]: '/rapprochement',
  [View.Notifications]: '/notifications',
  [View.Echeancier]: '/echeancier',
  [View.BudgetRealise]: '/budget-realise',
  [View.Historique]: '/historique',
  [View.VisEnergie]: '/visualisations/energie',
  [View.VisRemCie]: '/visualisations/rem-cie',
  [View.VisFonctionnement]: '/visualisations/fonctionnement',
  [View.VisServiceBancaire]: '/visualisations/service-bancaire',
  [View.VisImpot]: '/visualisations/impot',
  [View.VisAnnexe]: '/visualisations/annexe',
  [View.VisGaz]: '/visualisations/gaz',
  [View.Users]: '/users',
  [View.Profiles]: '/profiles',
  [View.Settings]: '/settings',
};

export const PUBLIC_ROUTES: View[] = [View.Login, View.ForgotPassword];

export const getRouteForView = (view: View): string => {
  return ROUTES[view];
};

export const getViewForRoute = (path: string): View | undefined => {
  const entries = Object.entries(ROUTES) as [View, string][];
  const match = entries.find(([, route]) => route === path);
  return match ? match[0] : undefined;
};

/** Simple path constants for direct use in navigate() and route definitions */
export const PATH = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  PLAN: '/plan',
  IMPORTS: '/imports',
  FORECAST: '/forecast',
  USERS: '/users',
  PROFILES: '/profiles',
  SETTINGS: '/settings',
  SAISIE_ENCAISSEMENT: '/saisie/encaissement',
  SAISIE_DECAISSEMENT: '/saisie/decaissement',
  REPORTING: '/reporting',
  VALIDATION: '/validation',
  POSITION: '/position',
  RAPPROCHEMENT: '/rapprochement',
  NOTIFICATIONS: '/notifications',
  ECHEANCIER: '/echeancier',
  BUDGET_REALISE: '/budget-realise',
  HISTORIQUE: '/historique',
  VIS_ENERGIE: '/visualisations/energie',
  VIS_REM_CIE: '/visualisations/rem-cie',
  VIS_FONCTIONNEMENT: '/visualisations/fonctionnement',
  VIS_SERVICE_BANCAIRE: '/visualisations/service-bancaire',
  VIS_IMPOT: '/visualisations/impot',
  VIS_ANNEXE: '/visualisations/annexe',
  VIS_GAZ: '/visualisations/gaz',
} as const;
