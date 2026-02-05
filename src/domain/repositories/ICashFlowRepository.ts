import type {
  CashFlowEntryEntity,
  CashFlowDomainSummary,
  CashFlowFilter,
  VisualizationDomain,
} from '@/domain/entities/CashFlowEntry';

export interface CreateCashFlowEntryRequest {
  rubriqueId: string;
  regroupementId: string;
  categorieId: string;
  periodeId: string;
  planId: string;
  poleId?: string;
  domain: VisualizationDomain;
  direction: 'RECEIPT' | 'PAYMENT';
  label: string;
  budgetAmount: number;
  realAmount: number;
  date: string;
  source: 'Manual' | 'Import' | 'Calculated';
  createdBy: string;
}

export interface UpdateCashFlowEntryRequest {
  budgetAmount?: number;
  realAmount?: number;
  label?: string;
  date?: string;
}

export interface ICashFlowRepository {
  getByDomain(domain: VisualizationDomain, filter?: CashFlowFilter): Promise<CashFlowDomainSummary>;
  getConsolidated(filter?: CashFlowFilter): Promise<CashFlowDomainSummary[]>;
  getEntries(filter?: CashFlowFilter): Promise<CashFlowEntryEntity[]>;
  getEntryById(id: string): Promise<CashFlowEntryEntity | null>;
  createEntry(entry: CreateCashFlowEntryRequest): Promise<CashFlowEntryEntity>;
  updateEntry(id: string, data: UpdateCashFlowEntryRequest): Promise<CashFlowEntryEntity>;
  deleteEntry(id: string): Promise<void>;
}
