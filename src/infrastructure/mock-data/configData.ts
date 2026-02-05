import type { Categorie, Regroupement, Rubrique, Pole } from '@/shared/types';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';
import type { ProfileEntity } from '@/domain/entities/Profile';
import type { UserEntity } from '@/domain/entities/User';

export const mockCategories: Categorie[] = [
  { id: '1', label: 'Vente d\'Energie', code: 'CAT_VEN_01', type: 'RECEIPT', description: 'Recettes liees a la vente d\'electricite', isActive: true },
  { id: '2', label: 'Achats Combustibles', code: 'CAT_ACH_01', type: 'PAYMENT', description: 'Achats de gaz et combustibles', isActive: true },
  { id: '3', label: 'Fiscalite & Taxes', code: 'CAT_FIS_01', type: 'PAYMENT', description: 'Impots, taxes et droits', isActive: true },
  { id: '4', label: 'Subventions Etatiques', code: 'CAT_SUB_01', type: 'RECEIPT', description: 'Subventions de l\'Etat', isActive: false },
];

export const mockRegroupements: Regroupement[] = [
  { id: '1', label: 'Recettes Directes', code: 'RG_REC_01', type: 'Encaissement', order: 1 },
  { id: '2', label: 'Paiements Fournisseurs', code: 'RG_PAY_01', type: 'Decaissement', order: 2 },
  { id: '3', label: 'Frais Generaux', code: 'RG_FRA_01', type: 'Decaissement', order: 3 },
  { id: '4', label: 'Autres Recettes', code: 'RG_AUT_01', type: 'Encaissement', order: 4 },
];

export const mockRubriques: Rubrique[] = [
  { id: '1', label: 'Vente d\'Energie', group: 'RECEIPT', type: 'Manual', code: 'REC_ENE_01', regroupementId: '1', categorieId: '1' },
  { id: '2', label: 'Exploitation Gaziere', group: 'PAYMENT', type: 'Formula', code: 'PAY_EXP_GAS', regroupementId: '2', categorieId: '2' },
  { id: '3', label: 'Fiscalite & Taxes', group: 'PAYMENT', type: 'Manual', code: 'PAY_TAX_01', regroupementId: '3', categorieId: '3' },
  { id: '4', label: 'Subventions Etatiques', group: 'RECEIPT', type: 'Calculated', code: 'REC_SUB_GOV', regroupementId: '4', categorieId: '4' },
];

export const mockPeriodes: PeriodeEntity[] = [
  { id: '1', label: 'Janvier 2024', year: 2024, month: 1, startDate: '2024-01-01', endDate: '2024-01-31', isClosed: true },
  { id: '2', label: 'Fevrier 2024', year: 2024, month: 2, startDate: '2024-02-01', endDate: '2024-02-29', isClosed: true },
  { id: '3', label: 'Mars 2024', year: 2024, month: 3, startDate: '2024-03-01', endDate: '2024-03-31', isClosed: false },
  { id: '4', label: 'Avril 2024', year: 2024, month: 4, startDate: '2024-04-01', endDate: '2024-04-30', isClosed: false },
  { id: '5', label: 'Mai 2024', year: 2024, month: 5, startDate: '2024-05-01', endDate: '2024-05-31', isClosed: false },
];

export const mockPlans: PlanEntity[] = [
  { id: '1', label: 'Plan Tresorerie 2024', year: 2024, status: 'Active', periodeIds: ['1', '2', '3', '4', '5'], createdAt: '2024-01-01' },
  { id: '2', label: 'Plan Tresorerie 2023', year: 2023, status: 'Closed', periodeIds: [], createdAt: '2023-01-01' },
  { id: '3', label: 'Plan Previsionnel S2', year: 2024, status: 'Draft', periodeIds: ['3', '4', '5'], createdAt: '2024-03-15' },
];

export const mockPoles: Pole[] = [
  { id: '1', label: 'Direction Generale', code: 'DG', responsibleUserId: '1', isActive: true },
  { id: '2', label: 'Direction Financiere', code: 'DF', responsibleUserId: '4', isActive: true },
  { id: '3', label: 'Distribution', code: 'DIST', responsibleUserId: '2', isActive: true },
  { id: '4', label: 'Production', code: 'PROD', isActive: false },
];

export const mockProfiles: ProfileEntity[] = [
  {
    id: '1',
    name: 'Administrateur',
    description: 'Acces complet a toutes les fonctionnalites',
    permissions: [
      { resource: 'dashboard', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'plan', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'imports', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'forecast', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'profiles', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'settings', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'saisie', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'visualization', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { resource: 'reporting', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    ],
    isDefault: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Analyste Tresorerie',
    description: 'Gestion du plan et des previsions',
    permissions: [
      { resource: 'dashboard', actions: ['view', 'export'] },
      { resource: 'plan', actions: ['view', 'create', 'edit'] },
      { resource: 'imports', actions: ['view', 'create', 'edit'] },
      { resource: 'forecast', actions: ['view', 'create', 'edit'] },
      { resource: 'saisie', actions: ['view', 'create', 'edit'] },
      { resource: 'visualization', actions: ['view', 'export'] },
      { resource: 'reporting', actions: ['view', 'export'] },
    ],
    isDefault: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Direction',
    description: 'Consultation et export uniquement',
    permissions: [
      { resource: 'dashboard', actions: ['view', 'export'] },
      { resource: 'plan', actions: ['view', 'export'] },
      { resource: 'forecast', actions: ['view', 'export'] },
      { resource: 'visualization', actions: ['view', 'export'] },
      { resource: 'reporting', actions: ['view', 'export'] },
    ],
    isDefault: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockUsers: UserEntity[] = [
  { id: '1', name: 'Jean Kouassi', email: 'j.kouassi@cie.ci', phone: '+225 07 00 00 01', role: 'Admin', profileId: '1', status: 'Active', lastLogin: 'Il y a 2h', avatar: 'https://picsum.photos/100/100?u=1', createdAt: '2023-06-01' },
  { id: '2', name: 'Marie Tanoh', email: 'm.tanoh@cie.ci', phone: '+225 07 00 00 02', role: 'Analyst', profileId: '2', status: 'Active', lastLogin: 'Il y a 5h', avatar: 'https://picsum.photos/100/100?u=2', createdAt: '2023-07-15' },
  { id: '3', name: 'Amadou Koffi', email: 'a.koffi@cie.ci', phone: '+225 07 00 00 03', role: 'Direction', profileId: '3', status: 'Inactive', lastLogin: 'Il y a 2 jours', avatar: 'https://picsum.photos/100/100?u=3', createdAt: '2023-08-20' },
  { id: '4', name: 'Salimata Yao', email: 's.yao@cie.ci', phone: '+225 07 00 00 04', role: 'Controller', profileId: '2', status: 'Active', lastLogin: 'Il y a 1h', avatar: 'https://picsum.photos/100/100?u=4', createdAt: '2023-09-10' },
];
