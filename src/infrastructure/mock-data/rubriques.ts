import type { Rubrique } from '@/shared/types';

export const mockRubriques: Rubrique[] = [
  // Encaissements - Energie
  { id: '1', label: "Vente d'Energie", group: 'RECEIPT', type: 'Manual', code: 'REC_ENE_01', regroupementId: '1', categorieId: '1' },
  { id: '2', label: 'Facturation Residentielle', group: 'RECEIPT', type: 'Manual', code: 'REC_FAC_RES', regroupementId: '1', categorieId: '1' },
  { id: '3', label: 'Facturation Industrielle', group: 'RECEIPT', type: 'Formula', code: 'REC_FAC_IND', regroupementId: '1', categorieId: '1' },
  { id: '4', label: 'Paiements Mobile Money', group: 'RECEIPT', type: 'Calculated', code: 'REC_MOB_PAY', regroupementId: '1', categorieId: '1' },
  { id: '5', label: 'Grands Comptes Entreprises', group: 'RECEIPT', type: 'Manual', code: 'REC_GC_ENT', regroupementId: '1', categorieId: '1' },

  // Encaissements - Autres
  { id: '6', label: 'Subventions Etatiques', group: 'RECEIPT', type: 'Calculated', code: 'REC_SUB_GOV', regroupementId: '4', categorieId: '7' },
  { id: '7', label: 'Revenus Connexion Nouveaux Abonnes', group: 'RECEIPT', type: 'Manual', code: 'REC_CNX_ABN', regroupementId: '4', categorieId: '7' },
  { id: '8', label: 'Penalites et Interets de Retard', group: 'RECEIPT', type: 'Formula', code: 'REC_PEN_RET', regroupementId: '4', categorieId: '7' },

  // Decaissements - Gaz
  { id: '9', label: 'Exploitation Gaziere', group: 'PAYMENT', type: 'Formula', code: 'PAY_EXP_GAS', regroupementId: '2', categorieId: '2' },
  { id: '10', label: 'Achats Combustibles Thermiques', group: 'PAYMENT', type: 'Manual', code: 'PAY_CMB_TH', regroupementId: '2', categorieId: '2' },
  { id: '11', label: 'Transport et Logistique Gaz', group: 'PAYMENT', type: 'Formula', code: 'PAY_TRS_GAZ', regroupementId: '2', categorieId: '2' },

  // Decaissements - Impots
  { id: '12', label: 'Fiscalite & Taxes', group: 'PAYMENT', type: 'Manual', code: 'PAY_TAX_01', regroupementId: '3', categorieId: '3' },
  { id: '13', label: 'TVA Collectee', group: 'PAYMENT', type: 'Calculated', code: 'PAY_TVA_COL', regroupementId: '3', categorieId: '3' },
  { id: '14', label: 'Impot sur les Societes', group: 'PAYMENT', type: 'Manual', code: 'PAY_IS_SOC', regroupementId: '3', categorieId: '3' },
  { id: '15', label: 'Taxes Municipales', group: 'PAYMENT', type: 'Manual', code: 'PAY_TAX_MUN', regroupementId: '3', categorieId: '3' },

  // Decaissements - Fonctionnement
  { id: '16', label: 'Salaires et Charges Sociales', group: 'PAYMENT', type: 'Manual', code: 'PAY_SAL_CHG', regroupementId: '2', categorieId: '4' },
  { id: '17', label: 'Fournitures et Consommables', group: 'PAYMENT', type: 'Manual', code: 'PAY_FRN_CSM', regroupementId: '2', categorieId: '4' },
  { id: '18', label: 'Loyers et Charges Locatives', group: 'PAYMENT', type: 'Manual', code: 'PAY_LOY_LOC', regroupementId: '3', categorieId: '4' },
  { id: '19', label: 'Maintenance et Reparations', group: 'PAYMENT', type: 'Formula', code: 'PAY_MNT_REP', regroupementId: '2', categorieId: '4' },
  { id: '20', label: 'Assurances', group: 'PAYMENT', type: 'Manual', code: 'PAY_ASS_GEN', regroupementId: '3', categorieId: '4' },

  // Decaissements - Service Bancaire
  { id: '21', label: 'Frais Bancaires', group: 'PAYMENT', type: 'Formula', code: 'PAY_FRB_BNK', regroupementId: '3', categorieId: '5' },
  { id: '22', label: 'Interets Emprunts', group: 'PAYMENT', type: 'Calculated', code: 'PAY_INT_EMP', regroupementId: '3', categorieId: '5' },
  { id: '23', label: 'Remboursement Capital', group: 'PAYMENT', type: 'Manual', code: 'PAY_RMB_CAP', regroupementId: '2', categorieId: '5' },
  { id: '24', label: 'Commissions sur Operations', group: 'PAYMENT', type: 'Formula', code: 'PAY_COM_OPE', regroupementId: '3', categorieId: '5' },

  // Decaissements - REM CIE
  { id: '25', label: 'Remuneration CIE Fixe', group: 'PAYMENT', type: 'Formula', code: 'PAY_REM_FIX', regroupementId: '2', categorieId: '6' },
  { id: '26', label: 'Remuneration CIE Variable', group: 'PAYMENT', type: 'Calculated', code: 'PAY_REM_VAR', regroupementId: '2', categorieId: '6' },
  { id: '27', label: 'Primes de Performance', group: 'PAYMENT', type: 'Formula', code: 'PAY_PRM_PRF', regroupementId: '2', categorieId: '6' },

  // Decaissements - Annexe
  { id: '28', label: 'Investissements Reseau', group: 'PAYMENT', type: 'Manual', code: 'PAY_INV_RES', regroupementId: '2', categorieId: '7' },
  { id: '29', label: 'Projets Speciaux', group: 'PAYMENT', type: 'Manual', code: 'PAY_PRJ_SPC', regroupementId: '2', categorieId: '7' },
  { id: '30', label: 'Provisions Diverses', group: 'PAYMENT', type: 'Calculated', code: 'PAY_PRV_DIV', regroupementId: '3', categorieId: '7' },
];
