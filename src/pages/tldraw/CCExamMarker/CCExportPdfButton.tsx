import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';
import { Editor, exportToBlob } from '@tldraw/tldraw';
import { Button } from '@mui/material';
import { Pdf } from './types';

interface CCExportPdfButtonProps {
  editor: Editor;
  pdf: Pdf;
}

export function CCExportPdfButton({ editor, pdf }: CCExportPdfButtonProps) {
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const exportPdf = async (
    editor: Editor,
    { name, source, pages }: Pdf,
    onProgress: (progress: number) => void
  ) => {
    const totalThings = pages.length * 2 + 2;
    let progressCount = 0;
    const tickProgress = () => {
      progressCount++;
      onProgress(progressCount / totalThings);
    };

    const pdf = await PDFDocument.load(source);
    tickProgress();
    const pdfPages = pdf.getPages();

    if (pdfPages.length !== pages.length) {
      throw new Error('PDF page count mismatch');
    }

    const pageShapeIds = new Set(pages.map((page) => page.shapeId));
    const allIds = Array.from(editor.getCurrentPageShapeIds()).filter(
      (id) => !pageShapeIds.has(id)
    );

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pdfPage = pdfPages[i];
      const {bounds} = page;

      const shapesInBounds = allIds.filter((id) => {
        const shapePageBounds = editor.getShapePageBounds(id);
        if (!shapePageBounds) return false;
        return shapePageBounds.collides(bounds);
      });

      if (shapesInBounds.length === 0) {
        tickProgress();
        tickProgress();
        continue;
      }

      const exportedPng = await exportToBlob({
        editor,
        ids: allIds,
        format: 'png',
        opts: { background: false, bounds: page.bounds, padding: 0, scale: 1 },
      });

      tickProgress();

      pdfPage.drawImage(await pdf.embedPng(await exportedPng.arrayBuffer()), {
        x: 0,
        y: 0,
        width: pdfPage.getWidth(),
        height: pdfPage.getHeight(),
      });

      tickProgress();
    }

    const url = URL.createObjectURL(
      new Blob([await pdf.save()], { type: 'application/pdf' })
    );
    tickProgress();

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      className="CCExportPdfButton"
      variant="contained"
      color="primary"
      onClick={async () => {
        setExportProgress(0);
        try {
          await exportPdf(editor, pdf, setExportProgress);
        } finally {
          setExportProgress(null);
        }
      }}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      {exportProgress
        ? `Exporting... ${Math.round(exportProgress * 100)}%`
        : 'Export PDF'}
    </Button>
  );
} 