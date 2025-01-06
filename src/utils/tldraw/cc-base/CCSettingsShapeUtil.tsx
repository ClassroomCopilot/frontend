import { CCBaseShape, CCBaseShapeUtil } from './CCBaseShapeUtil'
import { ccShapeProps, getDefaultCCSettingsProps } from './cc-props'
import { ccShapeMigrations } from './cc-migrations'
import { Container, Typography, Paper, Box, Button } from '@mui/material'
import { useAuth } from '../../../contexts/AuthContext'

export interface CCSettingsShape extends CCBaseShape {
  type: 'cc-settings'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    userEmail: string
    userRole: string
    isTeacher: boolean
  }
}

export class CCSettingsShapeUtil extends CCBaseShapeUtil<CCSettingsShape> {
  static override type = 'cc-settings' as const
  static override props = ccShapeProps.settings
  static override migrations = ccShapeMigrations.settings

  override getDefaultProps(): CCSettingsShape['props'] {
    return getDefaultCCSettingsProps() as CCSettingsShape['props']
  }

  override renderContent = () => {
    // Use AuthContext to show real-time user data
    const { user, userRole: currentRole } = useAuth()
    const currentEmail = user?.email || ''
    const currentUserRole = currentRole || ''
    const isCurrentTeacher = currentRole?.includes('teacher') || false

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
} 