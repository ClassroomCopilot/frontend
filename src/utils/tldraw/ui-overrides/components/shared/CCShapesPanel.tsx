import React, { useRef } from 'react';
import { useEditor } from '@tldraw/tldraw';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';
import { createSlideshowAtCenter, handleSlideshowFileUpload } from '../../../cc-base/shape-helpers/slideshow-helpers';
import { createCalendarShapeAtCenter } from '../../../cc-base/shape-helpers/calendar-helpers';
import { createSettingsShapeAtCenter } from '../../../cc-base/shape-helpers/settings-helpers';
import { createLiveTranscriptionShapeAtCenter } from '../../../cc-base/shape-helpers/transcription-helpers';
import './panel.css';

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateShape = (shapeType: keyof typeof CC_SHAPE_CONFIGS, slidePattern?: string, numSlides?: number) => {
    if (!editor) return;

    switch (shapeType) {
      case 'cc-calendar':
        createCalendarShapeAtCenter(editor);
        break;
      case 'cc-settings':
        createSettingsShapeAtCenter(editor);
        break;
      case 'cc-live-transcription':
        createLiveTranscriptionShapeAtCenter(editor);
        break;
      case 'cc-slideshow':
        createSlideshowAtCenter(editor, slidePattern, numSlides);
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !event.target.files || event.target.files.length === 0) return;

    try {
      await handleSlideshowFileUpload(editor, event.target.files[0], () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="panel-container">
      <div className="panel-section">
        <button className="shape-button" onClick={() => handleCreateShape('cc-calendar')}>
          Calendar Shape
        </button>
        <button className="shape-button" onClick={() => handleCreateShape('cc-settings')}>
          Settings Shape
        </button>
        <button className="shape-button" onClick={() => handleCreateShape('cc-live-transcription')}>
          Live Transcription
        </button>
      </div>

      <div className="panel-divider" />
      
      <div className="panel-section">
        <div className="panel-section-title">Slideshow Patterns</div>
        <button className="shape-button" onClick={() => handleCreateShape('cc-slideshow', 'horizontal', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}>
          Horizontal Slideshow
        </button>
        <button className="shape-button" onClick={() => handleCreateShape('cc-slideshow', 'vertical', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}>
          Vertical Slideshow
        </button>
        <button className="shape-button" onClick={() => handleCreateShape('cc-slideshow', 'grid', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}>
          Grid Slideshow
        </button>
        <button className="shape-button" onClick={() => handleCreateShape('cc-slideshow', 'radial')}>
          Radial Slideshow
        </button>
      </div>

      <div className="panel-divider" />
      
      <div className="panel-section">
        <div className="panel-section-title">Import Office Documents</div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.docx,.pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button className="shape-button" onClick={() => fileInputRef.current?.click()}>
          Upload Document
        </button>
      </div>
    </div>
  );
};