import React from 'react';
import { useEditor } from '@tldraw/tldraw';
import './panel.css';

export const CCGraphSchoolCalendarPanel: React.FC = () => {
  const editor = useEditor();

  return (
    <div className="panel-container">

      <div className="panel-section">
        <div className="panel-section-title">Title 1</div>
      </div>

      <div className="panel-divider" />
      
      <div className="panel-section">
        <div className="panel-section-title">Title 2</div>
      </div>

      <div className="panel-divider" />
      
      <div className="panel-section">
        <div className="panel-section-title">Title 3</div>
      </div>

    </div>
  );
}