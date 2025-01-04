import React from 'react';
import { useEditor, createShapeId, DefaultColorStyle } from '@tldraw/tldraw';
import { useAuth } from '../../../../../contexts/AuthContext';
import { BasePanel } from './BasePanel';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'CC Shapes' },
  { id: 'slides', label: 'Slides' },
];

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const { user, userRole } = useAuth();
  const [currentPanelType, setCurrentPanelType] = React.useState('cc-shapes');

  const handleCreateShape = (shapeType: string) => {
    if (!editor) {
      return;
    }

    // Get the current camera center point
    const { x, y } = editor.getViewportScreenCenter();
    
    // Create shape based on type
    const shapeId = createShapeId();
    
    switch (shapeType) {
      case 'cc-calendar':
        editor.createShape({
          id: shapeId,
          type: 'cc-calendar',
          x: x - 200,
          y: y - 250,
          props: {
            title: 'Calendar',
            w: 400,
            h: 500,
            color: DefaultColorStyle.defaultValue,
            isLocked: false,
            date: new Date().toISOString(),
            events: [],
          },
        });
        break;

      case 'cc-settings':
        editor.createShape({
          id: shapeId,
          type: 'cc-settings',
          x: x - 200,
          y: y - 250,
          props: {
            title: 'User Settings',
            w: 400,
            h: 500,
            color: DefaultColorStyle.defaultValue,
            isLocked: false,
            userEmail: user?.email || '',
            userRole: userRole || '',
            isTeacher: userRole?.includes('teacher') || false,
          },
        });
        break;
    }

    // Select the newly created shape
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