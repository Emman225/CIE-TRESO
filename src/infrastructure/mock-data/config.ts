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
  { id: 'per-2024-01', nom: 'Janvier 2024', dateDebut: '2024-01-01', dateFin: '2024-01-31', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-02', nom: 'Fevrier 2024', dateDebut: '2024-02-01', dateFin: '2024-02-29', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-03', nom: 'Mars 2024', dateDebut: '2024-03-01', dateFin: '2024-03-31', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-04', nom: 'Avril 2024', dateDebut: '2024-04-01', dateFin: '2024-04-30', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-05', nom: 'Mai 2024', dateDebut: '2024-05-01', dateFin: '2024-05-31', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-06', nom: 'Juin 2024', dateDebut: '2024-06-01', dateFin: '2024-06-30', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-07', nom: 'Juillet 2024', dateDebut: '2024-07-01', dateFin: '2024-07-31', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-08', nom: 'Aout 2024', dateDebut: '2024-08-01', dateFin: '2024-08-31', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-09', nom: 'Septembre 2024', dateDebut: '2024-09-01', dateFin: '2024-09-30', statut: 'Cloture', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-10', nom: 'Octobre 2024', dateDebut: '2024-10-01', dateFin: '2024-10-31', statut: 'EnCours', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-11', nom: 'Novembre 2024', dateDebut: '2024-11-01', dateFin: '2024-11-30', statut: 'Ouvert', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'per-2024-12', nom: 'Decembre 2024', dateDebut: '2024-12-01', dateFin: '2024-12-31', statut: 'Ouvert', createdAt: '2024-01-01T00:00:00.000Z' },
];

export const mockPlans: PlanTresorerieEntity[] = [
  {
    id: 'plan-2024',
    nom: 'Plan Annuel 2024',
    periodeId: 'per-2024-01',
    statut: 'Valide',
    createdAt: '2024-01-05T08:00:00.000Z',
    updatedAt: '2024-10-01T10:30:00.000Z',
  },
  {
    id: 'plan-2025',
    nom: 'Plan Annuel 2025',
    periodeId: 'per-2024-12',
    statut: 'Brouillon',
    createdAt: '2024-11-15T09:00:00.000Z',
    updatedAt: '2024-11-20T14:00:00.000Z',
  },
];

export const mockPoles: Pole[] = [
  { id: '1', label: 'CIE', code: 'CIE', responsibleUserId: '1', isActive: true },
  { id: '2', label: 'CI Energie', code: 'CI_ENE', responsibleUserId: '2', isActive: true },
  { id: '3', label: 'SODECI', code: 'SODECI', responsibleUserId: '4', isActive: true },
];
