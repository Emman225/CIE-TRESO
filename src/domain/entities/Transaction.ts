export type TransactionType = 'Payment' | 'Receipt';
export type TransactionStatus = 'Completed' | 'Pending' | 'Rejected';

export interface TransactionEntity {
  id: string;
  reference: string;
  entity: string;
  type: TransactionType;
  rubriqueId: string;
  regroupementId: string;
  categorieId: string;
  periodeId: string;
  planId: string;
  poleId?: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  description?: string;
  bankReference?: string;
  createdBy: string;
  validatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
