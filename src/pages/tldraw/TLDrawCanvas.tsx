import React from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const TLDrawCanvas: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw persistenceKey="classroom-copilot-landing-page" />
    </div>
  );
};

export default TLDrawCanvas; 