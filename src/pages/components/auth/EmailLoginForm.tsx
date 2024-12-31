import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { EmailCredentials } from '../../../services/auth/authService';
import { logger } from '../../../debugConfig';

interface EmailLoginFormProps {
  role: 'email_teacher' | 'email_student';
  onSubmit: (credentials: EmailCredentials) => Promise<void>;
}

export const EmailLoginForm = React.memo(({ role, onSubmit }: EmailLoginFormProps) => {
  const [formState, setFormState] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug('login-form', '🔄 Submitting login form', { role });
    await onSubmit({ 
      email: formState.email, 
      password: formState.password, 
      role 
    });
  };

  return (
    <div className="login-section">
      <Typography className="login-section-header">Email Login</Typography>
      <form onSubmit={handleSubmit} className="login-form">
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          value={formState.email}
          onChange={handleChange}
          fullWidth
          autoComplete="username"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          value={formState.password}
          onChange={handleChange}
          fullWidth
          autoComplete="current-password"
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
        >
          Login
        </Button>
      </form>
      <Button 
        component={Link} 
        to="/signup" 
        color="info"
        variant="contained"
        state={{ role: role.replace('email_', '') }}
        fullWidth
        sx={{ mt: 2 }}
      >
        Sign up with email
      </Button>
    </div>
  );
}); 