// Style constants used by all CC shapes
export const CC_BASE_STYLE_CONSTANTS = {
  // Dimensions
  BASE_HEADER_HEIGHT: 32,
  HANDLE_WIDTH: 8,
  CONTENT_PADDING: 8,
  HEADER_PADDING: '4px 8px',
  BORDER_RADIUS: 4,
  
  // Minimum dimensions
  MIN_DIMENSIONS: {
    width: 100,
    height: 100,
  },

  // Container styles
  CONTAINER: {
    borderRadius: '4px',
    boxShadow: '0 2px 4px var(--color-muted-1)',
  },

  // Header styles
  HEADER: {
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },

  // Content styles
  CONTENT: {
    backgroundColor: 'white',
  }
} as const 

// Calendar specific styles
export const CC_CALENDAR_STYLE_CONSTANTS = {
  // Common button styles
  COMMON_BUTTON: {
    border: 'none',
    borderRadius: '5px',
    padding: '0.4em 1em',
    fontSize: '0.95em',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },

  // Application button styles
  APPLICATION_BUTTON: {
    backgroundColor: '#4f80ff',
    color: '#fff',
  },

  // Option button styles
  OPTION_BUTTON: {
    backgroundColor: '#f0f4f9',
    color: '#2c3e50',
    border: '1px solid #ddd',
  },

  // Calendar event styles
  EVENT: {
    mainFrame: {
      backgroundColor: 'transparent',
      padding: '0px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      borderRadius: '4px',
    },
    title: {
      fontSize: '1.1em',
      fontWeight: 'normal',
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      opacity: 1,
      padding: '0px 0px',
      width: '100%',
      letterSpacing: '0.02em',
      margin: '0px 0px',
    }
  }
} as const 