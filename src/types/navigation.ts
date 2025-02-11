import { CalendarNode, WorkerNode } from '../contexts/NeoUserContext';
import { logger } from '../debugConfig';

// Main Context Types
export type MainContext = 'profile' | 'institute';

// Profile Context Types
export type ProfileContext = 'profile' | 'calendar' | 'teaching';

// Extended Context Types
export type UserExtendedContext = 'overview' | 'settings' | 'history' | 'journal' | 'planner';
export type CalendarExtendedContext = 'overview' | 'day' | 'week' | 'month' | 'year';
export type TeacherExtendedContext = 
  | 'overview' 
  | 'timetable' 
  | 'classes' 
  | 'lessons' 
  | 'journal' 
  | 'planner';
export type SchoolExtendedContext = 'overview' | 'departments' | 'staff';
export type DepartmentExtendedContext = 'overview' | 'teachers' | 'subjects';
export type ClassExtendedContext = 'overview' | 'students' | 'timetable';

// Combined Extended Context Type
export type ExtendedContext = 
  | UserExtendedContext 
  | CalendarExtendedContext 
  | TeacherExtendedContext 
  | SchoolExtendedContext 
  | DepartmentExtendedContext 
  | ClassExtendedContext;

// View Definition
export interface ViewDefinition {
  id: ExtendedContext;
  icon: string;
  label: string;
  description: string;
}

// Institute Context Types
export type InstituteContext = 'school' | 'department' | 'class';

// View Context Types
export type ViewContext = 
  | 'overview' 
  | 'settings' 
  | 'history' 
  | 'journal' 
  | 'planner'
  | 'day' 
  | 'week' 
  | 'month' 
  | 'year' 
  | 'timetable' 
  | 'classes' 
  | 'lessons'
  | 'departments' 
  | 'staff'
  | 'teachers' 
  | 'subjects'
  | 'students';

// Combined Context Type
export type BaseContext = ProfileContext | InstituteContext;

// Combined Node Context Type
export type NodeContext = BaseContext | ExtendedContext;

// Navigation History
export interface NavigationHistory {
  nodes: NavigationNode[];
  currentIndex: number;
}

// Context State Interface
export interface NavigationContextState {
  main: MainContext;
  base: BaseContext;
  node: NavigationNode | null;
  history: NavigationHistory;
}

// Type Guards
export const isProfileContext = (context: BaseContext): context is ProfileContext => {
  return ['profile', 'calendar', 'teaching'].includes(context);
};

export const isInstituteContext = (context: BaseContext): context is InstituteContext => {
  return ['school', 'department', 'class'].includes(context);
};

// Database selector
export const getContextDatabase = (context: NavigationContextState, userDbName: string | null, workerDbName: string | null): string => {
  logger.debug('navigation', '🔄 Getting context database', {
    mainContext: context.main,
    baseContext: context.base,
    userDbName,
    workerDbName
  });

  if (context.main === 'profile') {
    if (!userDbName) {
      logger.error('navigation', '❌ Missing user database name for profile context');
      throw new Error('User database name is required for profile context');
    }
    logger.debug('navigation', '✅ Using user database', { dbName: userDbName });
    return userDbName;
  } else {
    if (!workerDbName) {
      logger.error('navigation', '❌ Missing worker database name for institute context');
      throw new Error('Worker database name is required for institute context');
    }
    logger.debug('navigation', '✅ Using worker database', { dbName: workerDbName });
    return workerDbName;
  }
};

// History utility functions
export const addToHistory = (
  history: NavigationHistory, 
  node: NavigationNode
): NavigationHistory => {
  const newNodes = [...history.nodes.slice(0, history.currentIndex + 1), node];
  return {
    nodes: newNodes,
    currentIndex: newNodes.length - 1
  };
};

// Context Definition Types
export interface ContextDefinition {
  id: BaseContext;
  icon: string;
  label: string;
  description: string;
  defaultNodeId: string;
  views: ViewDefinition[];
}

// Navigation Node Types
export interface NavigationNode {
  id: string;
  path: string;
  label: string;
  type: string;
  context?: NavigationContextState;
  data?: {
    unique_id: string;
    path: string;
    title?: string;
    name?: string;
    worker_db_name?: string;
    [key: string]: unknown;
  };
}

// Navigation State Interface
export interface NavigationState {
  context: NavigationContextState;
  isLoading: boolean;
  error: string | null;
}

// Add UnifiedContextSwitch interface
export interface UnifiedContextSwitch {
    main?: MainContext;
    base?: BaseContext;
    extended?: ExtendedContext;
}

// Navigation Actions Interface
export interface NavigationActions {
    // Unified Context Switch
    switchContext: (contextSwitch: UnifiedContextSwitch, userDbName: string | null, workerDbName: string | null) => Promise<void>;
    
    // Context Navigation
    setMainContext: (context: MainContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
    setBaseContext: (context: BaseContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
    setExtendedContext: (context: ExtendedContext, userDbName: string | null, workerDbName: string | null) => Promise<void>;
    
    // Node Navigation
    navigate: (nodeId: string, dbName: string) => Promise<void>;
    navigateToNode: (node: NavigationNode, userDbName: string | null, workerDbName: string | null) => Promise<void>;
    
    // History Navigation
    goBack: () => void;
    goForward: () => void;
    
    // Utility Methods
    refreshNavigationState: (userDbName: string | null, workerDbName: string | null) => Promise<void>;
}

export type NavigationStore = NavigationState & NavigationActions;

// Context Props Interfaces
export interface CalendarContextProps {
  navigateToDay: (id: string) => Promise<void>;
  navigateToWeek: (id: string) => Promise<void>;
  navigateToMonth: (id: string) => Promise<void>;
  navigateToYear: (id: string) => Promise<void>;
  currentCalendarNode: CalendarNode | null;
}

export interface WorkerContextProps {
  navigateToTimetable: (id: string) => Promise<void>;
  navigateToClass: (id: string) => Promise<void>;
  navigateToLesson: (id: string) => Promise<void>;
  navigateToJournal: (id: string) => Promise<void>;
  navigateToPlanner: (id: string) => Promise<void>;
  currentWorkerNode: WorkerNode | null;
}

export interface StaticNavigationNode extends NavigationNode {
  isStatic: true;
  order: number;
  section: string;
} 