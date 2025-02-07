import { TLShapeId } from '@tldraw/tldraw';

export interface AnnotationData {
  studentIndex?: number;  // undefined for exam/markscheme annotations
  pageIndex: number;
  shapeId: TLShapeId;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class AnnotationManager {
  private examAnnotations: Set<TLShapeId> = new Set();
  private markSchemeAnnotations: Set<TLShapeId> = new Set();
  private studentAnnotations: Map<number, Set<TLShapeId>> = new Map();
  private annotationData: Map<TLShapeId, AnnotationData> = new Map();

  addAnnotation(shapeId: TLShapeId, data: AnnotationData) {
    this.annotationData.set(shapeId, data);
    
    if (data.studentIndex !== undefined) {
      // Student response annotation
      let studentSet = this.studentAnnotations.get(data.studentIndex);
      if (!studentSet) {
        studentSet = new Set();
        this.studentAnnotations.set(data.studentIndex, studentSet);
      }
      studentSet.add(shapeId);
    } else {
      // Exam or mark scheme annotation
      if (data.pageIndex < 0) {
        this.examAnnotations.add(shapeId);
      } else {
        this.markSchemeAnnotations.add(shapeId);
      }
    }
  }

  removeAnnotation(shapeId: TLShapeId) {
    const data = this.annotationData.get(shapeId);
    if (!data) return;

    if (data.studentIndex !== undefined) {
      const studentSet = this.studentAnnotations.get(data.studentIndex);
      studentSet?.delete(shapeId);
    } else {
      if (data.pageIndex < 0) {
        this.examAnnotations.delete(shapeId);
      } else {
        this.markSchemeAnnotations.delete(shapeId);
      }
    }
    this.annotationData.delete(shapeId);
  }

  getAnnotationsForStudent(studentIndex: number): TLShapeId[] {
    return Array.from(this.studentAnnotations.get(studentIndex) || []);
  }

  getAnnotationsForExam(): TLShapeId[] {
    return Array.from(this.examAnnotations);
  }

  getAnnotationsForMarkScheme(): TLShapeId[] {
    return Array.from(this.markSchemeAnnotations);
  }

  getAnnotationData(shapeId: TLShapeId): AnnotationData | undefined {
    return this.annotationData.get(shapeId);
  }

  clear() {
    this.examAnnotations.clear();
    this.markSchemeAnnotations.clear();
    this.studentAnnotations.clear();
    this.annotationData.clear();
  }

  // Future transcription support
  addTranscriptionToAnnotation(shapeId: TLShapeId) {
    const data = this.annotationData.get(shapeId);
    if (data) {
      this.annotationData.set(shapeId, {
        ...data
      });
    }
  }

} 