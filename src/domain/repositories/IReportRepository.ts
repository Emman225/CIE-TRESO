import type { VisualizationDomain } from '@/domain/entities/CashFlowEntry';

export interface ReportConfig {
  title: string;
  periodeId?: string;
  planId?: string;
  dateDebut?: string;
  dateFin?: string;
  year?: number;
  domain?: VisualizationDomain;
  sections?: string[];
  filters?: Record<string, unknown>;
}

export interface ReportResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export interface AvailableReport {
  id: string;
  name: string;
  description: string;
  format: 'excel' | 'pdf';
  category: string;
}

export interface IReportRepository {
  generateExcelReport(config: ReportConfig): Promise<ReportResult>;
  generatePdfReport(config: ReportConfig): Promise<ReportResult>;
  getAvailableReports(): Promise<AvailableReport[]>;
}
