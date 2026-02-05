import { PeriodeEntity } from '@/domain/entities/Periode';
import { PlanTresorerieEntity } from '@/domain/entities/PlanTresorerie';
import type { Categorie, Regroupement, Rubrique, Pole } from '@/shared/types';

export interface IConfigRepository {
  // --- Periodes ---
  getPeriodes(): Promise<PeriodeEntity[]>;
  getPlans(periodeId?: string): Promise<PlanTresorerieEntity[]>;
  getActivePeriode(): Promise<PeriodeEntity | null>;

  // --- Categories ---
  getCategories(): Promise<Categorie[]>;
  createCategorie(data: Omit<Categorie, 'id'>): Promise<Categorie>;
  updateCategorie(id: string, data: Partial<Categorie>): Promise<Categorie>;
  deleteCategorie(id: string): Promise<void>;

  // --- Regroupements ---
  getRegroupements(): Promise<Regroupement[]>;
  createRegroupement(data: Omit<Regroupement, 'id'>): Promise<Regroupement>;
  updateRegroupement(id: string, data: Partial<Regroupement>): Promise<Regroupement>;
  deleteRegroupement(id: string): Promise<void>;

  // --- Rubriques ---
  getRubriques(): Promise<Rubrique[]>;
  createRubrique(data: Omit<Rubrique, 'id'>): Promise<Rubrique>;
  updateRubrique(id: string, data: Partial<Rubrique>): Promise<Rubrique>;
  deleteRubrique(id: string): Promise<void>;

  // --- Poles ---
  getPoles(): Promise<Pole[]>;
  createPole(data: Omit<Pole, 'id'>): Promise<Pole>;
  updatePole(id: string, data: Partial<Pole>): Promise<Pole>;
  deletePole(id: string): Promise<void>;
}
