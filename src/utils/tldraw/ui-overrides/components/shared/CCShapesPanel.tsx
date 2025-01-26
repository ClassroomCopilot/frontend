import React, { useRef } from 'react';
import { useEditor } from '@tldraw/tldraw';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';
import { createSlideshowAtCenter, handleSlideshowFileUpload } from '../../../cc-base/shape-helpers/slideshow-helpers';
import { createCalendarShapeAtCenter } from '../../../cc-base/shape-helpers/calendar-helpers';
import { createSettingsShapeAtCenter } from '../../../cc-base/shape-helpers/settings-helpers';
import { createLiveTranscriptionShapeAtCenter } from '../../../cc-base/shape-helpers/transcription-helpers';
import { BUTTON_STYLES } from './panel-styles';

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateShape = (shapeType: keyof typeof CC_SHAPE_CONFIGS, slidePattern?: string, numSlides?: number) => {
    if (!editor) {
      return;
    }

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
    if (!editor || !event.target.files || event.target.files.length === 0) {
      return;
    }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button 
        onClick={() => handleCreateShape('cc-calendar')}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Calendar Shape
      </button>
      <button 
        onClick={() => handleCreateShape('cc-settings')}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Settings Shape
      </button>
      <button 
        onClick={() => handleCreateShape('cc-live-transcription')}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Live Transcription
      </button>

      <div style={{ borderTop: '1px solid var(--color-divider)', margin: '8px 0' }} />
      
      <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '4px' }}>
        Slideshow Patterns
      </div>
      
      <button 
        onClick={() => handleCreateShape('cc-slideshow', 'horizontal', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Horizontal Slideshow
      </button>
      <button 
        onClick={() => handleCreateShape('cc-slideshow', 'vertical', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Vertical Slideshow
      </button>
      <button 
        onClick={() => handleCreateShape('cc-slideshow', 'grid', Number(CC_SHAPE_CONFIGS['cc-slideshow'].defaultProps.numSlides ?? 3))}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Grid Slideshow
      </button>
      <button 
        onClick={() => handleCreateShape('cc-slideshow', 'radial')}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Radial Slideshow
      </button>

      <div style={{ borderTop: '1px solid var(--color-divider)', margin: '8px 0' }} />
      
      <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '4px' }}>
        Import Office Documents
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.docx,.pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        style={BUTTON_STYLES.SHAPE_BUTTON}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
        }}
      >
        Upload Document
      </button>
    </div>
  );
};