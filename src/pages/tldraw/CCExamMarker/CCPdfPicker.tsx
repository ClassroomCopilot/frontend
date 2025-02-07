import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { AssetRecordType, Box as TLBox, createShapeId } from '@tldraw/editor';
import { ExamPdfs, Pdf, PdfPage } from './types';

interface CCPdfPickerProps {
  onOpenPdfs: (pdfs: ExamPdfs) => void;
}

const pageSpacing = 32;

export function CCPdfPicker({ onOpenPdfs }: CCPdfPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPdfs, setSelectedPdfs] = useState<Partial<ExamPdfs>>({});

  async function loadPdf(name: string, source: ArrayBuffer): Promise<Pdf> {
    const PdfJS = await import('pdfjs-dist');
    PdfJS.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();

    const pdf = await PdfJS.getDocument(source.slice()).promise;
    const pages: PdfPage[] = [];
    const canvas = window.document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to create canvas context');

    const visualScale = 1.5;
    const scale = window.devicePixelRatio;
    let top = 0;
    let widest = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale * visualScale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;
      const width = viewport.width / scale;
      const height = viewport.height / scale;

      pages.push({
        src: canvas.toDataURL(),
        bounds: new TLBox(0, top, width, height),
        assetId: AssetRecordType.createId(),
        shapeId: createShapeId(),
      });

      top += height + pageSpacing;
      widest = Math.max(widest, width);
    }

    canvas.width = 0;
    canvas.height = 0;

    for (const page of pages) {
      page.bounds.x = (widest - page.bounds.width) / 2;
    }

    return {
      name,
      pages,
      source,
    };
  }

  const handleFileSelect = async (type: keyof ExamPdfs, file: File) => {
    setIsLoading(true);
    try {
      const pdf = await loadPdf(file.name, await file.arrayBuffer());

      // Validate student responses page count
      if (type === 'studentResponses' && selectedPdfs.examPaper) {
        const examPageCount = selectedPdfs.examPaper.pages.length;
        if (pdf.pages.length % examPageCount !== 0) {
          alert(`Student responses PDF must have a number of pages that is a multiple of the exam paper's ${examPageCount} pages.\n\nStudent responses PDF has ${pdf.pages.length} pages, which is not a multiple of ${examPageCount}.`);
          return;
        }
      }

      setSelectedPdfs((prev) => ({ ...prev, [type]: pdf }));
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF (mismatch between responses and exam paper). Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createFileInput = (type: keyof ExamPdfs) => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.addEventListener('change', async (e) => {
      const fileList = (e.target as HTMLInputElement).files;
      if (!fileList || fileList.length === 0) return;
      await handleFileSelect(type, fileList[0]);
    });
    input.click();
  };

  const allPdfsSelected = () => {
    return (
      selectedPdfs.examPaper &&
      selectedPdfs.markScheme &&
      selectedPdfs.studentResponses
    );
  };

  if (isLoading) {
    return (
      <Box className="CCPdfPicker" sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%'
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box className="CCPdfPicker" sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%'
    }}>
      <Stack 
        spacing={4} 
        alignItems="center" 
        sx={{ 
          maxWidth: '800px',
          width: '100%',
          p: 3
        }}
      >
        <Typography variant="h5">Select PDF Files</Typography>
        
        <Stack 
          direction="row" 
          sx={{ 
            width: '100%', 
            justifyContent: 'center',
            gap: 4  // Using MUI's spacing unit (1 unit = 8px, so 4 = 32px)
          }}
        >
          <Button
            variant={selectedPdfs.examPaper ? 'contained' : 'outlined'}
            onClick={() => createFileInput('examPaper')}
            sx={{ 
              minWidth: '180px',
              height: '48px'
            }}
          >
            {selectedPdfs.examPaper ? '✓ Exam Paper' : 'Select Exam Paper'}
          </Button>

          <Button
            variant={selectedPdfs.markScheme ? 'contained' : 'outlined'}
            onClick={() => createFileInput('markScheme')}
            sx={{ 
              minWidth: '180px',
              height: '48px'
            }}
          >
            {selectedPdfs.markScheme ? '✓ Mark Scheme' : 'Select Mark Scheme'}
          </Button>

          <Button
            variant={selectedPdfs.studentResponses ? 'contained' : 'outlined'}
            onClick={() => createFileInput('studentResponses')}
            sx={{ 
              minWidth: '180px',
              height: '48px'
            }}
          >
            {selectedPdfs.studentResponses ? '✓ Student Responses' : 'Select Student Responses'}
          </Button>
        </Stack>

        {allPdfsSelected() && (
          <Box sx={{ mt: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onOpenPdfs(selectedPdfs as ExamPdfs)}
              sx={{ 
                minWidth: '180px',
                height: '48px'
              }}
            >
              Continue
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
} 