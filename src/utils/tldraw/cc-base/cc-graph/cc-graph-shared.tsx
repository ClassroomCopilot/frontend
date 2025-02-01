import React, { CSSProperties } from 'react';
import { ShapeState } from './cc-graph-types'
import { SHARED_NODE_STYLES } from './cc-graph-styles'
import { logger } from '../../../../debugConfig'

// Error display component for nodes
interface NodeErrorDisplayProps {
  message: string;
  details?: string;
  style?: CSSProperties;
}

interface ErrorResult {
  hasError: true;
  error: {
    message: string;
    details: string;
  };
}

interface SuccessResult {
  hasError: false;
}

type ValidationResult = ErrorResult | SuccessResult;

export const NodeErrorDisplay: React.FC<NodeErrorDisplayProps> = ({
  message,
  details,
  style
}) => (
  <div style={{ ...SHARED_NODE_STYLES.error.container, ...style }}>
    <div style={SHARED_NODE_STYLES.error.message}>{message}</div>
    {details && <div style={SHARED_NODE_STYLES.error.details}>{details}</div>}
  </div>
);

// Error checking utilities
export const checkShapeState = (state: ShapeState | undefined | null): ValidationResult => {
  if (!state) {
    logger.warn('graph-shape-shared', '⚠️ Missing shape state', { state })
    return {
      hasError: true,
      error: {
        message: "Invalid Shape State",
        details: "Shape state is missing or undefined"
      }
    }
  }
  
  if (state.isPageChild === null) {
    logger.warn('graph-shape-shared', '⚠️ Invalid page child state', { state })
    return {
      hasError: true,
      error: {
        message: "Invalid Page State",
        details: "Unable to determine if node is a page child"
      }
    }
  }

  if (state.isPageChild === false && state.parentId === null) {
    logger.warn('graph-shape-shared', '⚠️ Shape child with no parent', { state })
    return {
      hasError: true,
      error: {
        message: "Invalid Shape Child State",
        details: "Shape child with no parent"
      }
    }
  }

  return { hasError: false }
}

export const checkDefaultComponent = (defaultComponent: boolean | { action: { label: string; handler: () => void } } | undefined | null): ValidationResult => {
  if (defaultComponent === null) {
    logger.warn('graph-shape-shared', '⚠️ Invalid default component', { defaultComponent })
    return {
      hasError: true,
      error: {
        message: "Invalid Default Component",
        details: "Default component is not set"
      }
    }
  }
  return { hasError: false }
}

// Base component for all graph nodes
interface DefaultNodeComponentProps {
  path: string
  onInspect?: (path: string) => void
  customAction?: {
    label: string
    handler: () => void
  }
}

export const DefaultNodeComponent: React.FC<DefaultNodeComponentProps> = ({
  path,
  onInspect = () => console.log(`Inspecting node at path: ${path}`),
  customAction
}) => {
  return (
    <div style={SHARED_NODE_STYLES.defaultComponent.container}>
      <button style={SHARED_NODE_STYLES.defaultComponent.button} onClick={() => onInspect(path)}>
        Inspect
      </button>
      {customAction && (
        <button style={SHARED_NODE_STYLES.defaultComponent.button} onClick={customAction.handler}>
          {customAction.label}
        </button>
      )}
    </div>
  )
}

// Helper function to create a node content wrapper
export const NodeContentWrapper = ({ 
  children, 
  style 
}: { 
  children: React.ReactNode;
  style: CSSProperties;
}) => (
  <div style={{ ...SHARED_NODE_STYLES.container, ...style }}>
    {children}
  </div>
);

// Helper function to create a node property display
export const NodeProperty = ({ 
  label, 
  value,
  labelStyle,
  valueStyle 
}: { 
  label: string;
  value: string;
  labelStyle: CSSProperties;
  valueStyle: CSSProperties;
}) => (
  <div style={SHARED_NODE_STYLES.property.wrapper}>
    <span style={{ ...SHARED_NODE_STYLES.property.label, ...labelStyle }}>{label}:</span>
    <span style={{ ...SHARED_NODE_STYLES.property.value, ...valueStyle }}>{value}</span>
  </div>
);
