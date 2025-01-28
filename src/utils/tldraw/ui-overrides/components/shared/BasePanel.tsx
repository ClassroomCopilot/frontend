import React from 'react';
import { TldrawUiButton } from '@tldraw/tldraw';
import { PANEL_DIMENSIONS, Z_INDICES } from './panel-styles';
import { CCShapesPanel } from './CCShapesPanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { CCYoutubePanel } from './CCYoutubePanel';
import { CCGraphPanel } from './CCGraphPanel';
import './panel.css';

export const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'graph', label: 'Graph' },
] as const;

export type PanelType = typeof PANEL_TYPES[number]['id'];

interface BasePanelProps {
  initialPanelType?: PanelType;
}

export const BasePanel: React.FC<BasePanelProps> = ({
  initialPanelType = 'cc-shapes',
}) => {
  const [currentPanelType, setCurrentPanelType] = React.useState<PanelType>(initialPanelType);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dimensions = PANEL_DIMENSIONS[currentPanelType as keyof typeof PANEL_DIMENSIONS];

  const renderCurrentPanel = () => {
    switch (currentPanelType) {
      case 'cc-shapes':
        return <CCShapesPanel />;
      case 'slides':
        return <CCSlidesPanel />;
      case 'youtube':
        return <CCYoutubePanel />;
      case 'graph':
        return <CCGraphPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      {!isExpanded && (
        <div 
          className="panel-handle"
          onClick={() => setIsExpanded(true)}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
        >
          ›
        </div>
      )}

      {isExpanded && (
        <div 
          className="panel-root"
          style={{
            top: dimensions.topOffset,
            height: `calc(100% - ${dimensions.bottomOffset})`,
            width: dimensions.width,
            zIndex: Z_INDICES.PANEL,
          }}
        >
          <div className="panel-header">
            <select 
              value={currentPanelType}
              onChange={(e) => setCurrentPanelType(e.target.value as PanelType)}
              className="panel-type-select"
            >
              {PANEL_TYPES.map(type => (
                <option 
                  key={type.id} 
                  value={type.id}
                  className="panel-type-option"
                >
                  {type.label}
                </option>
              ))}
            </select>
            
            <TldrawUiButton
              type="icon"
              onClick={() => setIsExpanded(false)}
            >
              Hide
            </TldrawUiButton>
          </div>

          <div className="panel-content">
            {renderCurrentPanel()}
          </div>
        </div>
      )}
    </>
  );
};