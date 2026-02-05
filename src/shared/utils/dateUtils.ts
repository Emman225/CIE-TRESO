import { MONTHS_FR } from '@/shared/constants/appConfig';

/**
 * Retourne la date actuelle au format ISO.
 */
export function getCurrentDate(): string {
  return new Date().toISOString();
}

/**
 * Retourne la date actuelle au format yyyy-MM-dd.
 */
export function getCurrentDateShort(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retourne le nom du mois en francais (index 0-11).
 */
export function getMonthName(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) return '';
  return MONTHS_FR[monthIndex];
}

/**
 * Retourne le nom du mois en francais a partir d'une date.
 */
export function getMonthNameFromDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return MONTHS_FR[date.getMonth()];
}

/**
 * Retourne l'annee et le mois courant.
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Retourne l'annee courante.
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Retourne une plage de dates au format ISO entre deux dates.
 */
export function getDateRange(startDate: string, endDate: string): { start: string; end: string } {
  return {
    start: new Date(startDate).toISOString(),
    end: new Date(endDate).toISOString(),
  };
}

/**
 * Retourne le premier et le dernier jour du mois donne.
 */
export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Retourne le premier et le dernier jour de l'annee donnee.
 */
export function getYearDateRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

/**
 * Calcule la difference en jours entre deux dates.
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifie si une date est dans le passe.
 */
export function isPastDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
}

/**
 * Verifie si une date est aujourd'hui.
 */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Ajoute un nombre de jours a une date.
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Ajoute un nombre de mois a une date.
 */
export function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Retourne la liste des mois d'une annee avec label et numero.
 */
export function getMonthsOfYear(year: number): Array<{ label: string; month: number; year: number }> {
  return MONTHS_FR.map((label, index) => ({
    label,
    month: index + 1,
    year,
  }));
}

/**
 * Parse une date au format dd/MM/yyyy et retourne un objet Date.
 */
export function parseFrenchDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;

  return date;
}
