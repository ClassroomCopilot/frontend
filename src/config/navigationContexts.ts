import { ContextDefinition } from '../types/navigation';

export const NAVIGATION_CONTEXTS: Record<string, ContextDefinition> = {
  // Personal Contexts
  profile: {
    id: 'profile',
    icon: 'Person',
    label: 'User Profile',
    description: 'Personal workspace and settings',
    defaultNodeId: 'user-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'View your profile overview'
      },
      {
        id: 'settings',
        icon: 'Settings',
        label: 'Settings',
        description: 'Manage your preferences'
      },
      {
        id: 'history',
        icon: 'History',
        label: 'History',
        description: 'View your activity history'
      },
      {
        id: 'journal',
        icon: 'Book',
        label: 'Journal',
        description: 'Your personal journal'
      },
      {
        id: 'planner',
        icon: 'Event',
        label: 'Planner',
        description: 'Plan your activities'
      }
    ]
  },
  calendar: {
    id: 'calendar',
    icon: 'CalendarToday',
    label: 'Calendar',
    description: 'Calendar navigation and events',
    defaultNodeId: 'calendar-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'Calendar overview'
      },
      {
        id: 'day',
        icon: 'Today',
        label: 'Day View',
        description: 'Navigate by day'
      },
      {
        id: 'week',
        icon: 'ViewWeek',
        label: 'Week View',
        description: 'Navigate by week'
      },
      {
        id: 'month',
        icon: 'DateRange',
        label: 'Month View',
        description: 'Navigate by month'
      },
      {
        id: 'year',
        icon: 'Event',
        label: 'Year View',
        description: 'Navigate by year'
      }
    ]
  },
  teaching: {
    id: 'teaching',
    icon: 'School',
    label: 'Teaching',
    description: 'Teaching workspace',
    defaultNodeId: 'teacher-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'Teaching overview'
      },
      {
        id: 'timetable',
        icon: 'Schedule',
        label: 'Timetable',
        description: 'View your teaching schedule'
      },
      {
        id: 'classes',
        icon: 'Class',
        label: 'Classes',
        description: 'Manage your classes'
      },
      {
        id: 'lessons',
        icon: 'Book',
        label: 'Lessons',
        description: 'Plan and view lessons'
      },
      {
        id: 'journal',
        icon: 'Book',
        label: 'Journal',
        description: 'Your teaching journal'
      },
      {
        id: 'planner',
        icon: 'Event',
        label: 'Planner',
        description: 'Plan your teaching activities'
      }
    ]
  },

  // Institutional Contexts
  school: {
    id: 'school',
    icon: 'Business',
    label: 'School',
    description: 'School management',
    defaultNodeId: 'school-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'School overview'
      },
      {
        id: 'departments',
        icon: 'AccountTree',
        label: 'Departments',
        description: 'View departments'
      },
      {
        id: 'staff',
        icon: 'People',
        label: 'Staff',
        description: 'Staff directory'
      }
    ]
  },
  department: {
    id: 'department',
    icon: 'AccountTree',
    label: 'Department',
    description: 'Department management',
    defaultNodeId: 'department-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'Department overview'
      },
      {
        id: 'teachers',
        icon: 'People',
        label: 'Teachers',
        description: 'Department teachers'
      },
      {
        id: 'subjects',
        icon: 'Subject',
        label: 'Subjects',
        description: 'Department subjects'
      }
    ]
  },
  class: {
    id: 'class',
    icon: 'Class',
    label: 'Class',
    description: 'Class management',
    defaultNodeId: 'class-root',
    views: [
      {
        id: 'overview',
        icon: 'Dashboard',
        label: 'Overview',
        description: 'Class overview'
      },
      {
        id: 'students',
        icon: 'People',
        label: 'Students',
        description: 'Class students'
      },
      {
        id: 'timetable',
        icon: 'Schedule',
        label: 'Timetable',
        description: 'Class schedule'
      }
    ]
  }
}; 