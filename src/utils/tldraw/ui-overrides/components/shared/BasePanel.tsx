import React from 'react';
import { TldrawUiButton } from '@tldraw/tldraw';
import { PANEL_DIMENSIONS, PANEL_STYLES, SELECT_STYLES } from './panel-styles';
import { CCShapesPanel } from './CCShapesPanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { CCYoutubePanel } from './CCYoutubePanel';

export const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
  { id: 'youtube', label: 'YouTube' },
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
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--color-panel)',
            padding: PANEL_STYLES.SPACING.PADDING.HANDLE,
            borderRadius: PANEL_STYLES.HANDLE.BORDER_RADIUS,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-2)',
            zIndex: PANEL_STYLES.Z_INDEX.HANDLE,
            touchAction: 'none',
          }}
        >
          ›
        </div>
      )}

      {isExpanded && (
        <div 
          className="base-panel"
          style={{
            position: 'absolute',
            left: 0,
            top: dimensions.topOffset,
            height: `calc(100% - ${dimensions.bottomOffset})`,
            width: dimensions.width,
            backgroundColor: 'var(--color-panel)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-2)',
            zIndex: PANEL_STYLES.Z_INDEX.PANEL,
            borderRadius: PANEL_STYLES.HANDLE.BORDER_RADIUS,
          }}
        >
          <div 
            className="panel-header"
            style={{
              padding: PANEL_STYLES.SPACING.PADDING.DEFAULT,
              borderBottom: '1px solid var(--color-divider)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <select 
              value={currentPanelType}
              onChange={(e) => setCurrentPanelType(e.target.value as PanelType)}
              style={SELECT_STYLES.PANEL_TYPE_SELECT}
              onMouseOver={(e) => {
                Object.assign(e.currentTarget.style, SELECT_STYLES.PANEL_TYPE_SELECT_HOVER);
              }}
              onMouseOut={(e) => {
                Object.assign(e.currentTarget.style, SELECT_STYLES.PANEL_TYPE_SELECT);
              }}
            >
              {PANEL_TYPES.map(type => (
                <option 
                  key={type.id} 
                  value={type.id}
                  style={SELECT_STYLES.PANEL_TYPE_OPTION}
                >
                  {type.label}
                </option>
              ))}
            </select>
            
            <TldrawUiButton
              type="icon"
              onClick={() => setIsExpanded(false)}
              style={{
                padding: PANEL_STYLES.SPACING.PADDING.BUTTON,
                fontSize: PANEL_STYLES.TYPOGRAPHY.BUTTON.SIZE,
              }}
            >
              Hide
            </TldrawUiButton>
          </div>

          <div 
            className="panel-content"
            style={{
              flex: 1,
              overflow: 'auto',
              padding: PANEL_STYLES.SPACING.PADDING.DEFAULT,
            }}
          >
            {renderCurrentPanel()}
          </div>
        </div>
      )}
    </>
  );
};