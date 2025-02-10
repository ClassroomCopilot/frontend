import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNeo4j } from './Neo4jContext';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { logger } from '../debugConfig';
import { CalendarNodeData, WorkerNodeData } from '../services/graph/neoDBService';
import { UserNeoDBService } from '../services/graph/userNeoDBService';

// Core Node Types
export interface CalendarNode {
  id: string;
  label: string;
  title: string;
  path: string;
  type?: CalendarNodeData['__primarylabel__'];
  nodeData?: CalendarNodeData;
}

export interface WorkerNode {
  id: string;
  label: string;
  title: string;
  path: string;
  type?: WorkerNodeData['__primarylabel__'];
  nodeData?: WorkerNodeData;
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

interface NeoUserContextType {
  calendarNode: CalendarNode | null;
  workerNode: WorkerNode | null;
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
  calendarNode: null,
  workerNode: null,
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
  const { userNodes, isInitialized: isNeo4jInitialized, userDbName } = useNeo4j();
  
  const [calendarNode, setCalendarNode] = useState<CalendarNode | null>(null);
  const [workerNode, setWorkerNode] = useState<WorkerNode | null>(null);
  const [currentCalendarNode, setCurrentCalendarNode] = useState<CalendarNode | null>(null);
  const [currentWorkerNode, setCurrentWorkerNode] = useState<WorkerNode | null>(null);
  const [calendarStructure, setCalendarStructure] = useState<CalendarStructure | null>(null);
  const [workerStructure, setWorkerStructure] = useState<WorkerStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar Navigation Functions
  const navigateToDay = async (id: string) => {
    if (!userDbName) return;
    setIsLoading(true);
    try {
      const node = await UserNeoDBService.getDefaultNode('day', userDbName);
      if (node) {
        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarDay',
          nodeData: node.data as CalendarNodeData
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
        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarWeek',
          nodeData: node.data as CalendarNodeData
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
        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarMonth',
          nodeData: node.data as CalendarNodeData
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
        setCurrentCalendarNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'CalendarYear',
          nodeData: node.data as CalendarNodeData
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
        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'UserTeacherTimetable',
          nodeData: node.data as WorkerNodeData
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
        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'Teacher',
          nodeData: node.data as WorkerNodeData
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
        setCurrentWorkerNode({
          id: id || node.id,
          label: node.label,
          title: node.label,
          path: node.path,
          type: 'Teacher',
          nodeData: node.data as WorkerNodeData
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

  // Initialize context when dependencies are ready
  useEffect(() => {
    // Wait for user profile and Neo4j context
    if (!isUserInitialized || !isNeo4jInitialized) {
      logger.debug('neo-user-context', '⏳ Waiting for user and Neo4j initialization...');
      return;
    }

    // If no user nodes, mark as initialized with no data
    if (!userNodes) {
      logger.debug('neo-user-context', '⚠️ No user nodes available, marking as initialized');
      setIsInitialized(true);
      return;
    }

    const initializeStructures = async () => {
      try {
        if (userDbName) {
          // Initialize calendar structure
          const calendarData = await UserNeoDBService.fetchCalendarStructure(userDbName);
          setCalendarStructure(calendarData);

          // Initialize worker structure
          const workerData = await UserNeoDBService.fetchWorkerStructure(userDbName);
          setWorkerStructure(workerData);
        }
      } catch (error) {
        logger.error('neo-user-context', '❌ Failed to initialize structures', error);
      }
    };

    // Set calendar node if available
    if (userNodes.connectedNodes.calendar) {
      const calendarNodeData = {
        id: userNodes.connectedNodes.calendar.unique_id,
        label: userNodes.connectedNodes.calendar.__primarylabel__,
        title: userNodes.connectedNodes.calendar.calendar_name || 'Calendar',
        path: userNodes.connectedNodes.calendar.path,
        type: userNodes.connectedNodes.calendar.__primarylabel__ as CalendarNodeData['__primarylabel__'],
        nodeData: userNodes.connectedNodes.calendar as unknown as CalendarNodeData
      };
      setCalendarNode(calendarNodeData);
      setCurrentCalendarNode(calendarNodeData);
    }

    // Set worker node if available
    if (userNodes.connectedNodes.teacher) {
      const workerNodeData = {
        id: userNodes.connectedNodes.teacher.unique_id,
        label: userNodes.connectedNodes.teacher.__primarylabel__,
        title: userNodes.connectedNodes.teacher.teacher_name_formal || 'Teacher',
        path: userNodes.connectedNodes.teacher.path,
        type: userNodes.connectedNodes.teacher.__primarylabel__ as WorkerNodeData['__primarylabel__'],
        nodeData: userNodes.connectedNodes.teacher as unknown as WorkerNodeData
      };
      setWorkerNode(workerNodeData);
      setCurrentWorkerNode(workerNodeData);
    }

    initializeStructures();
    setIsInitialized(true);
  }, [user?.email, profile, userNodes, isUserInitialized, isNeo4jInitialized, userDbName]);

  return (
    <NeoUserContext.Provider value={{
        calendarNode,
        workerNode,
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
