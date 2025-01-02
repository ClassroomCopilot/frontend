import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { EmailLoginForm } from './EmailLoginForm';
import { EmailCredentials } from '../../services/auth/authService';
import { logger } from '../../debugConfig';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  logger.debug('login-page', '🔍 Login page loaded', { 
    hasUser: !!user
  });

  useEffect(() => {
    if (user) {
      navigate('/single-player');
    }
  }, [user, navigate]);

  const handleLogin = async (credentials: EmailCredentials) => {
    try {
      const result = await login(credentials);
      if (result.user) {
        navigate('/single-player');
      }
    } catch (error) {
      logger.error('login-page', '❌ Login failed', error);
      throw error;
    }
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
        Login
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <EmailLoginForm 
          role="email_teacher"
          onSubmit={handleLogin}
        />
      </Box>
    </Container>
  );
};

export default LoginPage; 