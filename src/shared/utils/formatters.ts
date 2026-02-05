import { APP_CONFIG } from '@/shared/constants/appConfig';

/**
 * Formate un montant en FCFA avec separateur de milliers.
 * Exemple: formatCurrency(1250000) => "1,250,000 FCFA"
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, APP_CONFIG.thousandsSeparator);
  return `${formatted} ${APP_CONFIG.currency}`;
}

/**
 * Formate un montant sans le suffixe de devise.
 * Exemple: formatAmount(1250000) => "1,250,000"
 */
export function formatAmount(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, APP_CONFIG.thousandsSeparator);
}

/**
 * Formate une date au format dd/MM/yyyy.
 * Exemple: formatDate("2025-01-15") => "15/01/2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formate une date avec l'heure au format dd/MM/yyyy HH:mm.
 * Exemple: formatDateTime("2025-01-15T14:30:00") => "15/01/2025 14:30"
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formate un pourcentage.
 * Exemple: formatPercent(0.1534) => "15.34%"
 * Exemple: formatPercent(0.1534, 1) => "15.3%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formate un numero de telephone ivoirien.
 * Exemple: formatPhone("0101020304") => "01 01 02 03 04"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

/**
 * Tronque un texte a une longueur maximale.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Formate un nombre avec un signe + ou - devant.
 * Exemple: formatSignedNumber(1250000) => "+1,250,000"
 */
export function formatSignedNumber(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatAmount(amount)}`;
}
