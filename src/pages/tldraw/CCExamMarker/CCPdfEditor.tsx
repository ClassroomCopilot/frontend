import React from 'react';
import { Box } from '@mui/material';
import { Editor, TLPageId, Box as TLBox } from '@tldraw/editor';
import { Tldraw } from '@tldraw/tldraw';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ExamPdfs } from './types';
import { AnnotationManager, AnnotationData } from './AnnotationManager';
import { logger } from '../../../debugConfig';

const PAGE_SPACING = 32; // Same spacing as the example

interface CCPdfEditorProps extends ExamPdfs {
  currentView: 'exam-and-markscheme' | 'student-responses';
  currentStudentIndex: number;
  onEditorMount: (editor: Editor) => React.ReactNode;
}

export function CCPdfEditor({
  examPaper,
  markScheme,
  studentResponses,
  currentView,
  currentStudentIndex,
  onEditorMount,
}: CCPdfEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pagesInitialized, setPagesInitialized] = useState(false);
  const annotationManager = useRef(new AnnotationManager());

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    onEditorMount(editor);

    // Subscribe to shape changes
    editor.on('change', () => {
      const shapes = editor.getCurrentPageShapeIds();
      logger.debug('cc-exam-marker', '🔄 Shape change detected', {
        totalShapes: shapes.size,
        currentPage: editor.getCurrentPageId()
      });

      shapes.forEach(shapeId => {
        const shape = editor.getShape(shapeId);
        if (shape && !shape.isLocked) {  // Only track non-locked shapes (annotations)
          const bounds = editor.getShapePageBounds(shapeId);
          if (bounds) {
            const currentPageId = editor.getCurrentPageId();
            let annotationData: AnnotationData;

            if (currentPageId.includes('student-response')) {
              const studentIndex = parseInt(currentPageId.split('-').pop() || '0', 10);
              
              // Find which page this annotation belongs to by checking collision with page bounds
              const pageShapes = Array.from(shapes).filter(id => {
                const s = editor.getShape(id);
                return s?.isLocked;  // Locked shapes are our PDF pages
              });

              let pageIndex = -1;  // Default to -1 if no collision found
              for (let i = 0; i < pageShapes.length; i++) {
                const pageShape = editor.getShape(pageShapes[i]);
                if (!pageShape) continue;
                
                const pageBounds = editor.getShapePageBounds(pageShapes[i]);
                if (!pageBounds) continue;

                // Check if the annotation's center point is within the page bounds
                const annotationCenter = {
                  x: bounds.x + bounds.width / 2,
                  y: bounds.y + bounds.height / 2
                };

                if (annotationCenter.x >= pageBounds.x && 
                    annotationCenter.x <= pageBounds.x + pageBounds.width &&
                    annotationCenter.y >= pageBounds.y && 
                    annotationCenter.y <= pageBounds.y + pageBounds.height) {
                  pageIndex = i;
                  break;
                }
              }

              logger.debug('cc-exam-marker', '📏 Calculated page index', {
                shapeId,
                shapeBounds: bounds,
                pageIndex,
                studentIndex
              });

              annotationData = {
                studentIndex,
                pageIndex,
                shapeId,
                bounds: {
                  x: bounds.x,
                  y: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                }
              };
            } else {
              // For exam/mark scheme, use current page type as index
              const pageIndex = currentPageId.includes('exam') ? -1 : 1;
              annotationData = {
                pageIndex,
                shapeId,
                bounds: {
                  x: bounds.x,
                  y: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                }
              };
            }

            logger.debug('cc-exam-marker', '📝 Adding/updating annotation', {
              shapeId,
              annotationData,
              currentPage: currentPageId
            });

            annotationManager.current.addAnnotation(shapeId, annotationData);
          }
        }
      });
    });
  }, [onEditorMount]);

  // Initial setup effect - runs only once when editor is mounted
  useEffect(() => {
    if (!editor || pagesInitialized) return;

    const setupExamAndMarkScheme = async () => {
      const examPageId = 'page:exam-page' as TLPageId;
      const markSchemePageId = 'page:mark-scheme-page' as TLPageId;

      // Calculate vertical layout for exam pages
      let top = 0;
      let widest = 0;
      const examPages = examPaper.pages.map(page => {
        const width = page.bounds.width;
        const height = page.bounds.height;
        const currentTop = top;
        top += height + PAGE_SPACING;
        widest = Math.max(widest, width);
        return { ...page, top: currentTop, width, height };
      });

      // Center pages horizontally
      examPages.forEach(page => {
        page.bounds = new TLBox((widest - page.width) / 2, page.top, page.width, page.height);
      });

      // Create exam paper page
      editor.createPage({ 
        id: examPageId,
        name: 'Exam Paper',
      });
      editor.setCurrentPage(examPageId);

      // Create assets and shapes for exam pages
      examPages.forEach((page) => {
        editor.createAssets([{
          id: page.assetId,
          typeName: 'asset',
          type: 'image',
          props: {
            w: page.bounds.width,
            h: page.bounds.height,
            name: 'PDF Page',
            src: page.src,
            isAnimated: false,
            mimeType: 'image/png',
          },
          meta: {},
        }]);

        editor.createShape({
          id: page.shapeId,
          type: 'image',
          x: page.bounds.x,
          y: page.bounds.y,
          props: {
            w: page.bounds.width,
            h: page.bounds.height,
            assetId: page.assetId,
          },
          isLocked: true,
        });
      });

      // Similar process for mark scheme pages
      let markSchemeTop = 0;
      const markSchemePages = markScheme.pages.map(page => {
        const width = page.bounds.width;
        const height = page.bounds.height;
        const currentTop = markSchemeTop;
        markSchemeTop += height + PAGE_SPACING;
        return {
          ...page,
          bounds: new TLBox((widest - width) / 2, currentTop, width, height)
        };
      });

      // Create mark scheme page
      editor.createPage({ 
        id: markSchemePageId,
        name: 'Mark Scheme',
      });
      editor.setCurrentPage(markSchemePageId);

      // Create assets and shapes for mark scheme pages
      markSchemePages.forEach((page) => {
        editor.createAssets([{
          id: page.assetId,
          typeName: 'asset',
          type: 'image',
          props: {
            w: page.bounds.width,
            h: page.bounds.height,
            name: 'PDF Page',
            src: page.src,
            isAnimated: false,
            mimeType: 'image/png',
          },
          meta: {},
        }]);

        editor.createShape({
          id: page.shapeId,
          type: 'image',
          x: page.bounds.x,
          y: page.bounds.y,
          props: {
            w: page.bounds.width,
            h: page.bounds.height,
            assetId: page.assetId,
          },
          isLocked: true,
        });
      });

      // Go back to exam page
      editor.setCurrentPage(examPageId);
    };

    const setupStudentResponses = async () => {
      const pagesPerStudent = examPaper.pages.length;
      const totalStudents = Math.floor(studentResponses.pages.length / pagesPerStudent);

      for (let studentIndex = 0; studentIndex < totalStudents; studentIndex++) {
        const startPage = studentIndex * pagesPerStudent;
        const endPage = startPage + pagesPerStudent;
        const studentPageId = `page:student-response-${studentIndex}` as TLPageId;

        // Calculate vertical layout
        let top = 0;
        let widest = 0;
        const studentPages = studentResponses.pages
          .slice(startPage, endPage)
          .map(page => {
            const width = page.bounds.width;
            const height = page.bounds.height;
            const currentTop = top;
            top += height + PAGE_SPACING;
            widest = Math.max(widest, width);
            return { ...page, top: currentTop, width, height };
          });

        // Center pages horizontally
        studentPages.forEach(page => {
          page.bounds = new TLBox((widest - page.width) / 2, page.top, page.width, page.height);
        });

        // Create page for this student
        editor.createPage({ 
          id: studentPageId,
          name: `Student ${studentIndex + 1}`,
        });
        editor.setCurrentPage(studentPageId);

        // Create assets and shapes
        studentPages.forEach((page) => {
          editor.createAssets([{
            id: page.assetId,
            typeName: 'asset',
            type: 'image',
            props: {
              w: page.bounds.width,
              h: page.bounds.height,
              name: 'PDF Page',
              src: page.src,
              isAnimated: false,
              mimeType: 'image/png',
            },
            meta: {},
          }]);

          editor.createShape({
            id: page.shapeId,
            type: 'image',
            x: page.bounds.x,
            y: page.bounds.y,
            props: {
              w: page.bounds.width,
              h: page.bounds.height,
              assetId: page.assetId,
            },
            isLocked: true,
          });
        });
      }
    };

    // Initial setup of all pages
    const setup = async () => {
      await setupExamAndMarkScheme();
      await setupStudentResponses();
      setPagesInitialized(true);
    };

    setup();
  }, [editor, pagesInitialized, examPaper, markScheme, studentResponses]);

  // Effect to handle view changes and navigation
  useEffect(() => {
    if (!editor || !pagesInitialized) return;

    // Switch to appropriate page based on current view
    const targetPageId = currentView === 'exam-and-markscheme'
      ? ('page:exam-page' as TLPageId)
      : (`page:student-response-${currentStudentIndex}` as TLPageId);

    logger.debug('cc-exam-marker', '🔄 Switching view', {
      currentView,
      currentStudentIndex,
      targetPageId
    });

    editor.setCurrentPage(targetPageId);

    // Update camera constraints for current page
    const currentPageBounds = Array.from(editor.getCurrentPageShapeIds()).reduce(
      (acc: TLBox | null, shapeId) => {
        const bounds = editor.getShapePageBounds(shapeId);
        return bounds ? (acc ? acc.union(bounds) : bounds) : acc;
      },
      null as TLBox | null
    );

    if (currentPageBounds) {
      const isMobile = editor.getViewportScreenBounds().width < 840;
      editor.setCameraOptions({
        constraints: {
          bounds: currentPageBounds,
          padding: { x: isMobile ? 16 : 164, y: 64 },
          origin: { x: 0.5, y: 0 },
          initialZoom: 'fit-x-100',
          baseZoom: 'default',
          behavior: 'contain',
        },
      });
      editor.setCamera(editor.getCamera(), { reset: true });
    }
  }, [editor, pagesInitialized, currentView, currentStudentIndex]);

  // Expose annotationManager to parent through onEditorMount
  useEffect(() => {
    if (editor) {
      onEditorMount(editor);
      // @ts-expect-error - Adding custom property to editor for CCExamMarkerPanel access
      editor.annotationManager = annotationManager.current;
    }
  }, [editor, onEditorMount]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Tldraw 
        onMount={handleMount}
        components={{
          InFrontOfTheCanvas: () => onEditorMount(editor!)
        }}
      />
    </Box>
  );
} 