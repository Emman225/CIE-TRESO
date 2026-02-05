import {
  IImportRepository,
  ImportUploadRequest,
} from '@/domain/repositories/IImportRepository';
import {
  ImportFileType,
  ValidationResult,
  ImportPreviewRow,
  ImportRecordEntity,
  ImportError,
} from '@/domain/entities/ImportResult';
import { mockImportResults } from '@/infrastructure/mock-data/imports';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockImportRepository implements IImportRepository {
  private history: ImportRecordEntity[] = mockImportResults.map((h) => ({
    ...h,
    errorDetails: h.errorDetails ?? [],
  }));

  async upload(request: ImportUploadRequest): Promise<ImportRecordEntity> {
    await delay(1500);

    const totalRows = 100 + Math.floor(Math.random() * 200);

    const record: ImportRecordEntity = {
      id: 'imp-' + Date.now().toString(36),
      fileName: request.file.name,
      fileType: request.fileType,
      periodeId: request.periodeId,
      planId: request.planId,
      status: 'Pending',
      totalRows,
      importedRows: 0,
      errors: 0,
      errorDetails: [],
      importedAt: new Date().toISOString(),
      importedBy: 'current-user',
    };

    this.history.push(record);
    return { ...record };
  }

  async validate(_file: File, _fileType: ImportFileType): Promise<ValidationResult> {
    await delay(1000);

    const hasErrors = Math.random() > 0.7;
    const totalRows = 100 + Math.floor(Math.random() * 200);
    const errorCount = hasErrors ? Math.floor(Math.random() * 8) + 1 : 0;

    const mockErrors: ImportError[] = hasErrors
      ? Array.from({ length: errorCount }, (_, i) => ({
          row: Math.floor(Math.random() * totalRows) + 1,
          column: ['montant', 'date', 'libelle', 'reference'][Math.floor(Math.random() * 4)],
          message: [
            'Montant invalide ou negatif',
            'Format de date incorrect (attendu: JJ/MM/AAAA)',
            'Libelle vide ou tronque',
            'Reference dupliquee dans le fichier',
            'Rubrique inconnue dans le referentiel',
          ][Math.floor(Math.random() * 5)],
          severity: i < 2 ? ('error' as const) : ('warning' as const),
        }))
      : [];

    return {
      isValid: !hasErrors,
      totalRows,
      validRows: totalRows - errorCount,
      errors: mockErrors.filter((e) => e.severity === 'error'),
      warnings: [
        ...mockErrors.filter((e) => e.severity === 'warning'),
        {
          row: Math.floor(Math.random() * totalRows) + 1,
          column: 'libelle',
          message: 'Libelle tronque a 255 caracteres',
          severity: 'warning',
        },
      ],
    };
  }

  async getPreview(_file: File, _fileType: ImportFileType): Promise<ImportPreviewRow[]> {
    await delay(800);

    const categories = ['Energie', 'Fonctionnement', 'Service Bancaire', 'Gaz', 'Impots'];
    const labels = [
      'Facturation Residentielle Zone A',
      'Paiement Fournisseur CIPREL',
      'Frais Bancaires SGBCI',
      'Achats Combustible Gaz',
      'TVA Collectee Octobre',
      'Maintenance Transformateurs',
      'Salaires Personnel Technique',
      'Remuneration CIE Fixe',
      'Subvention Etat T3',
      'Penalites Retard Clients',
      'Loyer Siege Abidjan',
      'Assurance Reseau',
      'Commissions Bancaires',
      'Investissement Reseau Sud',
      'Provisions Q4',
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      ligne: i + 1,
      date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String(i + 10).padStart(2, '0')}`,
      libelle: labels[i],
      montant: Math.round(Math.random() * 200_000_000 + 5_000_000),
      rubrique: categories[i % categories.length],
    }));
  }

  async integrate(importId: string): Promise<ImportRecordEntity> {
    await delay(2000);

    const index = this.history.findIndex((h) => h.id === importId);
    if (index === -1) {
      throw new Error('Import non trouve.');
    }

    const errorCount = Math.floor(Math.random() * 3);
    const errorDetails: ImportError[] = errorCount > 0
      ? Array.from({ length: errorCount }, () => ({
          row: Math.floor(Math.random() * 200) + 1,
          column: 'montant',
          message: 'Montant invalide',
          severity: 'error' as const,
        }))
      : [];

    this.history[index] = {
      ...this.history[index],
      status: 'Integrated',
      importedRows: this.history[index].totalRows - errorCount,
      errors: errorCount,
      errorDetails,
    };

    return { ...this.history[index] };
  }

  async reject(importId: string, _reason?: string): Promise<ImportRecordEntity> {
    await delay(500);

    const index = this.history.findIndex((h) => h.id === importId);
    if (index === -1) {
      throw new Error('Import non trouve.');
    }

    this.history[index] = {
      ...this.history[index],
      status: 'Rejected',
    };

    return { ...this.history[index] };
  }

  async getHistory(): Promise<ImportRecordEntity[]> {
    await delay(300);
    return this.history.map((h) => ({ ...h }));
  }

  async getById(id: string): Promise<ImportRecordEntity | null> {
    await delay(200);
    const record = this.history.find((h) => h.id === id);
    return record ? { ...record } : null;
  }

  async exportData(_importId: string, format: 'excel' | 'csv'): Promise<Blob> {
    await delay(1000);

    const mimeType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

    const content = format === 'csv'
      ? 'date,libelle,montant,rubrique\n2024-01-15,Facturation Zone A,50000000,Energie\n2024-01-20,Paiement CIPREL,32000000,Gaz'
      : 'Mock Excel data for import export';

    return new Blob([content], { type: mimeType });
  }

  async deleteImport(id: string): Promise<void> {
    await delay(400);

    const index = this.history.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error('Import non trouve.');
    }

    this.history.splice(index, 1);
  }
}
