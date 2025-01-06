import React from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'CC Shapes' },
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

  return (
    <BasePanel
      title="CC Shapes"
      panelTypes={PANEL_TYPES}
      currentPanelType={currentPanelType}
      onPanelTypeChange={setCurrentPanelType}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={() => handleCreateShape('cc-calendar')}
          className="shape-button"
        >
          Calendar Shape
        </button>
        <button 
          onClick={() => handleCreateShape('cc-settings')}
          className="shape-button"
        >
          Settings Shape
        </button>
        <button 
          onClick={() => handleCreateShape('cc-live-transcription')}
          className="shape-button"
        >
          Live Transcription
        </button>
      </div>
    </BasePanel>
  );
};