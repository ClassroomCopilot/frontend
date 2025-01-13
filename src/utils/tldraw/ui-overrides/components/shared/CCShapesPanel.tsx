import React, { useEffect } from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { CCYoutubePanel } from './CCYoutubePanel';
import { BUTTON_STYLES } from './panel-styles';
import { CC_SHAPE_CONFIGS } from '../../../cc-base/cc-configs';
import { createSlideshow } from '../../../cc-base/shape-helpers/slideshow-helpers';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
  { id: 'youtube', label: 'YouTube' },
];

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const [currentPanelType, setCurrentPanelType] = React.useState('cc-shapes');
  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleOutsideInteraction = (e: PointerEvent) => {
      if (!isExpanded) {
        return;
      }

      const target = e.target as HTMLElement;
      const isOutsidePanel = !target.closest('.base-panel') && !target.closest('.panel-handle');

      if (isOutsidePanel) {
        e.preventDefault();
        e.stopPropagation();
        requestAnimationFrame(() => {
          setIsExpanded(false);
        });
      }
    };

    const container = editor.getContainer();
    container.addEventListener('pointerdown', handleOutsideInteraction, { capture: true });
    
    return () => {
      container.removeEventListener('pointerdown', handleOutsideInteraction, { capture: true });
    };
  }, [editor, isExpanded]);

  const handleCreateShape = (shapeType: keyof typeof CC_SHAPE_CONFIGS, slidePattern?: string, numSlides?: number) => {
    if (!editor) {
      return;
    }

    const { x, y } = editor.getViewportScreenCenter();
    const config = CC_SHAPE_CONFIGS[shapeType];
    const shapeId = createShapeId();
    
    const baseProps = {
      id: shapeId,
      type: shapeType,
      x: x - config.xOffset,
      y: y - config.yOffset,
      rotation: 0,
      isLocked: false,
      props: {
        w: config.width,
        h: config.height
      }
    };

    switch (shapeType) {
      case 'cc-calendar':
      case 'cc-settings':
      case 'cc-live-transcription':
        editor.createShape({
          ...baseProps,
          props: {
            ...config.defaultProps,
            w: config.width,
            h: config.height,
          },
        });
        break;
      case 'cc-slideshow':
        editor.batch(() => {
          createSlideshow(editor, baseProps, slidePattern, numSlides);
        });
        break;
      default:
        break;
    }
  };

  // If current panel type is slides, render the CCSlidesPanel
  if (currentPanelType === 'slides') {
    return (
      <CCSlidesPanel 
        onPanelTypeChange={setCurrentPanelType} 
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    );
  }

  // If current panel type is youtube, render the CCYoutubePanel
  if (currentPanelType === 'youtube') {
    return (
      <CCYoutubePanel 
        onPanelTypeChange={setCurrentPanelType} 
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    );
  }

  // Otherwise render the CC Shapes panel
  return (
    <BasePanel
      panelTypes={PANEL_TYPES}
      currentPanelType={currentPanelType}
      onPanelTypeChange={setCurrentPanelType}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
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
          onClick={() => handleCreateShape('cc-slideshow', 'horizontal', 4)}
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
          onClick={() => handleCreateShape('cc-slideshow', 'vertical', 4)}
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
          onClick={() => handleCreateShape('cc-slideshow', 'grid', 4)}
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
      </div>
    </BasePanel>
  );
};