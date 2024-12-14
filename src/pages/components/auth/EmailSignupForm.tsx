import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { EmailCredentials } from '../../../types/auth/credentials';
import { logger } from '../../../debugConfig';

interface EmailSignupFormProps {
  role: string;
  onSubmit: (credentials: EmailCredentials, username: string) => Promise<void>;
}

export const EmailSignupForm: React.FC<EmailSignupFormProps> = ({ role, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setIsSubmitting(true);
      logger.debug('email-signup-form', '🔄 Submitting signup form', { 
        email, 
        username,
        role 
      });

      await onSubmit(
        {
          email,
          password,
          role: role as 'email_teacher' | 'email_student'
        },
        username
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      logger.error('email-signup-form', '❌ Signup error', { error: err });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isSubmitting}
      />
      
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
      />
      
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isSubmitting}
      />
      
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={isSubmitting}
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing up...' : 'Sign Up'}
      </Button>
    </Box>
  );
}; 