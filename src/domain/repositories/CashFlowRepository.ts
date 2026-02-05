import { CashFlowEntry, CashFlowDomainSummary, CashFlowFilter, VisualizationDomain } from '@/domain/entities/CashFlowEntry';

export interface ICashFlowRepository {
  getByDomain(domain: VisualizationDomain, filters?: CashFlowFilter): Promise<CashFlowDomainSummary>;
  getAll(filters?: CashFlowFilter): Promise<CashFlowEntry[]>;
  getById(id: string): Promise<CashFlowEntry | null>;
  create(entry: Omit<CashFlowEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashFlowEntry>;
  update(id: string, entry: Partial<CashFlowEntry>): Promise<CashFlowEntry>;
  delete(id: string): Promise<void>;
}
