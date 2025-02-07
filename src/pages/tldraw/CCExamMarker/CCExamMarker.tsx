import React, { useState } from 'react';
import { Box } from '@mui/material';
import 'tldraw/tldraw.css';
import { CCPdfEditor } from './CCPdfEditor';
import { CCPdfPicker } from './CCPdfPicker';
import { ExamPdfState } from './types';
import './cc-exam-marker.css';
import { HEADER_HEIGHT } from '../../Layout';
import { CCPanel } from '../../../utils/tldraw/ui-overrides/components/CCPanel';

export const CCExamMarker = () => {
  const [state, setState] = useState<ExamPdfState>({ phase: 'pick' });
  const [view, setView] = useState<'exam-and-markscheme' | 'student-responses'>('exam-and-markscheme');
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const handleViewChange = (newView: 'exam-and-markscheme' | 'student-responses') => {
    setView(newView);
  };

  const handleNextStudent = () => {
    if (state.phase === 'edit' && 'studentResponses' in state && 'examPaper' in state) {
      const totalStudents = Math.floor(state.studentResponses.pages.length / state.examPaper.pages.length);
      if (currentStudentIndex < totalStudents - 1) {
        setCurrentStudentIndex(prev => prev + 1);
      }
    }
  };

  const handlePreviousStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      inset: 0,
      top: `${HEADER_HEIGHT}px`,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      color: 'text.primary',
    }}>
      {state.phase === 'pick' ? (
        <CCPdfPicker 
          onOpenPdfs={(pdfs) =>
            setState({
              phase: 'edit',
              examPaper: pdfs.examPaper,
              markScheme: pdfs.markScheme,
              studentResponses: pdfs.studentResponses,
            })
          }
        />
      ) : (
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute',
            inset: 0,
            bgcolor: 'background.paper',
          }}>
            <CCPdfEditor
              examPaper={state.examPaper}
              markScheme={state.markScheme}
              studentResponses={state.studentResponses}
              currentView={view}
              currentStudentIndex={currentStudentIndex}
              onEditorMount={(editor) => {
                if (!editor) return null;
                const examMarkerProps = {
                  editor,
                  currentView: view,
                  onViewChange: handleViewChange,
                  currentStudentIndex,
                  totalStudents: Math.floor(state.studentResponses.pages.length / state.examPaper.pages.length),
                  onPreviousStudent: handlePreviousStudent,
                  onNextStudent: handleNextStudent,
                  getCurrentPdf: () => {
                    if (!editor) return null;
                    const currentPageId = editor.getCurrentPageId();
                    if (currentPageId.includes('exam-page')) {
                      return state.examPaper;
                    } else if (currentPageId.includes('mark-scheme-page')) {
                      return state.markScheme;
                    } else if (currentPageId.includes('student-response')) {
                      return state.studentResponses;
                    }
                    return null;
                  },
                };
                return <CCPanel 
                  examMarkerProps={examMarkerProps} 
                  isExpanded={isExpanded}
                  isPinned={isPinned}
                  onExpandedChange={setIsExpanded}
                  onPinnedChange={setIsPinned}
                />;
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
