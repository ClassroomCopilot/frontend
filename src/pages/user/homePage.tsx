import React from 'react';
import { Container, Grid, Button, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { SuperAdminSection } from '../components/auth/SuperAdminSection';
import { logger } from '../../debugConfig';
import { TimetableNeoDBService } from '../../services/graph/timetableNeoDBService';

export default function HomePage() {
  const { user, userRole, logout } = useAuth();
  const { userNodes } = useNeo4j();
  const isAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  logger.debug('user-page', '🔍 User page loaded', { 
    userId: user?.id,
    role: userRole,
    isAdmin,
    hasNeo4jSetup: !!userNodes?.privateUserNode
  });

  // Check if user is a teacher (includes both email and MS teachers)
  const isTeacher = userRole?.includes('teacher');

  const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const result = await TimetableNeoDBService.handleTimetableUpload(
        event.target.files?.[0],
        userNodes?.connectedNodes?.teacher
      );

      if (result.success) {
        setUploadSuccess(result.message);
      } else {
        setUploadError(result.message);
      }
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
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
        Welcome, {user?.displayName}
      </Typography>

      {!userNodes?.privateUserNode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your workspace is being set up. Some features may be limited until setup is complete.
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {uploadSuccess}
        </Alert>
      )}

      {isAdmin && <SuperAdminSection />}

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button 
            onClick={() => navigate('/calendar')} 
            variant="contained" 
            color="primary"
            disabled={!userNodes?.privateUserNode}
          >
            Calendar
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/single-player')} 
            variant="contained" 
            color="primary"
          >
            Single Player
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/multiplayer')} 
            variant="contained" 
            color="primary"
          >
            Multiplayer
          </Button>
        </Grid>

        {/* Show Dev Tools for teachers or admins */}
        {(isAdmin) && (
          <Grid item>
            <Button 
              onClick={() => navigate('/dev')} 
              variant="contained" 
              color="primary"
              disabled={!isAdmin}
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
            disabled={!isTeacher || !isAdmin}
          >
            Open Teacher Planner (React Flow)
          </Button>
        </Grid>

        {isTeacher && (
          <Grid item>
            <Button
              variant="contained"
              component="label"
              disabled={isUploading || !userNodes?.connectedNodes?.teacher}
              color="secondary"
            >
              {isUploading ? 'Uploading...' : 'Upload Timetable'}
              <input
                type="file"
                hidden
                accept=".xlsx"
                onChange={handleTimetableUpload}
                disabled={isUploading}
              />
            </Button>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
