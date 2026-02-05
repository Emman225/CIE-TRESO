export type PlanStatus = 'Draft' | 'Active' | 'Closed';

export interface PlanEntity {
  id: string;
  label: string;
  year: number;
  periodeIds: string[];
  status: PlanStatus;
  createdAt: string;
}

export type PlanTresorerieEntity = PlanEntity;
