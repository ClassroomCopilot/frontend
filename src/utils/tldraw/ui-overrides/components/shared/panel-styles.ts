export const PANEL_DIMENSIONS = {
  'navigation': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'node-snapshot': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'cc-shapes': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'slides': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'youtube': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'graph': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'exam-marker': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
  'search': {
    width: '300px',
    topOffset: `0px`,
    bottomOffset: '0px',
  },
} as const;

// Z-index constants for panel layering
export const Z_INDICES = {
  HANDLE: 999,
  PANEL: 1000,
} as const;