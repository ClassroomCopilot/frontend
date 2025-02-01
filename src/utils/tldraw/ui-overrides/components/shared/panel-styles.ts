// Panel dimensions for positioning and sizing
export const PANEL_DIMENSIONS = {
  'cc-shapes': {
    width: '150px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'slides': {
    width: '300px',
    topOffset: '10%',
    bottomOffset: '20%',
  },
  'youtube': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'graph': {
    width: '150px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-school-calendar': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-school-timetable': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-school-curriculum': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-teacher-calendar': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-teacher-timetable': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-teacher-curriculum': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-student-calendar': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-student-timetable': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
  'cc-graph-student-curriculum': {
    width: '300px',
    topOffset: '20%',
    bottomOffset: '40%',
  },
} as const;

// Z-index constants for panel layering
export const Z_INDICES = {
  HANDLE: 999,
  PANEL: 1000,
} as const;