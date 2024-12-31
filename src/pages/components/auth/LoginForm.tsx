import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { EmailCredentials } from '../../../services/auth/authService';
import { logger } from '../../../debugConfig';

interface LoginFormProps {
  role: 'email_teacher' | 'email_student';
  onSubmit: (credentials: EmailCredentials) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug('login-form', '🔄 Submitting login form', { role });
    await onSubmit({ email, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <TextField
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        autoComplete="new-username"
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <Button type="submit" variant="contained" fullWidth>
        Login
      </Button>
    </form>
  );
}; 