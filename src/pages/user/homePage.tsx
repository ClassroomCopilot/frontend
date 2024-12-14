import { Container, Grid, Button, Typography, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { SuperAdminSection } from '../components/auth/SuperAdminSection';
import { logger } from '../../debugConfig';

export default function HomePage() {
  const { user, userRole, logout } = useAuth();
  const { userNodes } = useNeo4j();
  const isAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const navigate = useNavigate();

  logger.debug('user-page', '🔍 User page loaded', { 
    userId: user?.id,
    role: userRole,
    isAdmin,
    hasNeo4jSetup: !!userNodes?.privateUserNode
  });

  // Check if user is a teacher (includes both email and MS teachers)
  const isTeacher = userRole?.includes('teacher');

  return (
    <Container 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 4
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome, {user?.displayName}
      </Typography>

      {!userNodes?.privateUserNode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your workspace is being set up. Some features may be limited until setup is complete.
        </Alert>
      )}

      {isAdmin && <SuperAdminSection />}

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button 
            component={Link} 
            to="/calendar" 
            variant="contained" 
            color="primary"
            disabled={!userNodes?.privateUserNode}
          >
            Calendar
          </Button>
        </Grid>

        <Grid item>
          <Button 
            component={Link} 
            to="/single-player" 
            variant="contained" 
            color="primary"
            disabled={!userNodes?.privateUserNode}
          >
            Single Player
          </Button>
        </Grid>

        <Grid item>
          <Button 
            component={Link} 
            to="/multiplayer" 
            variant="contained" 
            color="primary"
            disabled={!userNodes?.privateUserNode}
          >
            Multiplayer
          </Button>
        </Grid>

        {/* Show Dev Tools for teachers or admins */}
        {(isTeacher || isAdmin) && (
          <Grid item>
            <Button 
              component={Link} 
              to="/dev" 
              variant="contained" 
              color="primary"
              disabled={!userNodes?.privateUserNode && !isAdmin}
            >
              Dev Tools
            </Button>
          </Grid>
        )}

        <Grid item>
          <Button 
            onClick={logout} 
            variant="contained" 
            color="error"
          >
            Logout
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/teacher-planner')}
            variant="contained" 
            color="primary"
          >
            Open Teacher Planner (React Flow)
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
