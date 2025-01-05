import { CSSProperties } from 'react'

export const commonButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '5px',
  padding: '0.4em 1em',
  fontSize: '0.95em',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

export const applicationButtonStyle: CSSProperties = {
  ...commonButtonStyle,
  backgroundColor: '#4f80ff',
  color: '#fff',
}

export const optionButtonStyle: CSSProperties = {
  ...commonButtonStyle,
  backgroundColor: '#f0f4f9',
  color: '#2c3e50',
  border: '1px solid #ddd',
}

export const calendarEventStyle = {
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
    fontWeight: 'normal' as const,
    textAlign: 'center' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    opacity: 1,
    padding: '0px 0px',
    width: '100%',
    letterSpacing: '0.02em',
    margin: '0px 0px',
  }
} 