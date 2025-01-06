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
} as const;

export const PANEL_STYLES = {
  SPACING: {
    PADDING: {
      DEFAULT: '8px',
      HANDLE: '20px',
      BUTTON: '4px',
    },
    GAP: '4px',
  },
  TYPOGRAPHY: {
    TITLE: {
      SIZE: '14px',
      WEIGHT: 'bold',
    },
    DROPDOWN: {
      SIZE: '12px',
    },
    BUTTON: {
      SIZE: '12px',
    },
  },
  HANDLE: {
    WIDTH: '24px',
    BORDER_RADIUS: '0 4px 4px 0',
  },
  Z_INDEX: {
    HANDLE: 999,
    PANEL: 1000,
  },
} as const;

export const BUTTON_STYLES = {
  SHAPE_BUTTON: {
    padding: '8px 12px',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'var(--color-panel)',
    border: '1px solid var(--color-divider)',
    borderRadius: '4px',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  SHAPE_BUTTON_HOVER: {
    backgroundColor: 'var(--color-hover)',
  },
} as const;

export const SELECT_STYLES = {
  PANEL_TYPE_SELECT: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    padding: '4px 8px',
    paddingRight: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    width: '100%',
  },
  PANEL_TYPE_SELECT_HOVER: {
    backgroundColor: 'var(--color-hover)',
  },
  PANEL_TYPE_OPTION: {
    padding: '4px 8px',
    backgroundColor: 'var(--color-panel)',
    color: 'var(--color-text)',
    fontSize: '12px',
  },
} as const; 