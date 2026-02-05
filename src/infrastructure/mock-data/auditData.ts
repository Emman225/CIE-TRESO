import type { AuditEntry } from '@/shared/types';

export const mockAuditEntries: AuditEntry[] = [
  { id: '1', date: '2024-03-15 14:30', userId: '1', userName: 'Jean Kouassi', action: 'CREATE', resource: 'Plan Tresorerie 2024', details: 'Creation du plan annuel 2024 avec 12 periodes' },
  { id: '2', date: '2024-03-15 11:20', userId: '2', userName: 'Marie Tanoh', action: 'IMPORT', resource: 'Releve BACI Mars', details: 'Import de 245 lignes - 1.25B FCFA total' },
  { id: '3', date: '2024-03-14 16:45', userId: '4', userName: 'Salimata Yao', action: 'UPDATE', resource: 'Rubrique PAY_EXP_GAS', details: 'Modification du type de saisie: Manuel -> Formule' },
  { id: '4', date: '2024-03-14 09:00', userId: '1', userName: 'Jean Kouassi', action: 'DELETE', resource: 'Utilisateur Test', details: 'Suppression du compte test@cie.ci' },
  { id: '5', date: '2024-03-13 17:30', userId: '2', userName: 'Marie Tanoh', action: 'EXPORT', resource: 'Rapport Consolide Q1', details: 'Export Excel du rapport trimestriel consolide' },
  { id: '6', date: '2024-03-13 14:15', userId: '3', userName: 'Amadou Koffi', action: 'LOGIN', resource: 'Session', details: 'Connexion depuis 192.168.1.45' },
  { id: '7', date: '2024-03-12 10:00', userId: '4', userName: 'Salimata Yao', action: 'CREATE', resource: 'Encaissement', details: 'Saisie manuelle: 45,000,000 FCFA - Vente Energie' },
  { id: '8', date: '2024-03-11 15:30', userId: '1', userName: 'Jean Kouassi', action: 'UPDATE', resource: 'Profil Analyste', details: 'Ajout permission export sur module Forecast' },
  { id: '9', date: '2024-03-10 09:45', userId: '2', userName: 'Marie Tanoh', action: 'IMPORT', resource: 'Charges Personnel Fev', details: 'Import de 89 lignes - 320M FCFA total' },
  { id: '10', date: '2024-03-09 16:00', userId: '1', userName: 'Jean Kouassi', action: 'CREATE', resource: 'Utilisateur s.yao', details: 'Creation du compte Salimata Yao - Role Controller' },
];
