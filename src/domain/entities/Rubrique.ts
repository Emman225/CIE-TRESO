export type RubriqueGroup = 'RECEIPT' | 'PAYMENT';
export type RubriqueType = 'Manual' | 'Formula' | 'Calculated';

export interface RubriqueEntity {
  id: string;
  code: string;
  label: string;
  group: RubriqueGroup;
  type: RubriqueType;
  regroupementId: string;
  categorieId: string;
  isActive: boolean;
}
