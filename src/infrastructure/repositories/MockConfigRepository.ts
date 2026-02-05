import { IConfigRepository } from '@/domain/repositories/ConfigRepository';
import { PeriodeEntity } from '@/domain/entities/Periode';
import { PlanTresorerieEntity } from '@/domain/entities/PlanTresorerie';
import { mockPeriodes, mockPlans, mockCategories, mockRegroupements, mockPoles } from '@/infrastructure/mock-data/config';
import { mockRubriques } from '@/infrastructure/mock-data/rubriques';
import type { Categorie, Regroupement, Rubrique, Pole } from '@/shared/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockConfigRepository implements IConfigRepository {
  private periodes: PeriodeEntity[] = mockPeriodes.map((p) => ({ ...p }));
  private plans: PlanTresorerieEntity[] = mockPlans.map((p) => ({ ...p }));
  private categories: Categorie[] = mockCategories.map((c) => ({ ...c }));
  private regroupements: Regroupement[] = mockRegroupements.map((r) => ({ ...r }));
  private rubriques: Rubrique[] = mockRubriques.map((r) => ({ ...r }));
  private poles: Pole[] = mockPoles.map((p) => ({ ...p }));

  // --- Periodes ---
  async getPeriodes(): Promise<PeriodeEntity[]> {
    await delay(300);
    return this.periodes.map((p) => ({ ...p }));
  }

  async getActivePeriode(): Promise<PeriodeEntity | null> {
    await delay(200);
    return this.periodes.find((p) => !p.isClosed) ?? null;
  }

  // --- Plans ---
  async getPlans(periodeId?: string): Promise<PlanTresorerieEntity[]> {
    await delay(300);
    if (periodeId) {
      return this.plans.filter((p) => p.periodeIds.includes(periodeId)).map((p) => ({ ...p }));
    }
    return this.plans.map((p) => ({ ...p }));
  }

  // --- Categories ---
  async getCategories(): Promise<Categorie[]> {
    await delay(300);
    return this.categories.map((c) => ({ ...c }));
  }

  async createCategorie(data: Omit<Categorie, 'id'>): Promise<Categorie> {
    await delay(400);
    const cat: Categorie = { ...data, id: 'cat-' + Date.now().toString(36) };
    this.categories.push(cat);
    return { ...cat };
  }

  async updateCategorie(id: string, data: Partial<Categorie>): Promise<Categorie> {
    await delay(400);
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Categorie non trouvee.');
    this.categories[index] = { ...this.categories[index], ...data, id };
    return { ...this.categories[index] };
  }

  async deleteCategorie(id: string): Promise<void> {
    await delay(300);
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Categorie non trouvee.');
    this.categories.splice(index, 1);
  }

  // --- Regroupements ---
  async getRegroupements(): Promise<Regroupement[]> {
    await delay(300);
    return this.regroupements.map((r) => ({ ...r }));
  }

  async createRegroupement(data: Omit<Regroupement, 'id'>): Promise<Regroupement> {
    await delay(400);
    const reg: Regroupement = { ...data, id: 'rg-' + Date.now().toString(36) };
    this.regroupements.push(reg);
    return { ...reg };
  }

  async updateRegroupement(id: string, data: Partial<Regroupement>): Promise<Regroupement> {
    await delay(400);
    const index = this.regroupements.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Regroupement non trouve.');
    this.regroupements[index] = { ...this.regroupements[index], ...data, id };
    return { ...this.regroupements[index] };
  }

  async deleteRegroupement(id: string): Promise<void> {
    await delay(300);
    const index = this.regroupements.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Regroupement non trouve.');
    this.regroupements.splice(index, 1);
  }

  // --- Rubriques ---
  async getRubriques(): Promise<Rubrique[]> {
    await delay(300);
    return this.rubriques.map((r) => ({ ...r }));
  }

  async createRubrique(data: Omit<Rubrique, 'id'>): Promise<Rubrique> {
    await delay(400);
    const rub: Rubrique = { ...data, id: 'rub-' + Date.now().toString(36) };
    this.rubriques.push(rub);
    return { ...rub };
  }

  async updateRubrique(id: string, data: Partial<Rubrique>): Promise<Rubrique> {
    await delay(400);
    const index = this.rubriques.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rubrique non trouvee.');
    this.rubriques[index] = { ...this.rubriques[index], ...data, id };
    return { ...this.rubriques[index] };
  }

  async deleteRubrique(id: string): Promise<void> {
    await delay(300);
    const index = this.rubriques.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rubrique non trouvee.');
    this.rubriques.splice(index, 1);
  }

  // --- Poles ---
  async getPoles(): Promise<Pole[]> {
    await delay(300);
    return this.poles.map((p) => ({ ...p }));
  }

  async createPole(data: Omit<Pole, 'id'>): Promise<Pole> {
    await delay(400);
    const pole: Pole = { ...data, id: 'pole-' + Date.now().toString(36) };
    this.poles.push(pole);
    return { ...pole };
  }

  async updatePole(id: string, data: Partial<Pole>): Promise<Pole> {
    await delay(400);
    const index = this.poles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Pole non trouve.');
    this.poles[index] = { ...this.poles[index], ...data, id };
    return { ...this.poles[index] };
  }

  async deletePole(id: string): Promise<void> {
    await delay(300);
    const index = this.poles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Pole non trouve.');
    this.poles.splice(index, 1);
  }
}
