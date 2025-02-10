import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { 
  Login as LoginIcon,
  Logout as LogoutIcon,
  School as TeacherIcon,
  Person as StudentIcon,
  Dashboard as TLDrawDevIcon,
  Build as DevToolsIcon,
  Groups as MultiplayerIcon,
  CalendarToday as CalendarIcon,
  Assignment as TeacherPlannerIcon,
  AssignmentTurnedIn as ExamMarkerIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { HEADER_HEIGHT } from './Layout';
import { logger } from '../debugConfig';
import { GraphNavigator } from '../components/navigation/GraphNavigator';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const isAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const showGraphNavigation = location.pathname === '/single-player';

  // Update authentication state whenever user changes
  useEffect(() => {
    const newAuthState = !!user;
    setIsAuthenticated(newAuthState);
    logger.debug('user-context', '🔄 User state changed in header', { 
      hasUser: newAuthState,
      userId: user?.id,
      userEmail: user?.email,
      userState: newAuthState ? 'logged-in' : 'logged-out',
      isAdmin
    });
  }, [user, isAdmin]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleSignupNavigation = (role: 'teacher' | 'student') => {
    navigate('/signup', { state: { role } });
    handleMenuClose();
  };

  const handleSignOut = async () => {
    try {
      logger.debug('auth-service', '🔄 Signing out user', { userId: user?.id });
      await logout();
      // Clear local state immediately
      setIsAuthenticated(false);
      setAnchorEl(null);
      logger.debug('auth-service', '✅ User signed out');
    } catch (error) {
      logger.error('auth-service', '❌ Error signing out:', error);
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        height: `${HEADER_HEIGHT}px`,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: 1
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        minHeight: `${HEADER_HEIGHT}px !important`,
        height: `${HEADER_HEIGHT}px`,
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          minWidth: '200px'
        }}>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              cursor: 'pointer',
              color: theme.palette.text.primary,
              '&:hover': {
                color: theme.palette.primary.main
              }
            }}
            onClick={() => navigate(isAuthenticated ? '/single-player' : '/')}
          >
            ClassroomCopilot
          </Typography>
        </Box>

        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center',
          visibility: showGraphNavigation ? 'visible' : 'hidden'
        }}>
          <GraphNavigator />
        </Box>

        <Box sx={{ 
          minWidth: '200px', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            edge="end"
            sx={{ 
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  minWidth: '240px'
                }
              }
            }}
          >
            {isAuthenticated ? [
                // Development Tools Section
                <MenuItem key="tldraw" onClick={() => handleNavigation('/tldraw-dev')}>
                  <ListItemIcon>
                    <TLDrawDevIcon />
                  </ListItemIcon>
                  <ListItemText primary="TLDraw Dev" />
                </MenuItem>,
                <MenuItem key="dev" onClick={() => handleNavigation('/dev')}>
                  <ListItemIcon>
                    <DevToolsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dev Tools" />
                </MenuItem>,
                <Divider key="dev-divider" />,

                // Main Features Section
                <MenuItem key="multiplayer" onClick={() => handleNavigation('/multiplayer')}>
                  <ListItemIcon>
                    <MultiplayerIcon />
                  </ListItemIcon>
                  <ListItemText primary="Multiplayer" />
                </MenuItem>,
                <MenuItem key="calendar" onClick={() => handleNavigation('/calendar')}>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Calendar" />
                </MenuItem>,
                <MenuItem key="planner" onClick={() => handleNavigation('/teacher-planner')}>
                  <ListItemIcon>
                    <TeacherPlannerIcon />
                  </ListItemIcon>
                  <ListItemText primary="Teacher Planner" />
                </MenuItem>,
                <MenuItem key="exam" onClick={() => handleNavigation('/exam-marker')}>
                  <ListItemIcon>
                    <ExamMarkerIcon />
                  </ListItemIcon>
                  <ListItemText primary="Exam Marker" />
                </MenuItem>,
                <Divider key="features-divider" />,

                // Utilities Section
                <MenuItem key="settings" onClick={() => handleNavigation('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>,
                <MenuItem key="search" onClick={() => handleNavigation('/search')}>
                  <ListItemIcon>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="Search" />
                </MenuItem>,

                // Admin Section
                ...(isAdmin ? [
                  <Divider key="admin-divider" />,
                  <MenuItem key="admin" onClick={() => handleNavigation('/admin')}>
                    <ListItemIcon>
                      <AdminIcon />
                    </ListItemIcon>
                    <ListItemText primary="Admin Dashboard" />
                  </MenuItem>
                ] : []),

                // Authentication Section
                <Divider key="auth-divider" />,
                <MenuItem key="signout" onClick={handleSignOut}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </MenuItem>
            ] : [
                // Authentication Section for Non-authenticated Users
                <MenuItem key="signin" onClick={() => handleNavigation('/login')}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign In" />
                </MenuItem>,
                <Divider key="signup-divider" />,
                <MenuItem key="teacher-signup" onClick={() => handleSignupNavigation('teacher')}>
                  <ListItemIcon>
                    <TeacherIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign up as Teacher"
                    secondary="Create a teacher account"
                  />
                </MenuItem>,
                <MenuItem key="student-signup" onClick={() => handleSignupNavigation('student')}>
                  <ListItemIcon>
                    <StudentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign up as Student"
                    secondary="Create a student account"
                  />
                </MenuItem>
            ]}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 