import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { logger } from '../debugConfig';
import { CCUserNodeProps, CCTeacherNodeProps, CCCalendarNodeProps } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { CalendarStructure, WorkerStructure } from '../types/navigation';
import { useNavigationStore } from '../stores/navigationStore';

// Core Node Types
export interface CalendarNode {
  id: string;
  label: string;
  title: string;
  path: string;
  type?: CCCalendarNodeProps['__primarylabel__'];
  nodeData?: CCCalendarNodeProps;
}

export interface WorkerNode {
  id: string;
  label: string;
  title: string;
  path: string;
  type?: CCTeacherNodeProps['__primarylabel__'];
  nodeData?: CCTeacherNodeProps;
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

interface NeoUserContextType {
  userNode: CCUserNodeProps | null;
  calendarNode: CalendarNode | null;
  workerNode: WorkerNode | null;
  userDbName: string | null;
  workerDbName: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Calendar Navigation
  navigateToDay: (id: string) => Promise<void>;
  navigateToWeek: (id: string) => Promise<void>;
  navigateToMonth: (id: string) => Promise<void>;
  navigateToYear: (id: string) => Promise<void>;
  currentCalendarNode: CalendarNode | null;
  calendarStructure: CalendarStructure | null;
  
  // Worker Navigation
  navigateToTimetable: (id: string) => Promise<void>;
  navigateToJournal: (id: string) => Promise<void>;
  navigateToPlanner: (id: string) => Promise<void>;
  navigateToClass: (id: string) => Promise<void>;
  navigateToLesson: (id: string) => Promise<void>;
  currentWorkerNode: WorkerNode | null;
  workerStructure: WorkerStructure | null;
}

const NeoUserContext = createContext<NeoUserContextType>({
  userNode: null,
  calendarNode: null,
  workerNode: null,
  userDbName: null,
  workerDbName: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  navigateToDay: async () => {},
  navigateToWeek: async () => {},
  navigateToMonth: async () => {},
  navigateToYear: async () => {},
  navigateToTimetable: async () => {},
  navigateToJournal: async () => {},
  navigateToPlanner: async () => {},
  navigateToClass: async () => {},
  navigateToLesson: async () => {},
  currentCalendarNode: null,
  currentWorkerNode: null,
  calendarStructure: null,
  workerStructure: null
});

export const NeoUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { profile, isInitialized: isUserInitialized } = useUser();
  const navigationStore = useNavigationStore();
  
  const [userNode, setUserNode] = useState<CCUserNodeProps | null>(null);
  const [calendarNode] = useState<CalendarNode | null>(null);
  const [workerNode] = useState<WorkerNode | null>(null);
  const [currentCalendarNode, setCurrentCalendarNode] = useState<CalendarNode | null>(null);
  const [currentWorkerNode, setCurrentWorkerNode] = useState<WorkerNode | null>(null);
  const [calendarStructure] = useState<CalendarStructure | null>(null);
  const [workerStructure] = useState<WorkerStructure | null>(null);
  const [userDbName, setUserDbName] = useState<string | null>(null);
  const [workerDbName, setWorkerDbName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref for initialization tracking to prevent re-renders
  const initializationRef = React.useRef({
    hasStarted: false,
    isComplete: false
  });

  // Add base properties for node data
  const getBaseNodeProps = () => ({
    w: 500,
    h: 350,
    headerColor: '#000000',
    backgroundColor: '#ffffff',
    isLocked: false
  });

  // Initialize context when dependencies are ready
  useEffect(() => {
    if (!isUserInitialized || !profile || isInitialized || initializationRef.current.hasStarted) {
      return;
    }

    const initializeContext = async () => {
      try {
        initializationRef.current.hasStarted = true;
        setIsLoading(true);
        setError(null);

        // Set database names
        const userDb = profile.user_db_name || (user?.email ? 
          `cc.ccusers.${user.email.replace('@', 'at').replace(/\./g, 'dot')}` : null);
        
        if (!userDb) {
          throw new Error('No user database name available');
        }

        // Initialize user node in profile context
        logger.debug('neo-user-context', '🔄 Starting context initialization');

        // Initialize user node
        await navigationStore.switchContext({
          main: 'profile',
          base: 'profile',
          extended: 'overview'
        }, userDb, profile.worker_db_name);

        const userNavigationNode = navigationStore.context.node;
        if (userNavigationNode?.data) {
          const userNodeData = {
            ...getBaseNodeProps(),
            ...userNavigationNode.data,
            __primarylabel__: 'User' as const,
            unique_id: userNavigationNode.id,
            path: userNavigationNode.path,
            title: userNavigationNode.data.user_name || 'User'
          } as CCUserNodeProps;
          setUserNode(userNodeData);
        }

        // Set final state
        setUserDbName(userDb);
        setWorkerDbName(profile.worker_db_name);
        setIsInitialized(true);
        setIsLoading(false);
        initializationRef.current.isComplete = true;
        
        logger.debug('neo-user-context', '✅ Context initialization complete');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user context';
        logger.error('neo-user-context', '❌ Failed to initialize context', { error: errorMessage });
        setError(errorMessage);
        setIsLoading(false);
        setIsInitialized(true);
        initializationRef.current.isComplete = true;
      }
    };

    initializeContext();
  }, [user?.email, profile, isUserInitialized, navigationStore, isInitialized]);

  // Calendar Navigation Functions
  const navigateToDay = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'calendar',
        extended: 'day'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'CalendarDay' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCCalendarNodeProps;

        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarDay',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to day');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToWeek = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'calendar',
        extended: 'week'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'CalendarWeek' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCCalendarNodeProps;

        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarWeek',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to week');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToMonth = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'calendar',
        extended: 'month'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'CalendarMonth' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCCalendarNodeProps;

        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarMonth',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to month');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToYear = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'calendar',
        extended: 'year'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'CalendarYear' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCCalendarNodeProps;

        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarYear',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to year');
    } finally {
      setIsLoading(false);
    }
  };

  // Worker Navigation Functions
  const navigateToTimetable = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'teaching',
        extended: 'timetable'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'UserTeacherTimetable' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCTeacherNodeProps;

        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'UserTeacherTimetable',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to timetable');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToJournal = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'teaching',
        extended: 'journal'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'Teacher' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCTeacherNodeProps;

        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'Teacher',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to journal');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPlanner = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'teaching',
        extended: 'planner'
      }, userDbName, workerDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'Teacher' as const,
          unique_id: id || node.id,
          path: node.path,
          title: node.label
        } as CCTeacherNodeProps;

        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'Teacher',
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to planner');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToClass = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'teaching',
        extended: 'classes'
      }, userDbName, workerDbName);
      await navigationStore.navigate(id, userDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'Teacher' as const,
          unique_id: node.id,
          path: node.path,
          title: node.label
        } as CCTeacherNodeProps;

        setCurrentWorkerNode({
          id: node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: node.type,
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to class');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLesson = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      await navigationStore.switchContext({
        base: 'teaching',
        extended: 'lessons'
      }, userDbName, workerDbName);
      await navigationStore.navigate(id, userDbName);

      const node = navigationStore.context.node;
      if (node?.data) {
        const nodeData = {
          ...getBaseNodeProps(),
          ...node.data,
          __primarylabel__: 'Teacher' as const,
          unique_id: node.id,
          path: node.path,
          title: node.label
        } as CCTeacherNodeProps;

        setCurrentWorkerNode({
          id: node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: node.type,
          nodeData
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to navigate to lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeoUserContext.Provider value={{
      userNode,
      calendarNode,
      workerNode,
      userDbName,
      workerDbName,
      isLoading,
      isInitialized,
      error,
      navigateToDay,
      navigateToWeek,
      navigateToMonth,
      navigateToYear,
      navigateToTimetable,
      navigateToJournal,
      navigateToPlanner,
      navigateToClass,
      navigateToLesson,
      currentCalendarNode,
      currentWorkerNode,
      calendarStructure,
      workerStructure
    }}>
      {children}
    </NeoUserContext.Provider>
  );
};

export const useNeoUser = () => useContext(NeoUserContext);
