import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  Divider,
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { HEADER_HEIGHT } from './Layout';
import { logger } from '../debugConfig';
import { GraphNavigator } from '../components/navigation/GraphNavigator';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signupAnchorEl, setSignupAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleSignupMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSignupAnchorEl(event.currentTarget);
  };

  const handleSignupMenuClose = () => {
    setSignupAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleSignupNavigation = (role: 'teacher' | 'student') => {
    navigate('/signup', { state: { role } });
    handleSignupMenuClose();
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

  // Debug log for rendering
  logger.debug('user-context', '🔄 Header rendering', {
    hasUser: !!user,
    isAuthenticated,
    userId: user?.id,
    userEmail: user?.email,
    showingSignOut: isAuthenticated,
    showingSignIn: !isAuthenticated,
    isAdmin
  });

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
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            edge="start"
            sx={{ 
              display: isAuthenticated ? 'flex' : 'none',
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            <MenuIcon />
          </IconButton>
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
          {isAuthenticated && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary
                  }
                }
              }}
            >
              <MenuItem onClick={() => handleNavigation('/tldraw-dev')}>
                TLDraw Dev
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/dev')}>
                Dev Tools
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/multiplayer')}>
                Multiplayer
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/calendar')}>
                Calendar
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/teacher-planner')}>
                Teacher Planner
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/exam-marker')}>
                Exam Marker
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/settings')}>
                Settings
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/search')}>
                Search
              </MenuItem>
              {/* Admin-only menu items */}
              {isAdmin && [
                <Divider key="admin-divider" />,
                <MenuItem key="admin-dashboard" onClick={() => handleNavigation('/admin')}>
                  Admin Dashboard
                </MenuItem>
              ]}
            </Menu>
          )}
          {isAuthenticated ? (
            <Button 
              variant="outlined"
              color="error"
              onClick={handleSignOut}
              sx={{ 
                width: '100%',
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText
                }
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <Button 
                variant="outlined"
                sx={{ 
                  flex: 1,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  }
                }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  flex: 1,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
                onClick={handleSignupMenuOpen}
              >
                Sign Up
              </Button>
              <Menu
                anchorEl={signupAnchorEl}
                open={Boolean(signupAnchorEl)}
                onClose={handleSignupMenuClose}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary
                    }
                  }
                }}
              >
                <MenuItem onClick={() => handleSignupNavigation('teacher')}>
                  Sign up as Teacher
                </MenuItem>
                <MenuItem onClick={() => handleSignupNavigation('student')}>
                  Sign up as Student
                </MenuItem>
              </Menu>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 