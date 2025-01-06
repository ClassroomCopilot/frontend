import React from 'react';
import { TldrawUiButton } from '@tldraw/tldraw';
import { PANEL_DIMENSIONS, PANEL_STYLES, SELECT_STYLES } from './panel-styles';

interface BasePanelProps {
  panelTypes?: Array<{id: string, label: string}>;
  onPanelTypeChange?: (panelType: string) => void;
  currentPanelType?: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export const BasePanel: React.FC<BasePanelProps> = ({
  panelTypes,
  onPanelTypeChange,
  currentPanelType = 'cc-shapes',
  children,
  isExpanded,
  onExpandedChange
}) => {
  const dimensions = PANEL_DIMENSIONS[currentPanelType as keyof typeof PANEL_DIMENSIONS];

  return (
    <>
      {!isExpanded && (
        <div 
          className="panel-handle"
          onClick={() => onExpandedChange(true)}
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
            {panelTypes && (
              <select 
                value={currentPanelType}
                onChange={(e) => onPanelTypeChange?.(e.target.value)}
                style={SELECT_STYLES.PANEL_TYPE_SELECT}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, SELECT_STYLES.PANEL_TYPE_SELECT_HOVER);
                }}
                onMouseOut={(e) => {
                  Object.assign(e.currentTarget.style, SELECT_STYLES.PANEL_TYPE_SELECT);
                }}
              >
                {panelTypes.map(type => (
                  <option 
                    key={type.id} 
                    value={type.id}
                    style={SELECT_STYLES.PANEL_TYPE_OPTION}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            )}
            
            <TldrawUiButton
              type="icon"
              onClick={() => onExpandedChange(false)}
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
            {children}
          </div>
        </div>
      )}
    </>
  );
};