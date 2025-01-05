import { CCBaseShape, CCBaseShapeUtil } from './CCBaseShapeUtil'
import { DefaultColorStyle } from '@tldraw/tldraw'
import { T } from '@tldraw/validate'
import { Container, Typography, Paper, Box, Button } from '@mui/material'
import { useAuth } from '../../../contexts/AuthContext'

export interface CCSettingsShape extends CCBaseShape {
  type: 'cc-settings'
  props: CCBaseShape['props'] & {
    userEmail: string
    userRole: string
    isTeacher: boolean
  }
}

export class CCSettingsShapeUtil extends CCBaseShapeUtil<CCSettingsShape> {
  static type = 'cc-settings'
  type = 'cc-settings'

  static props = {
    ...CCBaseShapeUtil.props,
    userEmail: T.string,
    userRole: T.string,
    isTeacher: T.boolean,
  }

  getDefaultProps(): CCSettingsShape['props'] {
    return {
      ...super.getDefaultProps(),
      title: 'User Settings',
      w: 400,
      h: 500,
      headerColor: DefaultColorStyle.defaultValue,
      userEmail: '',
      userRole: '',
      isTeacher: false,
    }
  }

  renderContent = (shape: CCSettingsShape) => {
    // Use AuthContext to show real-time user data
    const { user, userRole: currentRole } = useAuth();
    const currentEmail = user?.email || shape.props.userEmail;
    const currentUserRole = currentRole || shape.props.userRole;
    const isCurrentTeacher = currentRole?.includes('teacher') || shape.props.isTeacher;

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