import { IReportRepository, ReportConfig, ReportResult, AvailableReport } from '@/domain/repositories/IReportRepository';
import { chartData, metrics, domainSummary, balanceEvolution } from '@/infrastructure/mock-data/dashboardMetrics';
import { mockAuditEntries } from '@/infrastructure/mock-data/auditData';
import type { AuditEntry } from '@/shared/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

const CIE_ORANGE: [number, number, number] = [230, 80, 0];

function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ============ SHARED HELPERS ============

function addPdfHeader(doc: jsPDF, title: string, subtitle?: string): number {
  doc.setFontSize(18);
  doc.setTextColor(...CIE_ORANGE);
  doc.text('CIE - Gestion de Tresorerie', 14, 20);

  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 30);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 37);
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 14, subtitle ? 44 : 37);

  return subtitle ? 50 : 43;
}

function addPdfFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CIE TRESO - Confidentiel - Page ${i}/${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 7,
      { align: 'center' }
    );
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateTreasuryData(): Array<Record<string, string | number>> {
  const rubriques = [
    { label: "Vente d'Energie", type: 'Encaissement' },
    { label: 'Facturation Residentielle', type: 'Encaissement' },
    { label: 'Facturation Industrielle', type: 'Encaissement' },
    { label: 'Mobile Money & Prepaye', type: 'Encaissement' },
    { label: 'Exploitation Gaziere', type: 'Decaissement' },
    { label: 'Fiscalite & Taxes', type: 'Decaissement' },
    { label: 'Salaires et Charges', type: 'Decaissement' },
    { label: 'Frais Bancaires', type: 'Decaissement' },
    { label: 'Remuneration CIE', type: 'Decaissement' },
    { label: 'Investissements Reseau', type: 'Decaissement' },
    { label: 'Maintenance & Entretien', type: 'Decaissement' },
  ];

  return rubriques.map((r) => {
    const row: Record<string, string | number> = { Rubrique: r.label, Type: r.type };
    MONTHS_FR.forEach((month) => {
      const base = r.type === 'Encaissement'
        ? 200_000_000 + Math.random() * 300_000_000
        : 80_000_000 + Math.random() * 200_000_000;
      row[month] = Math.round(base);
    });
    row['Total'] = MONTHS_FR.reduce((sum, m) => sum + (row[m] as number), 0);
    return row;
  });
}

function computeTotals(data: Array<Record<string, string | number>>) {
  const totEnc = MONTHS_FR.map((m) => data.filter((r) => r['Type'] === 'Encaissement').reduce((s, r) => s + (r[m] as number), 0));
  const totDec = MONTHS_FR.map((m) => data.filter((r) => r['Type'] === 'Decaissement').reduce((s, r) => s + (r[m] as number), 0));
  const totEncYear = totEnc.reduce((a, b) => a + b, 0);
  const totDecYear = totDec.reduce((a, b) => a + b, 0);
  return { totEnc, totDec, totEncYear, totDecYear };
}

// ============ CONSOLIDATED REPORT ============

function consolidatedExcel(config: ReportConfig): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const data = generateTreasuryData();
  const { totEnc, totDec, totEncYear, totDecYear } = computeTotals(data);

  const rows: (string | number)[][] = [
    ['COMPAGNIE IVOIRIENNE D\'ELECTRICITE'],
    ['Rapport Consolide de Tresorerie'],
    [`Exercice ${config.year || 2024}`],
    [`Genere le ${new Date().toLocaleDateString('fr-FR')}`],
    [],
    ['Rubrique', 'Type', ...MONTHS_FR, 'Total Annuel'],
    ...data.map((r) => [r['Rubrique'] as string, r['Type'] as string, ...MONTHS_FR.map((m) => r[m] as number), r['Total'] as number]),
    [],
    ['TOTAL ENCAISSEMENTS', '', ...totEnc, totEncYear],
    ['TOTAL DECAISSEMENTS', '', ...totDec, totDecYear],
    ['SOLDE NET', '', ...totEnc.map((e, i) => e - totDec[i]), totEncYear - totDecYear],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, ...MONTHS_FR.map(() => ({ wch: 16 })), { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Synthese');

  const wsEnc = XLSX.utils.json_to_sheet(data.filter((r) => r['Type'] === 'Encaissement'));
  XLSX.utils.book_append_sheet(wb, wsEnc, 'Encaissements');

  const wsDec = XLSX.utils.json_to_sheet(data.filter((r) => r['Type'] === 'Decaissement'));
  XLSX.utils.book_append_sheet(wb, wsDec, 'Decaissements');

  const wsDom = XLSX.utils.json_to_sheet(domainSummary.map((d) => ({
    Domaine: d.domain, Encaissements: d.encaissements, Decaissements: d.decaissements, 'Solde Net': d.encaissements - d.decaissements,
  })));
  wsDom['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDom, 'Par Domaine');

  return wb;
}

function consolidatedPdf(config: ReportConfig): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const data = generateTreasuryData();
  const { totEnc, totDec, totEncYear, totDecYear } = computeTotals(data);
  const startY = addPdfHeader(doc, 'Rapport Consolide de Tresorerie', `Exercice ${config.year || 2024}`);

  const body = [
    ...data.map((r) => [r['Rubrique'] as string, r['Type'] as string, ...MONTHS_FR.map((m) => fmt(r[m] as number)), fmt(r['Total'] as number)]),
    ['TOTAL ENCAISSEMENTS', '', ...totEnc.map(fmt), fmt(totEncYear)],
    ['TOTAL DECAISSEMENTS', '', ...totDec.map(fmt), fmt(totDecYear)],
    ['SOLDE NET', '', ...totEnc.map((e, i) => fmt(e - totDec[i])), fmt(totEncYear - totDecYear)],
  ];

  autoTable(doc, {
    head: [['Rubrique', 'Type', ...MONTHS_SHORT, 'Total']],
    body,
    startY,
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 2 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold', fontSize: 6 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 18 } },
    didParseCell: (hd) => {
      if (hd.row.index >= data.length) {
        hd.cell.styles.fontStyle = 'bold';
        hd.cell.styles.fillColor = [240, 235, 230];
      }
    },
  });

  addPdfFooter(doc);
  return doc;
}

// ============ CASHFLOW REPORT ============

function cashflowExcel(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(chartData.map((d, i) => ({
    Mois: MONTHS_FR[i],
    'Encaissements (M FCFA)': d.encaissements,
    'Decaissements (M FCFA)': d.decaissements,
    'Flux Net (M FCFA)': d.encaissements - d.decaissements,
    'Solde Cumule (M FCFA)': Math.round(balanceEvolution[i]?.solde / 1_000_000),
  })));
  ws1['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Flux Mensuels');

  const totalEnc = domainSummary.reduce((s, d) => s + d.encaissements, 0);
  const ws2 = XLSX.utils.json_to_sheet(domainSummary.map((d) => ({
    Domaine: d.domain,
    'Encaissements (FCFA)': d.encaissements,
    'Decaissements (FCFA)': d.decaissements,
    'Solde Net (FCFA)': d.encaissements - d.decaissements,
    'Part Encaissements (%)': Math.round((d.encaissements / totalEnc) * 1000) / 10,
  })));
  ws2['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Par Domaine');

  const ws3 = XLSX.utils.json_to_sheet(balanceEvolution.map((d, i) => ({
    Mois: MONTHS_FR[i],
    'Solde (FCFA)': d.solde,
    'Variation (FCFA)': i > 0 ? d.solde - balanceEvolution[i - 1].solde : 0,
    'Variation (%)': i > 0 ? Math.round(((d.solde - balanceEvolution[i - 1].solde) / balanceEvolution[i - 1].solde) * 1000) / 10 : 0,
  })));
  ws3['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Evolution Solde');

  return wb;
}

function cashflowPdf(): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addPdfHeader(doc, 'Flux de Tresorerie', 'Detail mensuel des flux entrants et sortants');

  autoTable(doc, {
    head: [['Mois', 'Encaissements (M)', 'Decaissements (M)', 'Flux Net (M)', 'Solde Cumule (M)']],
    body: chartData.map((d, i) => [
      MONTHS_FR[i], fmt(d.encaissements), fmt(d.decaissements),
      fmt(d.encaissements - d.decaissements), fmt(Math.round(balanceEvolution[i]?.solde / 1_000_000)),
    ]),
    startY,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  doc.addPage();
  const startY2 = addPdfHeader(doc, 'Repartition par Domaine', 'Ventilation des flux par domaine d\'activite');

  autoTable(doc, {
    head: [['Domaine', 'Encaissements', 'Decaissements', 'Solde Net']],
    body: domainSummary.map((d) => [d.domain, fmt(d.encaissements) + ' FCFA', fmt(d.decaissements) + ' FCFA', fmt(d.encaissements - d.decaissements) + ' FCFA']),
    startY: startY2,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  addPdfFooter(doc);
  return doc;
}

// ============ FORECAST vs ACTUAL REPORT ============

function forecastExcel(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(chartData.map((d, i) => ({
    Mois: MONTHS_FR[i],
    'Realise (M FCFA)': d.actual,
    'Prevision (M FCFA)': d.forecast,
    'Ecart (M FCFA)': d.actual - d.forecast,
    'Ecart (%)': Math.round(((d.actual - d.forecast) / d.forecast) * 1000) / 10,
    'Taux Realisation (%)': Math.round((d.actual / d.forecast) * 1000) / 10,
  })));
  ws1['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Previsions vs Realise');

  const ws2 = XLSX.utils.json_to_sheet(chartData.map((d, i) => ({
    Mois: MONTHS_FR[i],
    'Encaissements (M)': d.encaissements,
    'Decaissements (M)': d.decaissements,
    'Solde Net (M)': d.encaissements - d.decaissements,
    'Realise (M)': d.actual,
    'Prevision (M)': d.forecast,
  })));
  ws2['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Mensuel');

  const totalR = chartData.reduce((s, d) => s + d.actual, 0);
  const totalP = chartData.reduce((s, d) => s + d.forecast, 0);
  const ws3 = XLSX.utils.aoa_to_sheet([
    ['Indicateur', 'Valeur'],
    ['Total Realise (M FCFA)', totalR],
    ['Total Prevision (M FCFA)', totalP],
    ['Ecart Global (M FCFA)', totalR - totalP],
    ['Ecart Global (%)', Math.round(((totalR - totalP) / totalP) * 1000) / 10],
    ['Taux de Realisation (%)', Math.round((totalR / totalP) * 1000) / 10],
  ]);
  ws3['!cols'] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Indicateurs');

  return wb;
}

function forecastPdf(): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addPdfHeader(doc, 'Previsions vs Realise', 'Comparaison entre previsions budgetaires et montants realises');

  autoTable(doc, {
    head: [['Mois', 'Realise (M)', 'Prevision (M)', 'Ecart (M)', 'Ecart (%)', 'Taux Realisation']],
    body: chartData.map((d, i) => [
      MONTHS_FR[i], fmt(d.actual), fmt(d.forecast), fmt(d.actual - d.forecast),
      (((d.actual - d.forecast) / d.forecast) * 100).toFixed(1) + '%',
      ((d.actual / d.forecast) * 100).toFixed(1) + '%',
    ]),
    startY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didParseCell: (hd) => {
      if (hd.section === 'body' && hd.column.index === 3) {
        const val = chartData[hd.row.index]?.actual - chartData[hd.row.index]?.forecast;
        if (val !== undefined) hd.cell.styles.textColor = val >= 0 ? [0, 128, 0] : [200, 0, 0];
      }
    },
  });

  const totalR = chartData.reduce((s, d) => s + d.actual, 0);
  const totalP = chartData.reduce((s, d) => s + d.forecast, 0);

  doc.addPage();
  const startY2 = addPdfHeader(doc, 'Indicateurs de Synthese', 'Resume annuel des performances');

  autoTable(doc, {
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Total Realise', fmt(totalR) + ' M FCFA'],
      ['Total Prevision', fmt(totalP) + ' M FCFA'],
      ['Ecart Global', fmt(totalR - totalP) + ' M FCFA'],
      ['Taux de Realisation', ((totalR / totalP) * 100).toFixed(1) + '%'],
    ],
    startY: startY2,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60, halign: 'right' } },
  });

  addPdfFooter(doc);
  return doc;
}

// ============ KPI REPORT (PDF only) ============

function kpiPdf(): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addPdfHeader(doc, 'Indicateurs de Performance', 'Tableau de bord des KPIs cles');

  autoTable(doc, {
    head: [['Indicateur', 'Valeur', 'Variation']],
    body: metrics.map((m) => [
      m.label, m.value,
      m.change > 0 ? `+${m.change}%` : m.change < 0 ? `${m.change}%` : 'Stable',
    ]),
    startY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 55, halign: 'right' }, 2: { cellWidth: 35, halign: 'center' } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const domY = ((doc as any).lastAutoTable?.finalY || 100) + 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Performance par Domaine', 14, domY);

  autoTable(doc, {
    head: [['Domaine', 'Encaissements', 'Decaissements', 'Solde Net', 'Ratio']],
    body: domainSummary.map((d) => [
      d.domain, fmt(d.encaissements) + ' FCFA', fmt(d.decaissements) + ' FCFA',
      fmt(d.encaissements - d.decaissements) + ' FCFA',
      d.decaissements > 0 ? (d.encaissements / d.decaissements).toFixed(2) : 'N/A',
    ]),
    startY: domY + 5,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  doc.addPage();
  const startY3 = addPdfHeader(doc, 'Evolution du Solde de Tresorerie', 'Progression mensuelle');

  autoTable(doc, {
    head: [['Mois', 'Solde (FCFA)', 'Variation', 'Variation (%)']],
    body: balanceEvolution.map((d, i) => [
      MONTHS_FR[i], fmt(d.solde),
      i > 0 ? fmt(d.solde - balanceEvolution[i - 1].solde) : '-',
      i > 0 ? (((d.solde - balanceEvolution[i - 1].solde) / balanceEvolution[i - 1].solde) * 100).toFixed(1) + '%' : '-',
    ]),
    startY: startY3,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3.5 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });

  addPdfFooter(doc);
  return doc;
}

// ============ AUDIT EXPORT ============

function auditExcel(entries: AuditEntry[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(entries.map((e) => ({
    'Date & Heure': e.date, Utilisateur: e.userName, Action: e.action, Ressource: e.resource, Details: e.details,
  })));
  ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Journal Audit');
  return wb;
}

function auditPdf(entries: AuditEntry[]): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addPdfHeader(doc, 'Journal d\'Audit', 'Historique complet des actions utilisateurs');

  autoTable(doc, {
    head: [['Date & Heure', 'Utilisateur', 'Action', 'Ressource', 'Details']],
    body: entries.map((e) => [e.date, e.userName, e.action, e.resource, e.details]),
    startY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: CIE_ORANGE, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 30 }, 2: { cellWidth: 20 }, 3: { cellWidth: 30 } },
  });

  addPdfFooter(doc);
  return doc;
}

// ============ REPOSITORY ============

export class MockReportRepository implements IReportRepository {
  async generateExcelReport(config: ReportConfig): Promise<ReportResult> {
    await delay(1200);

    let wb: XLSX.WorkBook;
    switch (config.title) {
      case 'Rapport Consolide': wb = consolidatedExcel(config); break;
      case 'Flux de Tresorerie': wb = cashflowExcel(); break;
      case 'Previsions vs Realise': wb = forecastExcel(); break;
      case 'Journal Audit': wb = auditExcel(mockAuditEntries); break;
      default: wb = consolidatedExcel(config); break;
    }

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    triggerDownload(blob, fileName);
    return { blob, fileName, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  }

  async generatePdfReport(config: ReportConfig): Promise<ReportResult> {
    await delay(1200);

    let doc: jsPDF;
    switch (config.title) {
      case 'Rapport Consolide': doc = consolidatedPdf(config); break;
      case 'Flux de Tresorerie': doc = cashflowPdf(); break;
      case 'Previsions vs Realise': doc = forecastPdf(); break;
      case 'Indicateurs de Performance': doc = kpiPdf(); break;
      case 'Journal Audit': doc = auditPdf(mockAuditEntries); break;
      default: doc = consolidatedPdf(config); break;
    }

    const blob = doc.output('blob');
    const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    triggerDownload(blob, fileName);
    return { blob, fileName, mimeType: 'application/pdf' };
  }

  async getAvailableReports(): Promise<AvailableReport[]> {
    return [
      { id: 'consolidated', name: 'Rapport Consolide', description: 'Vue globale encaissements/decaissements', format: 'excel', category: 'Tresorerie' },
      { id: 'cashflow', name: 'Flux de Tresorerie', description: 'Detail mensuel des flux', format: 'excel', category: 'Tresorerie' },
      { id: 'forecast', name: 'Previsions vs Realise', description: 'Comparaison budget vs realise', format: 'excel', category: 'Analyse' },
      { id: 'kpi', name: 'Indicateurs de Performance', description: 'KPIs cles', format: 'pdf', category: 'Performance' },
    ];
  }
}
