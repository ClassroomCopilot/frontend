import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { TimetableNeoDBService } from '../../services/graph/timetableNeoDBService';

const SettingsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { userNodes } = useNeo4j();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check if user is a teacher (includes both email and MS teachers)
  const isTeacher = userRole?.includes('teacher');

  const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      const result = await TimetableNeoDBService.handleTimetableUpload(
        event.target.files?.[0],
        userNodes?.privateUserNode,
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* User Info Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Email: {user?.email}
          </Typography>
          <Typography variant="body1">
            Role: {userRole}
          </Typography>
        </Box>
      </Paper>

      {/* Timetable Upload Section - Only visible for teachers */}
      {isTeacher && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Timetable Management
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

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              disabled={isUploading || !userNodes?.connectedNodes?.teacher}
              color="secondary"
              fullWidth
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Upload your timetable in Excel (.xlsx) format
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Additional settings sections can be added here */}
    </Container>
  );
};

export default SettingsPage; 