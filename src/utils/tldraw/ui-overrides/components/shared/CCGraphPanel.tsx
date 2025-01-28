import { useState } from 'react';
import { useEditor } from '@tldraw/tldraw';
import { createGraphShape, createUserNodeFromProfile } from '../../../cc-base/shape-helpers/graph-helpers';
import { ccGraphShapeProps, getDefaultCCUserNodeProps } from '../../../cc-base/cc-graph-props';
import { useNeo4j } from '../../../../../contexts/Neo4jContext';
import { logger } from '../../../../../debugConfig';
import './panel.css';
import { GraphShapeType } from '../../../cc-base/cc-graph-types';

export const CCGraphPanel = () => {
  const editor = useEditor();
  const { userNode } = useNeo4j();
  const [isOpen, setIsOpen] = useState(false);
  const graphShapeTypes = Object.keys(ccGraphShapeProps);

  const handleShapeSelect = (shapeType: GraphShapeType) => {
    if (shapeType === 'cc-user-node') {
      if (!userNode) {
        logger.warn('graph-panel', '⚠️ Cannot create user node - no user data available')
        return;
      }
      const defaultProps = getDefaultCCUserNodeProps();
      createUserNodeFromProfile(editor, { 
        ...defaultProps, 
        ...userNode
      });
    } else {
      createGraphShape(editor, shapeType);
    }
    setIsOpen(false);
  };

  return (
    <div className="panel-container">
      <div className="panel-section">
        <button
          className="shape-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          Add Graph Node
        </button>

        {isOpen && (
          <div className="panel-dropdown">
            {graphShapeTypes.map((shapeType) => (
              <button
                key={shapeType}
                className="shape-button"
                onClick={() => handleShapeSelect(shapeType as GraphShapeType)}
              >
                {shapeType.replace('cc-', '').replace('-node', '')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
