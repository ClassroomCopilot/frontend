import React from 'react';
import { Box } from '@mui/material';
import { HEADER_HEIGHT } from './Layout';

const SearxngPage: React.FC = () => {
  return (
    <Box sx={{ 
      position: 'absolute',
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      <iframe
        src={`${import.meta.env.VITE_SITE_URL}/searxng-api/`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="SearXNG Search"
      />
    </Box>
  );
};

export default SearxngPage;
