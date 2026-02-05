import type {
  ImportFileType,
  ImportRecordEntity,
  ImportPreviewRow,
  ValidationResult,
} from '@/domain/entities/ImportResult';

export interface ImportUploadRequest {
  file: File;
  fileType: ImportFileType;
  periodeId: string;
  planId: string;
}

export interface IImportRepository {
  upload(request: ImportUploadRequest): Promise<ImportRecordEntity>;
  validate(file: File, fileType: ImportFileType): Promise<ValidationResult>;
  getPreview(file: File, fileType: ImportFileType): Promise<ImportPreviewRow[]>;
  integrate(importId: string): Promise<ImportRecordEntity>;
  reject(importId: string, reason?: string): Promise<ImportRecordEntity>;
  getHistory(): Promise<ImportRecordEntity[]>;
  getById(id: string): Promise<ImportRecordEntity | null>;
  exportData(importId: string, format: 'excel' | 'csv'): Promise<Blob>;
  deleteImport(id: string): Promise<void>;
}
