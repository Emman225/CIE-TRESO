export const APP_CONFIG = {
  appName: 'CIE TRESO',
  appFullName: 'CIE - Gestion de Trésorerie',
  companyName: 'Compagnie Ivoirienne d\'Electricite',
  companyAbbreviation: 'CIE',
  currency: 'FCFA',
  currencyCode: 'XOF',
  locale: 'fr-FR',
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  shortDateFormat: 'dd/MM',
  yearMonthFormat: 'MM/yyyy',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  defaultPageSize: 20,
  maxPageSize: 100,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordMinLength: 8,
  tokenRefreshThresholdMinutes: 5,
} as const;

export const MONTHS_FR = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
] as const;

export const DAYS_FR = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

export type MonthFR = (typeof MONTHS_FR)[number];
export type DayFR = (typeof DAYS_FR)[number];
