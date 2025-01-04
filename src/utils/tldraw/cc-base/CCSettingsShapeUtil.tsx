import React from 'react'
import { Container, Typography, Paper, Box, Button } from '@mui/material'
import { toDomPrecision } from '@tldraw/tldraw'
import { CCBaseShape, CCBaseShapeUtil } from './CCBaseShapeUtil'
import { useAuth } from '../../../contexts/AuthContext'

export interface CCSettingsShape extends CCBaseShape {
  type: 'cc-settings'
  props: CCBaseShape['props'] & {
    userEmail?: string
    userRole?: string
    isTeacher?: boolean
  }
}

export class CCSettingsShapeUtil extends CCBaseShapeUtil<CCSettingsShape> {
  static type = 'cc-settings'
  type = 'cc-settings'

  getDefaultProps(): CCSettingsShape['props'] {
    return {
      ...super.getDefaultProps(),
      title: 'User Settings',
      w: 400,
      h: 500,
      userEmail: '',
      userRole: '',
      isTeacher: false,
    }
  }

  renderContent = (shape: CCSettingsShape) => {
    const { userEmail, userRole, isTeacher } = shape.props

    // Use AuthContext to show real-time user data
    const { user, userRole: currentRole } = useAuth();
    const currentEmail = user?.email || userEmail;
    const currentUserRole = currentRole || userRole;
    const isCurrentTeacher = currentRole?.includes('teacher') || isTeacher;

    return (
      <Container>
        {/* User Info Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Email: {currentEmail || 'Not set'}
            </Typography>
            <Typography variant="body1">
              Role: {currentUserRole || 'Not set'}
            </Typography>
          </Box>
        </Paper>

        {/* Timetable Upload Section - Only visible for teachers */}
        {isCurrentTeacher && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Timetable Management
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                component="label"
                color="secondary"
                fullWidth
              >
                Upload Timetable
                <input
                  type="file"
                  hidden
                  accept=".xlsx"
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Upload your timetable in Excel (.xlsx) format
              </Typography>
            </Box>
          </Paper>
        )}
      </Container>
    )
  }

  component = (shape: CCSettingsShape) => {
    const {
      props: { w, h, title, color, isLocked },
    } = shape

    const headerStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 32,
      backgroundColor: color,
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: isLocked ? 'not-allowed' : 'move',
    }

    const containerStyle: React.CSSProperties = {
      width: toDomPrecision(w),
      height: toDomPrecision(h),
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      position: 'relative',
    }

    const contentStyle: React.CSSProperties = {
      position: 'absolute',
      top: 32,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      padding: '8px',
    }

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>{title}</span>
          {isLocked && (
            <span style={{ color: 'white' }}>🔒</span>
          )}
        </div>
        <div style={contentStyle}>
          {this.renderContent(shape)}
        </div>
      </div>
    )
  }

  indicator = (shape: CCSettingsShape) => {
    const {
      props: { w, h },
    } = shape
    
    return (
      <rect
        width={toDomPrecision(w)}
        height={toDomPrecision(h)}
        fill="none"
        rx={4}
        ry={4}
      />
    )
  }
} 