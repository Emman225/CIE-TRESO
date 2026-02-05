export type CategorieType = 'RECEIPT' | 'PAYMENT';

export interface CategorieEntity {
  id: string;
  code: string;
  label: string;
  type: CategorieType;
  description: string;
  isActive: boolean;
}
