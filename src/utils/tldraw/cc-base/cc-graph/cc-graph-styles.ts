// Shared styles for all nodes
export const SHARED_NODE_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px',
    gap: '4px',
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-text)',
    borderRadius: '4px',
    minWidth: '150px',
  },
  header: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    marginBottom: '4px',
    color: 'var(--color-text)',
  },
  property: {
    label: {
      fontSize: '12px',
      color: 'var(--color-text-2)',
      marginRight: '4px',
      fontWeight: '500' as const,
    },
    value: {
      fontSize: '12px',
      color: 'var(--color-text)',
      fontWeight: '200' as const,
    },
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  },
  error: {
    container: {
      padding: '8px',
      backgroundColor: 'var(--color-error)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
    },
    message: {
      fontWeight: 'bold' as const,
    },
    details: {
      marginTop: '4px',
      opacity: 0.8,
    }
  },
  defaultComponent: {
    container: {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px',
    },
    button: {
      padding: '4px 8px',
      fontSize: '12px',
      borderRadius: '4px',
      backgroundColor: 'var(--color-muted-2)',
      color: 'var(--color-text)',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'var(--color-muted-3)',
      }
    }
  }
} as const

// Color themes for different node types
export const NODE_THEMES = {
  calendar: {
    headerColor: '#0066cc',
    backgroundColor: '#e6f0ff',
  },
  academic: {
    headerColor: '#008000',
    backgroundColor: '#e6ffe6',
  },
  curriculum: {
    headerColor: '#ff8c00',
    backgroundColor: '#fff3e6',
  },
  pastoral: {
    headerColor: '#8a2be2',
    backgroundColor: '#f5e6ff',
  },
  people: {
    headerColor: '#cc0000',
    backgroundColor: '#ffe6e6',
  },
  resource: {
    headerColor: '#cccc00',
    backgroundColor: '#fffff0',
  },
} as const

// Node type to theme mapping
export const NODE_TYPE_THEMES: Record<string, keyof typeof NODE_THEMES> = {
  // Calendar nodes
  'cc-calendar-node': 'calendar',
  'cc-calendar-year-node': 'calendar',
  'cc-calendar-month-node': 'calendar',
  'cc-calendar-week-node': 'calendar',
  'cc-calendar-day-node': 'calendar',
  'cc-calendar-time-chunk-node': 'calendar',
  
  // Academic nodes
  'cc-academic-year-node': 'academic',
  'cc-academic-term-node': 'academic',
  'cc-academic-week-node': 'academic',
  'cc-academic-day-node': 'academic',
  'cc-academic-period-node': 'academic',
  'cc-registration-period-node': 'academic',
  'cc-timetable-lesson-node': 'academic',
  'cc-planned-lesson-node': 'academic',
  'cc-school-timetable-node': 'academic',
  'cc-user-teacher-timetable-node': 'academic',
  'cc-user-timetable-lesson-node': 'academic',
  
  // Curriculum nodes
  'cc-curriculum-structure-node': 'curriculum',
  'cc-key-stage-node': 'curriculum',
  'cc-key-stage-syllabus-node': 'curriculum',

  'cc-year-group-syllabus-node': 'curriculum',
  'cc-subject-node': 'curriculum',
  'cc-topic-node': 'curriculum',
  'cc-topic-lesson-node': 'curriculum',
  'cc-learning-statement-node': 'curriculum',
  'cc-science-lab-node': 'curriculum',
  
  // Pastoral nodes
  'cc-pastoral-structure-node': 'pastoral',
  'cc-year-group-node': 'pastoral',
  
  // People nodes
  'cc-user-node': 'people',
  'cc-teacher-node': 'people',
  'cc-student-node': 'people',
  
  // Resource nodes
  'cc-school-node': 'resource',
  'cc-department-node': 'resource',
  'cc-room-node': 'resource',
  'cc-subject-class-node': 'resource',
} as const

// Helper function to get theme for a node type
export const getNodeTheme = (nodeType: string) => {
  const themeKey = NODE_TYPE_THEMES[nodeType]
  return themeKey ? NODE_THEMES[themeKey] : NODE_THEMES.resource // Default to resource theme
}

// Helper function to get theme from primary label
export const getThemeFromLabel = (primaryLabel: string) => {
  // Convert primary label to node type format (e.g., 'User' -> 'cc-user-node')
  const nodeType = `cc-${primaryLabel.toLowerCase()}-node`;
  return getNodeTheme(nodeType);
}

// Helper function to get styles for a specific node type
export const getNodeStyles = (nodeType: string) => {
  const theme = getNodeTheme(nodeType)
  return {
    ...SHARED_NODE_STYLES,
    container: {
      ...SHARED_NODE_STYLES.container,
      backgroundColor: theme.backgroundColor,
    },
  }
} 