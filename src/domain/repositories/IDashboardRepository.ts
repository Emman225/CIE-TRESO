import type { Metric, Transaction, Alert } from '@/shared/types';

export interface ChartDataPoint {
  month: string;
  actual: number;
  forecast: number;
  encaissements: number;
  decaissements: number;
}

export interface IDashboardRepository {
  getMetrics(): Promise<Metric[]>;
  getTransactions(): Promise<Transaction[]>;
  getAlerts(): Promise<Alert[]>;
  getChartData(): Promise<ChartDataPoint[]>;
}
