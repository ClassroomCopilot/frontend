import { CCNodeTypes } from '../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { NavigationNode } from './navigation';

// Node Type Groups
export type CalendarNodeType = 
  | 'Calendar'
  | 'CalendarYear'
  | 'CalendarMonth'
  | 'CalendarWeek'
  | 'CalendarDay';

export type WorkerNodeType = 
  | 'Teacher'
  | 'UserTeacherTimetable'
  | 'UserTimetableLesson';

// Node Types
export type CalendarNode = NavigationNode & {
  type: CalendarNodeType;
  data: CCNodeTypes[CalendarNodeType]['props'];
};

export type WorkerNode = NavigationNode & {
  type: WorkerNodeType;
  data: CCNodeTypes[WorkerNodeType]['props'];
};

// Type Guards
export const isCalendarNodeType = (type: string): type is CalendarNodeType => {
  return [
    'Calendar',
    'CalendarYear',
    'CalendarMonth',
    'CalendarWeek',
    'CalendarDay'
  ].includes(type);
};

export const isWorkerNodeType = (type: string): type is WorkerNodeType => {
  return [
    'Teacher',
    'UserTeacherTimetable',
    'UserTimetableLesson'
  ].includes(type);
};

export const isCalendarNode = (node: NavigationNode): node is CalendarNode => {
  return isCalendarNodeType(node.type);
};

export const isWorkerNode = (node: NavigationNode): node is WorkerNode => {
  return isWorkerNodeType(node.type);
};

// Backend Response Types
export interface ConnectedNodesResponse {
  calendar?: CCNodeTypes['Calendar']['props'];
  teacher?: CCNodeTypes['Teacher']['props'];
}

export interface UserNodesResponse {
  connectedNodes: ConnectedNodesResponse;
} 