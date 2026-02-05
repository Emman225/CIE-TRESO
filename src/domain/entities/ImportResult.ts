export type ImportFileType = 'encaissement' | 'decaissement' | 'budget' | 'realise';
export type ImportStatus = 'Pending' | 'Validated' | 'Integrated' | 'Rejected';

export interface ImportError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportDataRow {
  [key: string]: string | number | null;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  warnings: ImportError[];
}

export interface ImportPreviewRow {
  [key: string]: string | number | null;
}

export interface ImportRecordEntity {
  id: string;
  fileName: string;
  fileType: ImportFileType;
  periodeId: string;
  planId: string;
  status: ImportStatus;
  totalRows: number;
  importedRows: number;
  errors: number;
  errorDetails: ImportError[];
  importedAt: string;
  importedBy: string;
}
