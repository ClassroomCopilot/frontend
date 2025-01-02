import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { logger } from '../debugConfig';

const MorphicPage: React.FC = () => {
  useEffect(() => {
    // Redirect to the nginx-handled /morphic URL
    window.location.href = '/morphic';
    logger.debug('morphic-page', '🔄 Redirecting to Morphic');
  }, []);

  return (
    <Container sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <Typography variant="h5" gutterBottom>
        Redirecting to Morphic...
      </Typography>
      <CircularProgress />
    </Container>
  );
};

export default MorphicPage; 