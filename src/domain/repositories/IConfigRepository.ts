import type { CategorieEntity } from '@/domain/entities/Categorie';
import type { RegroupementEntity } from '@/domain/entities/Regroupement';
import type { RubriqueEntity } from '@/domain/entities/Rubrique';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanEntity } from '@/domain/entities/Plan';
import type { PoleEntity } from '@/domain/entities/Pole';

export interface IConfigRepository {
  // Categories
  getCategories(): Promise<CategorieEntity[]>;
  getCategorieById(id: string): Promise<CategorieEntity | null>;
  createCategorie(categorie: Omit<CategorieEntity, 'id'>): Promise<CategorieEntity>;
  updateCategorie(id: string, data: Partial<CategorieEntity>): Promise<CategorieEntity>;
  deleteCategorie(id: string): Promise<void>;

  // Regroupements
  getRegroupements(): Promise<RegroupementEntity[]>;
  getRegroupementById(id: string): Promise<RegroupementEntity | null>;
  createRegroupement(regroupement: Omit<RegroupementEntity, 'id'>): Promise<RegroupementEntity>;
  updateRegroupement(id: string, data: Partial<RegroupementEntity>): Promise<RegroupementEntity>;
  deleteRegroupement(id: string): Promise<void>;

  // Rubriques
  getRubriques(): Promise<RubriqueEntity[]>;
  getRubriqueById(id: string): Promise<RubriqueEntity | null>;
  getRubriquesByRegroupement(regroupementId: string): Promise<RubriqueEntity[]>;
  createRubrique(rubrique: Omit<RubriqueEntity, 'id'>): Promise<RubriqueEntity>;
  updateRubrique(id: string, data: Partial<RubriqueEntity>): Promise<RubriqueEntity>;
  deleteRubrique(id: string): Promise<void>;

  // Periodes
  getPeriodes(): Promise<PeriodeEntity[]>;
  getPeriodeById(id: string): Promise<PeriodeEntity | null>;
  getPeriodesByYear(year: number): Promise<PeriodeEntity[]>;
  createPeriode(periode: Omit<PeriodeEntity, 'id'>): Promise<PeriodeEntity>;
  updatePeriode(id: string, data: Partial<PeriodeEntity>): Promise<PeriodeEntity>;
  closePeriode(id: string): Promise<PeriodeEntity>;
  deletePeriode(id: string): Promise<void>;

  // Plans
  getPlans(): Promise<PlanEntity[]>;
  getPlanById(id: string): Promise<PlanEntity | null>;
  getActivePlan(): Promise<PlanEntity | null>;
  createPlan(plan: Omit<PlanEntity, 'id' | 'createdAt'>): Promise<PlanEntity>;
  updatePlan(id: string, data: Partial<PlanEntity>): Promise<PlanEntity>;
  closePlan(id: string): Promise<PlanEntity>;
  deletePlan(id: string): Promise<void>;

  // Poles
  getPoles(): Promise<PoleEntity[]>;
  getPoleById(id: string): Promise<PoleEntity | null>;
  createPole(pole: Omit<PoleEntity, 'id'>): Promise<PoleEntity>;
  updatePole(id: string, data: Partial<PoleEntity>): Promise<PoleEntity>;
  deletePole(id: string): Promise<void>;
}
