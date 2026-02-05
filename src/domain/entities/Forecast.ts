export interface ForecastEntity {
  id: string;
  scenarioId: string;
  periodeId: string;
  rubriqueId: string;
  originalAmount: number;
  adjustedAmount: number;
  adjustmentReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastSnapshot {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;
  totalReceipts: number;
  totalPayments: number;
  netBalance: number;
  data: ForecastSnapshotEntry[];
  createdAt: string;
}

export interface ForecastSnapshotEntry {
  rubriqueId: string;
  label: string;
  originalAmount: number;
  adjustedAmount: number;
  ecart: number;
}

export interface BalanceEvolutionPoint {
  date: string;
  balance: number;
  receipts: number;
  payments: number;
}
