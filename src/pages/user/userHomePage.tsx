import React, { useMemo, useEffect, useCallback } from 'react';
import { Container, Grid, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { SuperAdminSection } from '../components/auth/SuperAdminSection';
import { logger } from '../../debugConfig';
import { TimetableNeoDBService } from '../../services/graph/timetableNeoDBService';

const UserHomePage = React.memo(() => {
  const { user, userRole, logout } = useAuth();
  const { userNodes, isLoading: isNeo4jLoading } = useNeo4j();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);

  // Memoize computed values to prevent unnecessary re-renders
  const { isAdmin, isTeacher, hasNeo4jSetup } = useMemo(() => ({
    isAdmin: user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL,
    isTeacher: userRole?.includes('teacher'),
    hasNeo4jSetup: !!userNodes?.privateUserNode
  }), [user?.email, userRole, userNodes?.privateUserNode]);

  // Log only once when important values change
  useEffect(() => {
    if (!hasLogged && !isNeo4jLoading) {
      logger.debug('user-page', '🔍 User page loaded', { 
        userId: user?.id,
        role: userRole,
        isAdmin,
        hasNeo4jSetup
      });
      setHasLogged(true);
    }
  }, [user?.id, userRole, isAdmin, hasNeo4jSetup, isNeo4jLoading, hasLogged]);

  const handleTimetableUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const teacherNode = userNodes?.connectedNodes?.teacher;
      if (!teacherNode) {
        setUploadError('Teacher information not found. Please ensure you are logged in as a teacher.');
        return;
      }

      logger.debug('user-page', '📤 Uploading timetable', { 
        teacherCode: teacherNode.teacher_code,
        fileName: event.target.files?.[0]?.name
      });

      const result = await TimetableNeoDBService.handleTimetableUpload(
        event.target.files?.[0],
        teacherNode
      );

      if (result.success) {
        setUploadSuccess(result.message);
        logger.debug('user-page', '✅ Timetable upload successful');
      } else {
        setUploadError(result.message);
        logger.error('user-page', '❌ Timetable upload failed', { error: result.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload timetable';
      setUploadError(errorMessage);
      logger.error('user-page', '❌ Timetable upload failed', { error });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [userNodes?.connectedNodes?.teacher]);

  if (isNeo4jLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome, {user?.displayName}
      </Typography>

      {!hasNeo4jSetup && (
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
            onClick={() => navigate('/morphic')} 
            variant="contained" 
            color="primary"
          >
            Morphic
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/user/calendar')} 
            variant="contained" 
            color="primary"
            disabled={!hasNeo4jSetup}
          >
            Calendar
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/user/tldraw-dev')} 
            variant="contained" 
            color="primary"
          >
            TLDraw Dev
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/user/singleplayer')} 
            variant="contained" 
            color="primary"
          >
            Single Player
          </Button>
        </Grid>

        <Grid item>
          <Button 
            onClick={() => navigate('/user/multiplayer')} 
            variant="contained" 
            color="primary"
          >
            Multiplayer
          </Button>
        </Grid>

        {/* Show Dev Tools for teachers or admins */}
        {(isAdmin || isTeacher) && (
          <Grid item>
            <Button 
              onClick={() => navigate('/dev')} 
              variant="contained" 
              color="primary"
              disabled={!isAdmin && !isTeacher}
            >
              Dev Tools
            </Button>
          </Grid>
        )}

        <Grid item>
          <Button 
            onClick={() => navigate('/user/teacher-planner')}
            variant="contained" 
            color="primary"
            disabled={!isTeacher && !isAdmin}
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

        <Grid item>
          <Button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            variant="contained" 
            color="error"
          >
            Logout
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
});

export default UserHomePage;
