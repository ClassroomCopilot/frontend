import { Button, Container, Typography, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../debugConfig';
import React, { useEffect, useState } from 'react';

const SitePage = React.memo(() => {
  const { user, isLoading } = useAuth();
  const [hasLogged, setHasLogged] = useState(false);

  // Log only once per auth state change
  useEffect(() => {
    if (!hasLogged) {
      logger.debug('site-page', '🔍 Site page loaded', { 
        hasUser: !!user
      });
      setHasLogged(true);
    }
  }, [user, hasLogged]);

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user) {
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
        <Typography variant="h1" component="h1" gutterBottom>
          ClassroomCopilot.ai
        </Typography>

        <Button 
          component={Link} 
          to="/user" 
          variant="contained" 
          color="primary"
          size="large"
        >
          Go to Dashboard
        </Button>
      </Container>
    );
  }

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
      <Typography variant="h1" component="h1" gutterBottom>
        ClassroomCopilot.ai
      </Typography>

      <Typography variant="h5" gutterBottom align="center" sx={{ maxWidth: '600px', mb: 6 }}>
        An AI-powered platform for teachers and students to collaborate and learn together.
      </Typography>

      <Grid container spacing={4} maxWidth="md" justifyContent="center">
        {/* Teacher Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Teachers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                component={Link} 
                to="/auth"
                state={{ role: 'teacher', action: 'login' }}
                variant="contained" 
                color="primary"
                size="large"
                fullWidth
              >
                Teacher Login
              </Button>
              <Button 
                component={Link} 
                to="/auth"
                state={{ role: 'teacher', action: 'signup' }}
                variant="outlined" 
                color="primary"
                size="large"
                fullWidth
              >
                Teacher Sign Up
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Student Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" color="secondary">
              Students
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                component={Link} 
                to="/auth"
                state={{ role: 'student', action: 'login' }}
                variant="contained" 
                color="secondary"
                size="large"
                fullWidth
              >
                Student Login
              </Button>
              <Button 
                component={Link} 
                to="/auth"
                state={{ role: 'student', action: 'signup' }}
                variant="outlined" 
                color="secondary"
                size="large"
                fullWidth
              >
                Student Sign Up
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
});

export default SitePage; 