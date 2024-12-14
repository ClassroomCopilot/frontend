import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { RegistrationService } from '../../services/auth/registrationService';
import { EmailLoginForm } from '../components/auth/EmailLoginForm';
import { EmailSignupForm } from '../components/auth/EmailSignupForm';
import { EmailCredentials } from '../../types/auth/credentials';
import { logger } from '../../debugConfig';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const registrationService = RegistrationService.getInstance();
  // Get role and action from location state
  const { role, action } = location.state || {};
  const isLogin = action === 'login';
  const roleDisplay = role === 'teacher' ? 'Teacher' : 'Student';

  logger.debug('auth-page', '🔍 Auth page loaded', { 
    role,
    action,
    hasUser: !!user
  });

  // Redirect to user page if already logged in
  if (user) {
    navigate('/user');
    return null;
  }

  const handleLogin = async (credentials: EmailCredentials) => {
    try {
      const result = await login(credentials);
      if (result.user) {
        navigate('/user');
      }
    } catch (error) {
      logger.error('auth-page', '❌ Login failed', error);
      throw error; // Let the form handle the error display
    }
  };

  const handleSignup = async (credentials: EmailCredentials, username: string) => {
    try {
      const result = await registrationService.register(credentials, username);
      if (result.user) {
        navigate('/user');
      }
    } catch (error) {
      logger.error('auth-page', '❌ Registration failed', error);
      throw error; // Let the form handle the error display
    }
  };

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
        {roleDisplay} {isLogin ? 'Login' : 'Sign Up'}
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {isLogin ? (
          <EmailLoginForm 
            role={`email_${role}` as 'email_teacher' | 'email_student'}
            onSubmit={handleLogin}
          />
        ) : (
          <EmailSignupForm 
            role={`email_${role}` as 'email_teacher' | 'email_student'}
            onSubmit={handleSignup}
          />
        )}
      </Box>
    </Container>
  );
}

export default AuthPage; 