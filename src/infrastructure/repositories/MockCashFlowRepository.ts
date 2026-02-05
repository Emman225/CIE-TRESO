import { ICashFlowRepository } from '@/domain/repositories/CashFlowRepository';
import {
  CashFlowEntry,
  CashFlowDomainSummary,
  CashFlowFilter,
  VisualizationDomain,
} from '@/domain/entities/CashFlowEntry';
import { mockCashFlowByDomain, mockCashFlowEntries } from '@/infrastructure/mock-data/cashflow';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCashFlowRepository implements ICashFlowRepository {
  private entries: CashFlowEntry[] = mockCashFlowEntries.map((e) => ({ ...e }));

  async getByDomain(
    domain: VisualizationDomain,
    _filters?: CashFlowFilter
  ): Promise<CashFlowDomainSummary> {
    await delay(500);

    const summary = mockCashFlowByDomain[domain];
    if (!summary) {
      return {
        domain,
        totalEncaissements: 0,
        totalDecaissements: 0,
        soldeNet: 0,
        variationPercent: 0,
        monthlyData: [],
        rubriques: [],
      };
    }

    return {
      ...summary,
      monthlyData: summary.monthlyData.map((d) => ({ ...d })),
      rubriques: summary.rubriques.map((r) => ({
        ...r,
        monthlyAmounts: [...r.monthlyAmounts],
      })),
    };
  }

  async getAll(filters?: CashFlowFilter): Promise<CashFlowEntry[]> {
    await delay(400);

    let filtered = [...this.entries];

    if (filters?.periodeId) {
      filtered = filtered.filter((e) => e.periodeId === filters.periodeId);
    }
    if (filters?.planId) {
      filtered = filtered.filter((e) => e.planId === filters.planId);
    }
    if (filters?.year) {
      filtered = filtered.filter((e) => e.year === filters.year);
    }

    return filtered.map((e) => ({ ...e }));
  }

  async getById(id: string): Promise<CashFlowEntry | null> {
    await delay(200);
    const entry = this.entries.find((e) => e.id === id);
    return entry ? { ...entry } : null;
  }

  async create(
    data: Omit<CashFlowEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CashFlowEntry> {
    await delay(500);

    const entry: CashFlowEntry = {
      ...data,
      id: 'cf-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.entries.push(entry);
    return { ...entry };
  }

  async update(id: string, data: Partial<CashFlowEntry>): Promise<CashFlowEntry> {
    await delay(400);

    const index = this.entries.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Entree de cash flow non trouvee.');
    }

    this.entries[index] = {
      ...this.entries[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.entries[index] };
  }

  async delete(id: string): Promise<void> {
    await delay(300);

    const index = this.entries.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Entree de cash flow non trouvee.');
    }

    this.entries.splice(index, 1);
  }
}
