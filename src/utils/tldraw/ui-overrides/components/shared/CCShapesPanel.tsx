import React, { useEffect } from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { BUTTON_STYLES } from './panel-styles';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
];

const SHAPE_CONFIGS = {
  'cc-calendar': {
    width: 400,
    height: 600,
    xOffset: 200,
    yOffset: 300,
    defaultProps: {
      title: 'Calendar',
      headerColor: '#3e6589',
      isLocked: false,
      date: new Date().toISOString(),
      events: [],
      view: 'timeGridWeek',
    }
  },
  'cc-settings': {
    width: 400,
    height: 500,
    xOffset: 200,
    yOffset: 250,
    defaultProps: {
      title: 'User Settings',
      headerColor: '#3e6589',
      isLocked: false,
    }
  },
  'cc-live-transcription': {
    width: 300,
    height: 400,
    xOffset: 200,
    yOffset: 150,
    defaultProps: {
      title: 'Live Transcription',
      headerColor: '#3e6589',
      isLocked: false,
      isRecording: false,
      text: '',
      isConfirmed: false,
    }
  }
} as const;

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

  const handleCreateShape = (shapeType: keyof typeof SHAPE_CONFIGS) => {
    if (!editor) {
      return;
    }

    const { x, y } = editor.getViewportScreenCenter();
    const config = SHAPE_CONFIGS[shapeType];
    const shapeId = createShapeId();
    
    const baseProps = {
      id: shapeId,
      type: shapeType,
      x: x - config.xOffset,
      y: y - config.yOffset,
      rotation: 0,
      isLocked: false,
    };

    switch (shapeType) {
      case 'cc-calendar':
        editor.createShape({
          ...baseProps,
          props: {
            ...config.defaultProps,
            w: config.width,
            h: config.height,
          },
        });
        break;
      case 'cc-live-transcription':
        editor.createShape({
          ...baseProps,
          props: {
            title: 'Live Transcription',
            w: config.width,
            h: config.height,
            headerColor: '#3e6589',
            isLocked: false,
            isRecording: false,
            segments: []
          },
        });
        break;
      case 'cc-settings':
        editor.createShape({
          ...baseProps,
          props: {
            ...config.defaultProps,
            w: config.width,
            h: config.height,
          },
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
      </div>
    </BasePanel>
  );
};