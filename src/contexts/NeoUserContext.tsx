import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { logger } from '../debugConfig';
import { UserNeoDBService } from '../services/graph/userNeoDBService';
import { CCUserNodeProps, CCTeacherNodeProps, CCCalendarNodeProps } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { CalendarStructure, WorkerStructure } from '../types/navigation';

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
  
  const [userNode, setUserNode] = useState<CCUserNodeProps | null>(null);
  const [calendarNode, setCalendarNode] = useState<CalendarNode | null>(null);
  const [workerNode, setWorkerNode] = useState<WorkerNode | null>(null);
  const [currentCalendarNode, setCurrentCalendarNode] = useState<CalendarNode | null>(null);
  const [currentWorkerNode, setCurrentWorkerNode] = useState<WorkerNode | null>(null);
  const [calendarStructure, setCalendarStructure] = useState<CalendarStructure | null>(null);
  const [workerStructure, setWorkerStructure] = useState<WorkerStructure | null>(null);
  const [userDbName, setUserDbName] = useState<string | null>(null);
  const [workerDbName, setWorkerDbName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!isUserInitialized) {
      logger.debug('neo-user-context', '⏳ Waiting for user initialization...');
      return;
    }

    // If no profile, mark as initialized with no data
    if (!profile) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    const initializeContext = async () => {
      try {
        setIsLoading(true);

        // Set database names
        if (!profile.user_db_name && user?.email) {
          const formattedEmail = user.email.replace('@', 'at').replace(/\./g, 'dot');
          const constructedDbName = `cc.ccusers.${formattedEmail}`;
          setUserDbName(constructedDbName);
        } else {
          setUserDbName(profile.user_db_name);
        }
        setWorkerDbName(profile.worker_db_name);

        // Fetch user nodes data
        if (profile.user_db_name && user?.email) {
          const userNodesData = await UserNeoDBService.fetchUserNodesData(
            user.email,
            profile.user_db_name,
            profile.worker_db_name
          );

          if (userNodesData) {
            // Set user node
            if (userNodesData.privateUserNode) {
              setUserNode(userNodesData.privateUserNode);
            }

            // Set calendar node
            if (userNodesData.connectedNodes.calendar) {
              const calendarNodeData = {
                ...getBaseNodeProps(),
                ...userNodesData.connectedNodes.calendar,
                __primarylabel__: 'Calendar' as const,
                unique_id: userNodesData.connectedNodes.calendar.unique_id,
                path: userNodesData.connectedNodes.calendar.path,
                title: userNodesData.connectedNodes.calendar.calendar_name || 'Calendar'
              } as CCCalendarNodeProps;

              const calendarNode = {
                id: calendarNodeData.unique_id,
                label: calendarNodeData.__primarylabel__,
                title: calendarNodeData.title,
                path: calendarNodeData.path,
                type: calendarNodeData.__primarylabel__,
                nodeData: calendarNodeData
              };
              setCalendarNode(calendarNode);
              setCurrentCalendarNode(calendarNode);
            }

            // Set worker node
            if (userNodesData.connectedNodes.teacher) {
              const teacherNodeData = {
                ...getBaseNodeProps(),
                ...userNodesData.connectedNodes.teacher,
                __primarylabel__: 'Teacher' as const,
                unique_id: userNodesData.connectedNodes.teacher.unique_id,
                path: userNodesData.connectedNodes.teacher.path,
                title: userNodesData.connectedNodes.teacher.teacher_name_formal || 'Teacher'
              } as CCTeacherNodeProps;

              const workerNode = {
                id: teacherNodeData.unique_id,
                label: teacherNodeData.__primarylabel__,
                title: teacherNodeData.title,
                path: teacherNodeData.path,
                type: teacherNodeData.__primarylabel__,
                nodeData: teacherNodeData
              };
              setWorkerNode(workerNode);
              setCurrentWorkerNode(workerNode);
            }

            // Initialize structures
            if (profile.user_db_name) {
              const [calendarData, workerData] = await Promise.all([
                UserNeoDBService.fetchCalendarStructure(profile.user_db_name),
                UserNeoDBService.fetchWorkerStructure(profile.user_db_name)
              ]);
              setCalendarStructure(calendarData);
              setWorkerStructure(workerData);
            }
          }
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user context';
        logger.error('neo-user-context', '❌ Failed to initialize context', { error: errorMessage });
        setError(errorMessage);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeContext();
  }, [user?.email, profile, isUserInitialized]);

  // Calendar Navigation Functions
  const navigateToDay = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      const node = await UserNeoDBService.getDefaultNode('day', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('week', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('month', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('year', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('timetable', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('journal', userDbName);
      if (node) {
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
      const node = await UserNeoDBService.getDefaultNode('planner', userDbName);
      if (node) {
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
    try {
      const response = await fetch(`/api/database/worker-structure/get-class/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch class: ${response.statusText}`);
      }
      const classData = await response.json();
      setCurrentWorkerNode(classData);
    } catch (error) {
      logger.error('navigation', '❌ Failed to navigate to class:', error);
    }
  };

  const navigateToLesson = async (id: string) => {
    try {
      const response = await fetch(`/api/database/worker-structure/get-lesson/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch lesson: ${response.statusText}`);
      }
      const lessonData = await response.json();
      setCurrentWorkerNode(lessonData);
    } catch (error) {
      logger.error('navigation', '❌ Failed to navigate to lesson:', error);
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
