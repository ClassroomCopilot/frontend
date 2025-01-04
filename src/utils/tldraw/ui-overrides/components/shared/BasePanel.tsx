import React, { useState } from 'react';
import { TldrawUiButton } from '@tldraw/tldraw';

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
            padding: '8px',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-2)',
            zIndex: 999,
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
            top: '20%',
            height: 'calc(100% - 40%)',
            width: '240px',
            backgroundColor: 'var(--color-panel)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-2)',
            zIndex: 1000,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <div 
            className="panel-header"
            style={{
              padding: '8px',
              borderBottom: '1px solid var(--color-divider)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold' 
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
                    fontSize: '12px',
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
                padding: '4px',
                fontSize: '12px',
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
              padding: '8px',
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};