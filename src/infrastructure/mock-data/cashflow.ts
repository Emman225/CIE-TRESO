import type {
  CashFlowEntry,
  CashFlowDomainSummary,
  CashFlowMonthlyPoint,
  CashFlowRubriqueRow,
  VisualizationDomain,
} from '@/domain/entities/CashFlowEntry';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMonthlyData(baseRealise: number, basePrevision: number, variance: number): CashFlowMonthlyPoint[] {
  return MONTHS.map((month, i) => {
    const seasonalFactor = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.15;
    const realise = i < 9 ? Math.round(baseRealise * seasonalFactor + (Math.random() - 0.5) * variance) : 0;
    const prevision = Math.round(basePrevision * seasonalFactor);
    return { month, realise, prevision };
  });
}

function generateRubriqueRows(rubriques: { name: string; flowType: 'Encaissement' | 'Decaissement'; base: number }[]): CashFlowRubriqueRow[] {
  return rubriques.map((r) => {
    const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
      const factor = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.1;
      return Math.round(r.base * factor + (Math.random() - 0.5) * r.base * 0.05);
    });
    return {
      rubrique: r.name,
      flowType: r.flowType,
      monthlyAmounts,
      total: monthlyAmounts.reduce((s, v) => s + v, 0),
    };
  });
}

export const mockCashFlowByDomain: Record<VisualizationDomain, CashFlowDomainSummary> = {
  Energie: {
    domain: 'Energie',
    totalEncaissements: 4_500_000_000,
    totalDecaissements: 1_200_000_000,
    soldeNet: 3_300_000_000,
    variationPercent: 5.2,
    monthlyData: generateMonthlyData(500_000_000, 480_000_000, 30_000_000),
    rubriques: generateRubriqueRows([
      { name: "Vente d'Energie", flowType: 'Encaissement', base: 280_000_000 },
      { name: 'Facturation Residentielle', flowType: 'Encaissement', base: 120_000_000 },
      { name: 'Facturation Industrielle', flowType: 'Encaissement', base: 95_000_000 },
      { name: 'Grands Comptes', flowType: 'Encaissement', base: 85_000_000 },
      { name: 'Maintenance Reseau', flowType: 'Decaissement', base: 65_000_000 },
      { name: 'Pertes Techniques', flowType: 'Decaissement', base: 35_000_000 },
    ]),
  },
  REM_CIE: {
    domain: 'REM_CIE',
    totalEncaissements: 0,
    totalDecaissements: 2_800_000_000,
    soldeNet: -2_800_000_000,
    variationPercent: -1.8,
    monthlyData: generateMonthlyData(0, 0, 0).map((d, i) => ({
      ...d,
      realise: i < 9 ? Math.round(230_000_000 + (Math.random() - 0.5) * 20_000_000) : 0,
      prevision: 235_000_000,
    })),
    rubriques: generateRubriqueRows([
      { name: 'Remuneration CIE Fixe', flowType: 'Decaissement', base: 145_000_000 },
      { name: 'Remuneration CIE Variable', flowType: 'Decaissement', base: 65_000_000 },
      { name: 'Primes de Performance', flowType: 'Decaissement', base: 25_000_000 },
    ]),
  },
  Gaz: {
    domain: 'Gaz',
    totalEncaissements: 0,
    totalDecaissements: 1_950_000_000,
    soldeNet: -1_950_000_000,
    variationPercent: 3.4,
    monthlyData: generateMonthlyData(0, 0, 0).map((d, i) => ({
      ...d,
      realise: i < 9 ? Math.round(165_000_000 + (Math.random() - 0.5) * 15_000_000) : 0,
      prevision: 160_000_000,
    })),
    rubriques: generateRubriqueRows([
      { name: 'Exploitation Gaziere', flowType: 'Decaissement', base: 95_000_000 },
      { name: 'Achats Combustibles Thermiques', flowType: 'Decaissement', base: 52_000_000 },
      { name: 'Transport et Logistique Gaz', flowType: 'Decaissement', base: 18_000_000 },
    ]),
  },
  Impot: {
    domain: 'Impot',
    totalEncaissements: 0,
    totalDecaissements: 1_400_000_000,
    soldeNet: -1_400_000_000,
    variationPercent: -0.5,
    monthlyData: generateMonthlyData(0, 0, 0).map((d, i) => ({
      ...d,
      realise: i < 9 ? Math.round(120_000_000 + (Math.random() - 0.5) * 10_000_000) : 0,
      prevision: 118_000_000,
    })),
    rubriques: generateRubriqueRows([
      { name: 'Fiscalite & Taxes', flowType: 'Decaissement', base: 45_000_000 },
      { name: 'TVA Collectee', flowType: 'Decaissement', base: 35_000_000 },
      { name: 'Impot sur les Societes', flowType: 'Decaissement', base: 28_000_000 },
      { name: 'Taxes Municipales', flowType: 'Decaissement', base: 12_000_000 },
    ]),
  },
  Fonctionnement: {
    domain: 'Fonctionnement',
    totalEncaissements: 0,
    totalDecaissements: 3_200_000_000,
    soldeNet: -3_200_000_000,
    variationPercent: 2.1,
    monthlyData: generateMonthlyData(0, 0, 0).map((d, i) => ({
      ...d,
      realise: i < 9 ? Math.round(270_000_000 + (Math.random() - 0.5) * 20_000_000) : 0,
      prevision: 265_000_000,
    })),
    rubriques: generateRubriqueRows([
      { name: 'Salaires et Charges Sociales', flowType: 'Decaissement', base: 145_000_000 },
      { name: 'Fournitures et Consommables', flowType: 'Decaissement', base: 42_000_000 },
      { name: 'Loyers et Charges Locatives', flowType: 'Decaissement', base: 28_000_000 },
      { name: 'Maintenance et Reparations', flowType: 'Decaissement', base: 35_000_000 },
      { name: 'Assurances', flowType: 'Decaissement', base: 18_000_000 },
    ]),
  },
  ServiceBancaire: {
    domain: 'ServiceBancaire',
    totalEncaissements: 0,
    totalDecaissements: 850_000_000,
    soldeNet: -850_000_000,
    variationPercent: -2.3,
    monthlyData: generateMonthlyData(0, 0, 0).map((d, i) => ({
      ...d,
      realise: i < 9 ? Math.round(72_000_000 + (Math.random() - 0.5) * 5_000_000) : 0,
      prevision: 70_000_000,
    })),
    rubriques: generateRubriqueRows([
      { name: 'Frais Bancaires', flowType: 'Decaissement', base: 12_000_000 },
      { name: 'Interets Emprunts', flowType: 'Decaissement', base: 28_000_000 },
      { name: 'Remboursement Capital', flowType: 'Decaissement', base: 22_000_000 },
      { name: 'Commissions sur Operations', flowType: 'Decaissement', base: 8_000_000 },
    ]),
  },
  Annexe: {
    domain: 'Annexe',
    totalEncaissements: 680_000_000,
    totalDecaissements: 1_100_000_000,
    soldeNet: -420_000_000,
    variationPercent: 1.5,
    monthlyData: generateMonthlyData(60_000_000, 55_000_000, 8_000_000),
    rubriques: generateRubriqueRows([
      { name: 'Subventions Etatiques', flowType: 'Encaissement', base: 38_000_000 },
      { name: 'Revenus Connexion', flowType: 'Encaissement', base: 22_000_000 },
      { name: 'Investissements Reseau', flowType: 'Decaissement', base: 55_000_000 },
      { name: 'Projets Speciaux', flowType: 'Decaissement', base: 25_000_000 },
      { name: 'Provisions Diverses', flowType: 'Decaissement', base: 12_000_000 },
    ]),
  },
};

export const mockCashFlowEntries: CashFlowEntry[] = (() => {
  const entries: CashFlowEntry[] = [];
  let id = 1;

  const domains: VisualizationDomain[] = ['Energie', 'REM_CIE', 'Gaz', 'Impot', 'Fonctionnement', 'ServiceBancaire', 'Annexe'];
  const rubriquesByDomain: Record<string, { name: string; flowType: 'Encaissement' | 'Decaissement' }[]> = {
    Energie: [
      { name: "Vente d'Energie", flowType: 'Encaissement' },
      { name: 'Facturation Residentielle', flowType: 'Encaissement' },
      { name: 'Maintenance Reseau', flowType: 'Decaissement' },
    ],
    REM_CIE: [
      { name: 'Remuneration CIE Fixe', flowType: 'Decaissement' },
      { name: 'Remuneration CIE Variable', flowType: 'Decaissement' },
    ],
    Gaz: [
      { name: 'Exploitation Gaziere', flowType: 'Decaissement' },
      { name: 'Achats Combustibles', flowType: 'Decaissement' },
    ],
    Impot: [
      { name: 'Fiscalite & Taxes', flowType: 'Decaissement' },
      { name: 'TVA Collectee', flowType: 'Decaissement' },
    ],
    Fonctionnement: [
      { name: 'Salaires', flowType: 'Decaissement' },
      { name: 'Fournitures', flowType: 'Decaissement' },
    ],
    ServiceBancaire: [
      { name: 'Frais Bancaires', flowType: 'Decaissement' },
      { name: 'Interets Emprunts', flowType: 'Decaissement' },
    ],
    Annexe: [
      { name: 'Subventions Etatiques', flowType: 'Encaissement' },
      { name: 'Investissements Reseau', flowType: 'Decaissement' },
    ],
  };

  for (const domain of domains) {
    const rubriques = rubriquesByDomain[domain] || [];
    for (const rubrique of rubriques) {
      for (let month = 1; month <= 12; month++) {
        const base = 50_000_000 + Math.random() * 200_000_000;
        entries.push({
          id: `cf-${id++}`,
          domain,
          rubrique: rubrique.name,
          flowType: rubrique.flowType,
          month,
          year: 2024,
          montantRealise: month <= 9 ? Math.round(base + (Math.random() - 0.5) * base * 0.1) : 0,
          montantPrevision: Math.round(base),
          periodeId: `per-2024-${String(month).padStart(2, '0')}`,
          planId: 'plan-2024',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return entries;
})();
