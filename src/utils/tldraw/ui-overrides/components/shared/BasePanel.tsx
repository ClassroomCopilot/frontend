import React, { useState } from 'react';
import { TldrawUiButton } from '@tldraw/tldraw';

const PANEL_STYLES = {
  DIMENSIONS: {
    WIDTH: '150px',
    TOP_OFFSET: '20%',
    BOTTOM_OFFSET: '40%',
  },
  SPACING: {
    PADDING: {
      DEFAULT: '8px',
      HANDLE: '20px',
      BUTTON: '4px',
    },
    GAP: '4px',
  },
  TYPOGRAPHY: {
    TITLE: {
      SIZE: '14px',
      WEIGHT: 'bold',
    },
    DROPDOWN: {
      SIZE: '12px',
    },
    BUTTON: {
      SIZE: '12px',
    },
  },
  HANDLE: {
    WIDTH: '24px',
    BORDER_RADIUS: '0 4px 4px 0',
  },
  Z_INDEX: {
    HANDLE: 999,
    PANEL: 1000,
  },
} as const;

interface BasePanelProps {
  title: string;
  panelTypes?: Array<{id: string, label: string}>;
  onPanelTypeChange?: (panelType: string) => void;
  currentPanelType?: string;
  children: React.ReactNode;
}

export const BasePanel: React.FC<BasePanelProps> = ({
  title,
  panelTypes,
  onPanelTypeChange,
  currentPanelType,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {!isExpanded && (
        <div 
          className="panel-handle"
          onClick={() => setIsExpanded(true)}
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
            top: PANEL_STYLES.DIMENSIONS.TOP_OFFSET,
            height: `calc(100% - ${PANEL_STYLES.DIMENSIONS.BOTTOM_OFFSET})`,
            width: PANEL_STYLES.DIMENSIONS.WIDTH,
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: PANEL_STYLES.SPACING.GAP }}>
              <span style={{ 
                fontSize: PANEL_STYLES.TYPOGRAPHY.TITLE.SIZE, 
                fontWeight: PANEL_STYLES.TYPOGRAPHY.TITLE.WEIGHT 
              }}>
                {title}
              </span>
              
              {panelTypes && (
                <select 
                  value={currentPanelType}
                  onChange={(e) => onPanelTypeChange?.(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: PANEL_STYLES.TYPOGRAPHY.DROPDOWN.SIZE,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {panelTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
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
            {children}
          </div>
        </div>
      )}
    </>
  );
};