import { Box, TLAssetId, TLShapeId } from '@tldraw/tldraw';

export interface PdfPage {
  src: string;
  bounds: Box;
  assetId: TLAssetId;
  shapeId: TLShapeId;
}

export interface Pdf {
  name: string;
  pages: PdfPage[];
  source: string | ArrayBuffer;
}

export interface ExamPdfs {
  examPaper: Pdf;
  markScheme: Pdf;
  studentResponses: Pdf;
}

export type ExamPdfState =
  | {
      phase: 'pick';
    }
  | {
      phase: 'edit';
      examPaper: Pdf;
      markScheme: Pdf;
      studentResponses: Pdf;
    };

export interface StudentResponse {
  studentId: string;
  pageStart: number;
  pageEnd: number;
}

export interface ExamMetadata {
  totalPages: number;
  pagesPerStudent: number;
  totalStudents: number;
  studentResponses: StudentResponse[];
} 