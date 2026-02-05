import type { IDashboardRepository, ChartDataPoint } from '@/domain/repositories/IDashboardRepository';
import type { Metric, Transaction, Alert } from '@/shared/types';
import { chartData, metrics, transactions, alerts } from '@/infrastructure/mock-data/dashboardMetrics';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockDashboardRepository implements IDashboardRepository {
  async getMetrics(): Promise<Metric[]> {
    await delay(300);
    return metrics.map((m) => ({ ...m }));
  }

  async getTransactions(): Promise<Transaction[]> {
    await delay(300);
    return transactions.map((t) => ({ ...t }));
  }

  async getAlerts(): Promise<Alert[]> {
    await delay(200);
    return alerts.map((a) => ({ ...a }));
  }

  async getChartData(): Promise<ChartDataPoint[]> {
    await delay(300);
    return chartData.map((d) => ({ ...d }));
  }
}
