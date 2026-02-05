export type RegroupementType = 'Encaissement' | 'Decaissement';

export interface RegroupementEntity {
  id: string;
  code: string;
  label: string;
  type: RegroupementType;
  order: number;
  isActive: boolean;
}
