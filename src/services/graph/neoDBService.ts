import { CCNodeTypes } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { logger } from '../../debugConfig';

export interface BaseNodeData {
  unique_id: string;
  path: string;
  __primarylabel__: string;
  [key: string]: unknown;
}

export interface CalendarNodeData extends BaseNodeData {
  __primarylabel__: 'Calendar' | 'CalendarYear' | 'CalendarMonth' | 'CalendarWeek' | 'CalendarDay';
  date?: string;
}

export interface WorkerNodeData extends BaseNodeData {
  __primarylabel__: 'School' | 'Department' | 'Teacher' | 'UserTeacherTimetable' | 'Class' | 'TimetableLesson';
  name?: string;
  teacher_code?: string;
  teacher_name_formal?: string;
  class_code?: string;
  department_code?: string;
  school_name?: string;
}

export type NodeType = keyof CCNodeTypes | 'User' | 'Calendar' | 'CalendarYear' | 'CalendarMonth' | 'CalendarWeek' | 'CalendarDay' | 'Teacher' | 'UserTeacherTimetable' | 'Student' | 'Class' | 'TimetableLesson';

export function formatEmailForDatabase(email: string): string {
  // Convert to lowercase and replace special characters
  const sanitized = email.toLowerCase()
    .replace('@', 'at')
    .replace(/\./g, 'dot')
    .replace(/_/g, 'underscore')
    .replace(/-/g, 'dash');
    
  // Add prefix and ensure no consecutive dashes
  return `${sanitized}`;
}

export function generateNodeTitle(nodeData: BaseNodeData): string {
  try {
    const calendarData = nodeData as CalendarNodeData;
    const workerData = nodeData as WorkerNodeData;

    switch (nodeData.__primarylabel__ as NodeType) {
      // Calendar nodes
      case 'Calendar':
        return 'Calendar';
      case 'CalendarYear':
        if (!calendarData.date) return 'Unknown Year';
        return `Year ${new Date(calendarData.date).getFullYear()}`;
      case 'CalendarMonth':
        if (!calendarData.date) return 'Unknown Month';
        return new Date(calendarData.date).toLocaleString('default', { month: 'long' });
      case 'CalendarWeek':
        if (!calendarData.date) return 'Unknown Week';
        return `Week ${new Date(calendarData.date).getDate()}`;
      case 'CalendarDay':
        if (!calendarData.date) return 'Unknown Day';
        return new Date(calendarData.date).toLocaleDateString();

      // Worker/School nodes
      case 'School':
        return workerData.school_name || 'School';
      case 'Department':
        return workerData.department_code || 'Department';
      case 'Teacher':
        return workerData.teacher_name_formal || workerData.teacher_code || 'Teacher';
      case 'UserTeacherTimetable':
        return 'Timetable';
      case 'Class':
        return workerData.class_code || 'Class';
      case 'TimetableLesson':
        return 'Lesson';
      
      default:
        logger.warn('neo4j-service', `⚠️ Unknown node type for title generation: ${nodeData.__primarylabel__}`);
        return 'Unknown Node';
    }
  } catch (error) {
    logger.error('neo4j-service', '❌ Failed to generate node title', { error, nodeData });
    return 'Error: Invalid Node Data';
  }
}

export function getMonthFromWeek(weekDate: string): string {
  // Get the month that contains the most days of this week
  const weekStart = new Date(weekDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // If week spans two months, use the month that contains more days of the week
  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    const daysInFirstMonth = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0).getDate() - weekStart.getDate() + 1;
    const daysInSecondMonth = 7 - daysInFirstMonth;
    
    return daysInFirstMonth >= daysInSecondMonth ? 
      weekStart.toLocaleString('default', { month: 'long' }) :
      weekEnd.toLocaleString('default', { month: 'long' });
  }

  return weekStart.toLocaleString('default', { month: 'long' });
}

export function getDatabaseName(path: string, defaultSchoolUuid = 'kevlarai'): string {
  // If the path starts with /node_filesystem/users/, it's in a user database
  if (path.startsWith('/node_filesystem/users/')) {
    const parts = path.split('/');
    // parts[3] should be the database name (e.g., cc.ccusers.surfacedashdev3atkevlaraidotcom)
    return parts[3];
  }
  // For school/worker nodes, extract from the path or use default
  if (path.includes('/schools/')) {
    return `cc.ccschools.${defaultSchoolUuid}`;
  }
  // Default to user database if we can't determine
  return path.split('/')[3];
}