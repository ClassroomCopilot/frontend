import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { EmailSignupForm } from './EmailSignupForm';
import { EmailCredentials } from '../../services/auth/authService';
import { RegistrationService } from '../../services/auth/registrationService';
import { logger } from '../../debugConfig';

const SignupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const registrationService = RegistrationService.getInstance();

  // Get role from location state, default to teacher
  const { role = 'teacher' } = location.state || {};
  const roleDisplay = role === 'teacher' ? 'Teacher' : 'Student';

  logger.debug('signup-page', '🔍 Signup page loaded', { 
    role,
    hasUser: !!user
  });

  useEffect(() => {
    if (user) {
      navigate('/single-player');
    }
  }, [user, navigate]);

  const handleSignup = async (credentials: EmailCredentials, username: string) => {
    try {
      const result = await registrationService.register(credentials, username);
      if (result.user) {
        navigate('/single-player');
      }
    } catch (error) {
      logger.error('signup-page', '❌ Registration failed', error);
      throw error;
    }
  };

  const switchRole = () => {
    navigate('/signup', { state: { role: role === 'teacher' ? 'student' : 'teacher' } });
  };

  if (user) {
    return null;
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
      <Typography variant="h2" component="h1" gutterBottom>
        ClassroomCopilot.ai
      </Typography>

      <Typography variant="h4" gutterBottom>
        {roleDisplay} Sign Up
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <EmailSignupForm 
          role={`email_${role}` as 'email_teacher' | 'email_student'}
          onSubmit={handleSignup}
        />
        
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="text"
            onClick={switchRole}
          >
            Switch to {role === 'teacher' ? 'Student' : 'Teacher'} Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default SignupPage; 