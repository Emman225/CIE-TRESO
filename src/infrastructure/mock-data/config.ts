import type { Categorie, Regroupement, Pole } from '@/shared/types';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanTresorerieEntity } from '@/domain/entities/PlanTresorerie';

export const mockCategories: Categorie[] = [
  { id: '1', label: 'Energie', code: 'CAT_ENE', type: 'RECEIPT', description: 'Recettes liees a la vente et distribution d\'electricite', isActive: true },
  { id: '2', label: 'Gaz', code: 'CAT_GAZ', type: 'PAYMENT', description: 'Achats de gaz naturel et combustibles thermiques', isActive: true },
  { id: '3', label: 'Impots', code: 'CAT_IMP', type: 'PAYMENT', description: 'Impots, taxes, droits et contributions fiscales', isActive: true },
  { id: '4', label: 'Fonctionnement', code: 'CAT_FON', type: 'PAYMENT', description: 'Charges de fonctionnement et frais generaux', isActive: true },
  { id: '5', label: 'Service Bancaire', code: 'CAT_BNK', type: 'PAYMENT', description: 'Frais bancaires, interets et commissions', isActive: true },
  { id: '6', label: 'REM CIE', code: 'CAT_REM', type: 'PAYMENT', description: 'Remuneration CIE fixe et variable', isActive: true },
  { id: '7', label: 'Annexe', code: 'CAT_ANX', type: 'PAYMENT', description: 'Investissements, projets speciaux et provisions', isActive: true },
];

export const mockRegroupements: Regroupement[] = [
  { id: '1', label: 'Encaissement', code: 'RG_ENC', type: 'Encaissement', order: 1 },
  { id: '2', label: 'Decaissement', code: 'RG_DEC', type: 'Decaissement', order: 2 },
  { id: '3', label: 'Frais Generaux', code: 'RG_FRA', type: 'Decaissement', order: 3 },
  { id: '4', label: 'Autres Recettes', code: 'RG_AUT', type: 'Encaissement', order: 4 },
];

export const mockPeriodes: PeriodeEntity[] = [
  { id: 'per-2024-01', label: 'Janvier 2024', year: 2024, month: 1, startDate: '2024-01-01', endDate: '2024-01-31', isClosed: true },
  { id: 'per-2024-02', label: 'Fevrier 2024', year: 2024, month: 2, startDate: '2024-02-01', endDate: '2024-02-29', isClosed: true },
  { id: 'per-2024-03', label: 'Mars 2024', year: 2024, month: 3, startDate: '2024-03-01', endDate: '2024-03-31', isClosed: true },
  { id: 'per-2024-04', label: 'Avril 2024', year: 2024, month: 4, startDate: '2024-04-01', endDate: '2024-04-30', isClosed: true },
  { id: 'per-2024-05', label: 'Mai 2024', year: 2024, month: 5, startDate: '2024-05-01', endDate: '2024-05-31', isClosed: true },
  { id: 'per-2024-06', label: 'Juin 2024', year: 2024, month: 6, startDate: '2024-06-01', endDate: '2024-06-30', isClosed: true },
  { id: 'per-2024-07', label: 'Juillet 2024', year: 2024, month: 7, startDate: '2024-07-01', endDate: '2024-07-31', isClosed: true },
  { id: 'per-2024-08', label: 'Aout 2024', year: 2024, month: 8, startDate: '2024-08-01', endDate: '2024-08-31', isClosed: true },
  { id: 'per-2024-09', label: 'Septembre 2024', year: 2024, month: 9, startDate: '2024-09-01', endDate: '2024-09-30', isClosed: true },
  { id: 'per-2024-10', label: 'Octobre 2024', year: 2024, month: 10, startDate: '2024-10-01', endDate: '2024-10-31', isClosed: false },
  { id: 'per-2024-11', label: 'Novembre 2024', year: 2024, month: 11, startDate: '2024-11-01', endDate: '2024-11-30', isClosed: false },
  { id: 'per-2024-12', label: 'Decembre 2024', year: 2024, month: 12, startDate: '2024-12-01', endDate: '2024-12-31', isClosed: false },
];

export const mockPlans: PlanTresorerieEntity[] = [
  {
    id: 'plan-2024',
    label: 'Plan Annuel 2024',
    year: 2024,
    periodeIds: ['per-2024-01', 'per-2024-02', 'per-2024-03', 'per-2024-04', 'per-2024-05', 'per-2024-06', 'per-2024-07', 'per-2024-08', 'per-2024-09', 'per-2024-10', 'per-2024-11', 'per-2024-12'],
    status: 'Active',
    createdAt: '2024-01-05T08:00:00.000Z',
  },
  {
    id: 'plan-2025',
    label: 'Plan Annuel 2025',
    year: 2025,
    periodeIds: [],
    status: 'Draft',
    createdAt: '2024-11-15T09:00:00.000Z',
  },
];

export const mockPoles: Pole[] = [
  { id: '1', label: 'CIE', code: 'CIE', responsibleUserId: '1', isActive: true },
  { id: '2', label: 'CI Energie', code: 'CI_ENE', responsibleUserId: '2', isActive: true },
];
