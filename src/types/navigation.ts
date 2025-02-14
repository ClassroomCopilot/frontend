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

// Helper function to get current node from history
export const getCurrentHistoryNode = (history: NavigationHistory): NavigationNode | null => {
    const node = history.currentIndex === -1 || !history.nodes.length ? null : history.nodes[history.currentIndex];
    logger.debug('history-management', '📍 Getting current history node', {
        currentIndex: history.currentIndex,
        totalNodes: history.nodes.length,
        node
    });
    return node;
};

// Helper function to add node to history
export const addToHistory = (
    history: NavigationHistory, 
    node: NavigationNode
): NavigationHistory => {
    logger.debug('history-management', '➕ Adding node to history', {
        currentIndex: history.currentIndex,
        newNode: node,
        existingNodes: history.nodes.length
    });
    
    const newNodes = [...history.nodes.slice(0, history.currentIndex + 1), node];
    const newHistory = {
        nodes: newNodes,
        currentIndex: newNodes.length - 1
    };
    
    logger.debug('history-management', '✅ History updated', {
        previousState: history,
        newState: newHistory
    });
    
    return newHistory;
};

// Helper function to navigate history
export const navigateHistory = (
    history: NavigationHistory,
    index: number
): NavigationHistory => {
    logger.debug('history-management', '🔄 Navigating history', {
        currentIndex: history.currentIndex,
        targetIndex: index,
        totalNodes: history.nodes.length
    });

    if (index < 0 || index >= history.nodes.length) {
        logger.warn('history-management', '⚠️ Invalid history navigation index', {
            requestedIndex: index,
            historyLength: history.nodes.length
        });
        return history;
    }

    const newHistory = {
        nodes: history.nodes,
        currentIndex: index
    };

    logger.debug('history-management', '✅ History navigation complete', {
        from: history.currentIndex,
        to: index,
        node: history.nodes[index]
    });

    return newHistory;
};

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
    logger.debug('navigation-context', '🔄 Getting context database', {
        mainContext: context.main,
        baseContext: context.base,
        userDbName,
        workerDbName
    });

    if (context.main === 'profile') {
        if (!userDbName) {
            logger.error('navigation-context', '❌ Missing user database name for profile context');
            throw new Error('User database name is required for profile context');
        }
        logger.debug('navigation-context', '✅ Using user database', { dbName: userDbName });
        return userDbName;
    } else {
        if (!workerDbName) {
            logger.error('navigation-context', '❌ Missing worker database name for institute context');
            throw new Error('Worker database name is required for institute context');
        }
        logger.debug('navigation-context', '✅ Using worker database', { dbName: workerDbName });
        return workerDbName;
    }
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
    skipBaseContextLoad?: boolean;
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

// Calendar Structure Types
export interface CalendarDay {
  id: string;
  date: string;
  title: string;
}

export interface CalendarWeek {
  id: string;
  title: string;
  days: { id: string }[];
  startDate: string;
  endDate: string;
}

export interface CalendarMonth {
  id: string;
  title: string;
  days: { id: string }[];
  weeks: { id: string }[];
  year: string;
  month: string;
}

export interface CalendarYear {
  id: string;
  title: string;
  months: { id: string }[];
  year: string;
}

export interface CalendarStructure {
  currentDay: string;
  days: Record<string, CalendarDay>;
  weeks: Record<string, CalendarWeek>;
  months: Record<string, CalendarMonth>;
  years: CalendarYear[];
}

// Worker Structure Types
export interface TimetableEntry {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
}

export interface ClassEntry {
  id: string;
  title: string;
  type: string;
}

export interface LessonEntry {
  id: string;
  title: string;
  type: string;
}

export interface WorkerStructure {
  timetables: Record<string, TimetableEntry[]>;
  classes: Record<string, ClassEntry[]>;
  lessons: Record<string, LessonEntry[]>;
  journals: Record<string, { id: string; title: string }[]>;
  planners: Record<string, { id: string; title: string }[]>;
} 