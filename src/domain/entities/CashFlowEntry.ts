export type VisualizationDomain =
  | 'Energie'
  | 'REM_CIE'
  | 'Fonctionnement'
  | 'ServiceBancaire'
  | 'Impot'
  | 'Annexe'
  | 'Gaz';

export type CashFlowDirection = 'RECEIPT' | 'PAYMENT';

export interface CashFlowEntryEntity {
  id: string;
  rubriqueId: string;
  regroupementId: string;
  categorieId: string;
  periodeId: string;
  planId: string;
  poleId?: string;
  domain: VisualizationDomain;
  direction: CashFlowDirection;
  label: string;
  budgetAmount: number;
  realAmount: number;
  ecart: number;
  ecartPercent: number;
  date: string;
  source: 'Manual' | 'Import' | 'Calculated';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowDomainSummary {
  domain: VisualizationDomain;
  totalEncaissements: number;
  totalDecaissements: number;
  soldeNet: number;
  variationPercent: number;
  monthlyData: CashFlowMonthlyPoint[];
  rubriques: CashFlowRubriqueRow[];
}

export interface CashFlowMonthlyPoint {
  month: string;
  realise: number;
  prevision: number;
}

export interface CashFlowRubriqueRow {
  rubrique: string;
  direction: CashFlowDirection;
  monthlyAmounts: number[];
  total: number;
}

export interface CashFlowFilter {
  periodeId?: string;
  planId?: string;
  year?: number;
  domain?: VisualizationDomain;
}
