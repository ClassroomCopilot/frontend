import { CC_BASE_STYLE_CONSTANTS } from '../cc-styles'

export const CC_YOUTUBE_EMBED_STYLE_CONSTANTS = {
  VIDEO: {
    container: {
      flex: 2,
      padding: '10px',
      minWidth: '300px',
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
  TRANSCRIPT: {
    container: {
      flex: 1,
      padding: '10px',
      overflowY: 'auto',
      maxHeight: '100%',
      minWidth: '200px',
      backgroundColor: '#f5f5f5',
      borderLeft: '1px solid #ddd',
    },
    title: {
      margin: '0 0 10px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
    },
    line: {
      padding: '5px',
      marginBottom: '5px',
      borderRadius: '4px',
      fontSize: '14px',
      color: '#333',
      backgroundColor: '#fff',
      border: '1px solid #eee',
    },
    activeLine: {
      backgroundColor: '#e3f2fd',
      border: '1px solid #2196f3',
      color: '#1565c0',
      fontWeight: 'bold',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      transform: 'scale(1.02)',
      transition: 'all 0.2s ease-in-out',
    },
    timestamp: {
      color: '#666',
      marginRight: '8px',
      fontWeight: 'bold',
    },
    loading: {
      color: '#666',
      fontStyle: 'italic',
    },
  },
  TOOLS: {
    container: {
      padding: '10px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    },
    button: {
      padding: '8px 12px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      color: '#333',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    },
  },
} as const 