import React, { useState } from 'react';
import { Box, Button, Typography, Divider, Stack } from '@mui/material';
import { Editor, exportToBlob, TLPageId, Box as TLBox } from '@tldraw/tldraw';
import { PDFDocument } from 'pdf-lib';
import { Pdf } from '../../../../../pages/tldraw/CCExamMarker/types';
import { logger } from '../../../../../debugConfig';

interface CCExamMarkerPanelProps {
  editor: Editor | null;
  currentView: 'exam-and-markscheme' | 'student-responses';
  onViewChange: (view: 'exam-and-markscheme' | 'student-responses') => void;
  currentStudentIndex: number;
  totalStudents: number;
  onPreviousStudent: () => void;
  onNextStudent: () => void;
  getCurrentPdf: () => Pdf | null;
}

export const CCExamMarkerPanel: React.FC<CCExamMarkerPanelProps> = ({
  editor,
  currentView,
  onViewChange,
  currentStudentIndex,
  totalStudents,
  onPreviousStudent,
  onNextStudent,
  getCurrentPdf,
}) => {
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const exportPdf = async (
    editor: Editor,
    { name, source, pages }: Pdf,
    onProgress: (progress: number) => void,
    startPage?: number,
    endPage?: number,
    studentIndex?: number
  ) => {
    logger.debug('cc-exam-marker', '📤 Starting PDF export', {
      name,
      startPage,
      endPage,
      studentIndex,
      currentView,
      totalPages: pages.length
    });

    const pdfPages = pages.slice(startPage, endPage);
    logger.debug('cc-exam-marker', '📄 Selected pages for export', {
      pdfPages: pdfPages.length,
      pageIndices: pdfPages.map((_, i) => (startPage || 0) + i)
    });

    const totalThings = pdfPages.length * 2 + 2;
    let progressCount = 0;
    const tickProgress = () => {
      progressCount++;
      onProgress(progressCount / totalThings);
    };

    const sourcePdf = await PDFDocument.load(source);
    tickProgress();

    // Create a new PDF document for the selected pages
    const newPdf = await PDFDocument.create();
    
    // Copy pages from source PDF
    const pageIndices = pdfPages.map((_, i) => (startPage || 0) + i);
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    tickProgress();

    // Store current page to restore later
    const currentPageId = editor.getCurrentPageId();
    logger.debug('cc-exam-marker', '📍 Current page before export', { currentPageId });

    // Switch to the correct page based on context
    const targetPageId = (studentIndex !== undefined 
      ? `page:student-response-${studentIndex}` 
      : currentView === 'exam-and-markscheme' 
        ? 'page:exam-page'
        : 'page:mark-scheme-page') as TLPageId;
    
    logger.debug('cc-exam-marker', '🎯 Switching to target page', { targetPageId });
    editor.setCurrentPage(targetPageId);

    // Get all shape IDs that are not page shapes (i.e., annotations)
    const pageShapeIds = new Set(pages.map(page => page.shapeId));
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds()).filter(id => !pageShapeIds.has(id));
    
    logger.debug('cc-exam-marker', '📝 Found shapes on current page', {
      totalShapes: editor.getCurrentPageShapeIds().size,
      pageShapes: pageShapeIds.size,
      annotationShapes: allShapeIds.length
    });

    // For each page, draw annotations on top
    for (let i = 0; i < pdfPages.length; i++) {
      const page = pdfPages[i];
      const pdfPage = newPdf.getPages()[i];
      const {bounds} = page;

      logger.debug('cc-exam-marker', `📄 Processing page ${i + 1}/${pdfPages.length}`, {
        bounds,
        pageIndex: i,
        globalPageIndex: (startPage || 0) + i
      });

      // Get shapes that intersect with this page using editor's bounds checking
      const shapesInBounds = allShapeIds.filter((id) => {
        const shape = editor.getShape(id);
        if (!shape || shape.isLocked) return false;

        // @ts-expect-error - annotationManager is added to editor in CCPdfEditor
        const annotationManager = editor.annotationManager;
        const annotationData = annotationManager.getAnnotationData(id);
        if (!annotationData) return false;

        // Filter by student index if provided
        if (studentIndex !== undefined && annotationData.studentIndex !== studentIndex) {
          return false;
        }

        // For exam/markscheme view, only include those annotations
        if (studentIndex === undefined && annotationData.studentIndex !== undefined) {
          return false;
        }

        // For individual student exports, use the annotation's original page index
        // For full exports, use the stored page index
        const adjustedPageIndex = annotationData.pageIndex;

        // Check if this shape belongs to this page index
        if (adjustedPageIndex !== i) {
          return false;
        }

        logger.debug('cc-exam-marker', `🔍 Found matching annotation`, {
          shapeId: id,
          annotationData,
          adjustedPageIndex,
          currentPageIndex: i,
          bounds: editor.getShapePageBounds(id)
        });

        return true;
      });

      logger.debug('cc-exam-marker', `✨ Found shapes for page ${i + 1}`, {
        shapesInBounds: shapesInBounds.length,
        pageIndex: i,
        globalPageIndex: (startPage || 0) + i
      });

      if (shapesInBounds.length === 0) {
        tickProgress();
        tickProgress();
        continue;
      }

      // Export the annotations as PNG
      const exportedPng = await exportToBlob({
        editor,
        ids: shapesInBounds,
        format: 'png',
        opts: { 
          background: false,
          // Create a new bounds that's relative to the current page
          bounds: new TLBox(
            bounds.x,
            0,  // Reset to 0 since we want annotations relative to current page
            bounds.width,
            bounds.height
          ),
          padding: 0,
          scale: 1
        },
      });

      tickProgress();

      // Draw the annotations on the PDF page
      const pngImage = await newPdf.embedPng(await exportedPng.arrayBuffer());
      const pdfWidth = pdfPage.getWidth();
      const pdfHeight = pdfPage.getHeight();
      
      pdfPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
      });

      tickProgress();
    }

    // Restore original page
    logger.debug('cc-exam-marker', '🔄 Restoring original page', { currentPageId });
    editor.setCurrentPage(currentPageId);

    const pdfBytes = await newPdf.save();
    const url = URL.createObjectURL(
      new Blob([pdfBytes], { type: 'application/pdf' })
    );
    tickProgress();

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.debug('cc-exam-marker', '✅ PDF export completed', { name });
  };

  const handleExportCurrentView = async () => {
    if (!editor) return;
    const currentPdf = getCurrentPdf();
    if (!currentPdf) return;

    setExportProgress(0);
    try {
      if (currentView === 'student-responses') {
        // For student responses, we need to handle each student's annotations separately
        const pagesPerStudent = currentPdf.pages.length / totalStudents;
        let currentProgress = 0;

        // Create a new PDF with all pages
        const sourcePdf = await PDFDocument.load(currentPdf.source);
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, Array.from({ length: currentPdf.pages.length }, (_, i) => i));
        copiedPages.forEach(page => newPdf.addPage(page));

        // For each student, export their annotations onto their pages
        for (let studentIndex = 0; studentIndex < totalStudents; studentIndex++) {
          const startPage = studentIndex * pagesPerStudent;

          // Switch to the student's page to get their annotations
          const targetPageId = `page:student-response-${studentIndex}` as TLPageId;
          editor.setCurrentPage(targetPageId);

          // Get all annotations for this student
          const pageShapeIds = new Set(currentPdf.pages.map(page => page.shapeId));
          const allShapeIds = Array.from(editor.getCurrentPageShapeIds()).filter(id => !pageShapeIds.has(id));

          // Process each page for this student
          for (let i = 0; i < pagesPerStudent; i++) {
            const pageIndex = startPage + i;
            const page = currentPdf.pages[pageIndex];
            const pdfPage = newPdf.getPages()[pageIndex];

            // Get shapes for this page
            const shapesInBounds = allShapeIds.filter((id) => {
              const shape = editor.getShape(id);
              if (!shape || shape.isLocked) return false;

              // @ts-expect-error - annotationManager is added to editor in CCPdfEditor
              const annotationManager = editor.annotationManager;
              const annotationData = annotationManager.getAnnotationData(id);
              if (!annotationData) return false;

              return annotationData.studentIndex === studentIndex && annotationData.pageIndex === i;
            });

            if (shapesInBounds.length > 0) {
              // Export and draw annotations
              const exportedPng = await exportToBlob({
                editor,
                ids: shapesInBounds,
                format: 'png',
                opts: { 
                  background: false,
                  bounds: new TLBox(
                    page.bounds.x,
                    0,
                    page.bounds.width,
                    page.bounds.height
                  ),
                  padding: 0,
                  scale: 1
                },
              });

              const pngImage = await newPdf.embedPng(await exportedPng.arrayBuffer());
              pdfPage.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pdfPage.getWidth(),
                height: pdfPage.getHeight(),
              });
            }

            currentProgress++;
            setExportProgress(currentProgress / (totalStudents * pagesPerStudent));
          }
        }

        // Save the combined PDF
        const pdfBytes = await newPdf.save();
        const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = currentPdf.name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For exam/mark scheme view, use the original export logic
        await exportPdf(editor, currentPdf, setExportProgress);
      }
    } finally {
      setExportProgress(null);
    }
  };

  const handleExportCurrentStudent = async () => {
    if (!editor || currentView !== 'student-responses') return;
    const currentPdf = getCurrentPdf();
    if (!currentPdf) return;

    const pagesPerStudent = currentPdf.pages.length / totalStudents;
    const startPage = currentStudentIndex * pagesPerStudent;
    const endPage = startPage + pagesPerStudent;

    setExportProgress(0);
    try {
      await exportPdf(
        editor,
        {
          ...currentPdf,
          name: `Student_${currentStudentIndex + 1}_Response.pdf`,
        },
        setExportProgress,
        Math.floor(startPage),
        Math.floor(endPage),
        currentStudentIndex
      );
    } finally {
      setExportProgress(null);
    }
  };

  const handleBatchExport = async () => {
    if (!editor || currentView !== 'student-responses') return;
    const currentPdf = getCurrentPdf();
    if (!currentPdf) return;

    setExportProgress(0);
    try {
      const pagesPerStudent = currentPdf.pages.length / totalStudents;
      let currentProgress = 0;

      for (let studentIndex = 0; studentIndex < totalStudents; studentIndex++) {
        const startPage = studentIndex * pagesPerStudent;
        const endPage = startPage + pagesPerStudent;

        await exportPdf(
          editor,
          {
            ...currentPdf,
            name: `Student_${studentIndex + 1}_Response.pdf`,
          },
          setExportProgress,
          Math.floor(startPage),
          Math.floor(endPage),
          studentIndex
        );

        currentProgress++;
        setExportProgress(currentProgress / totalStudents);
      }
    } finally {
      setExportProgress(null);
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Exam Marker
      </Typography>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          View Mode
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant={currentView === 'exam-and-markscheme' ? 'contained' : 'outlined'}
            onClick={() => onViewChange('exam-and-markscheme')}
          >
            Exam & Mark Scheme
          </Button>
          <Button
            fullWidth
            variant={currentView === 'student-responses' ? 'contained' : 'outlined'}
            onClick={() => onViewChange('student-responses')}
          >
            Student Responses
          </Button>
        </Box>
      </Box>

      {currentView === 'student-responses' && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Student Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={onPreviousStudent}
                disabled={currentStudentIndex === 0}
              >
                Previous Student
              </Button>
              <Typography variant="body2" align="center">
                Student {currentStudentIndex + 1} of {totalStudents}
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={onNextStudent}
                disabled={currentStudentIndex === totalStudents - 1}
              >
                Next Student
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Divider />
      
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Actions
        </Typography>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={!editor || !getCurrentPdf() || exportProgress !== null}
            onClick={handleExportCurrentView}
          >
            {exportProgress !== null
              ? `Exporting... ${Math.round(exportProgress * 100)}%`
              : `Export ${currentView === 'exam-and-markscheme' ? 'All' : 'Combined Responses'}`}
          </Button>
          
          {currentView === 'student-responses' && (
            <>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                disabled={!editor || !getCurrentPdf() || exportProgress !== null}
                onClick={handleExportCurrentStudent}
              >
                {exportProgress !== null
                  ? `Exporting... ${Math.round(exportProgress * 100)}%`
                  : 'Export Current Student'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                disabled={!editor || !getCurrentPdf() || exportProgress !== null}
                onClick={handleBatchExport}
              >
                {exportProgress !== null
                  ? `Exporting... ${Math.round(exportProgress * 100)}%`
                  : 'Export All as Separate Files'}
              </Button>
            </>
          )}
        </Stack>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Statistics
        </Typography>
        <Typography variant="body2">
          Total Pages: {getCurrentPdf()?.pages.length || 0}
        </Typography>
      </Box>
    </Box>
  );
}; 