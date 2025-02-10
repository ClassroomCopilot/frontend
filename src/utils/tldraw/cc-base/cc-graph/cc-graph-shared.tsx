import React, { CSSProperties } from 'react';
import { ShapeState } from './cc-graph-types'
import { SHARED_NODE_STYLES } from './cc-graph-styles'
import { logger } from '../../../../debugConfig'

interface Neo4jDate {
  _Date__year: number;
  _Date__month: number;
  _Date__day: number;
  _Date__ordinal?: number;
}

interface Neo4jTime {
  _Time__hour: number;
  _Time__minute: number;
  _Time__second: number;
  _Time__nanosecond: number;
  _Time__ticks: number;
  _Time__tzinfo: null;
}

interface Neo4jDateTime {
  _DateTime__date: Neo4jDate;
  _DateTime__time: Neo4jTime;
}

export type DateValue = string | Date | Neo4jDate | Neo4jDateTime | null | undefined;

const isValidDate = (year: number | undefined, month: number | undefined, day: number | undefined): boolean => {
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return false;
  if (month < 1 || month > 12 || day < -31 || day > 31) return false;
  // Handle special case for end of month markers
  if (day < 0) return true;
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
};

// Date formatting utility for Neo4j date objects and other formats
export const formatDate = (dateValue: DateValue): string => {
  if (!dateValue) return '';
  
  // Handle string dates
  if (typeof dateValue === 'string') return dateValue;
  
  // Handle standard Date objects
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }

  // Handle Neo4j DateTime objects
  if (typeof dateValue === 'object' && '_DateTime__date' in dateValue) {
    const nestedDate = dateValue._DateTime__date as Neo4jDate;
    return formatDate(nestedDate);
  }

  // Handle Neo4j Date objects and raw date objects
  if (typeof dateValue === 'object' && '_Date__year' in dateValue) {
    const year = dateValue._Date__year;
    const month = dateValue._Date__month;
    const day = dateValue._Date__day;
    
    if (isValidDate(year, month, day)) {
      try {
        // Handle negative days (end of month markers)
        if (typeof day === 'number' && day < 0 && typeof year === 'number' && typeof month === 'number') {
          const nextMonth = new Date(year, month, 1);
          nextMonth.setDate(nextMonth.getDate() - 1);
          return nextMonth.toISOString().split('T')[0];
        }
        if (typeof year === 'number' && typeof month === 'number' && typeof day === 'number') {
          const date = new Date(year, month - 1, day);
          return date.toISOString().split('T')[0];
        }
      } catch {
        logger.warn('graph-shape-shared', '⚠️ Failed to format Neo4j date', { dateValue });
      }
    }
    return 'Invalid Date';
  }

  // For any other object, try to convert it
  try {
    const date = new Date(String(dateValue));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    logger.warn('graph-shape-shared', '⚠️ Failed to format unknown date type', { dateValue });
  }

  return 'Invalid Date';
}

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
