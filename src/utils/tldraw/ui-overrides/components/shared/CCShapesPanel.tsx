import React from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { useAuth } from '../../../../../contexts/AuthContext';
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
  }
} as const;

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const { user, userRole } = useAuth();
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
      props: {
        w: config.width,
        h: config.height,
        ...config.defaultProps,
      },
    };

    switch (shapeType) {
      case 'cc-calendar':
        editor.createShape(baseProps);
        break;

      case 'cc-settings':
        editor.createShape({
          ...baseProps,
          props: {
            ...baseProps.props,
            userEmail: user?.email || '',
            userRole: userRole || '',
            isTeacher: userRole?.includes('teacher') || false,
          },
        });
        break;
    }

    editor.select(shapeId);
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
      </div>
    </BasePanel>
  );
};