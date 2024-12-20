import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useNeo4j } from '../../../contexts/Neo4jContext';
import { TimetableNeoDBService } from '../../../services/graph/timetableNeoDBService';

export const TimetableUploadSection = () => {
    const { userNodes } = useNeo4j();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            setError(null);
            setSuccess(null);

            const result = await TimetableNeoDBService.handleTimetableUpload(
                event.target.files?.[0],
                userNodes?.connectedNodes?.teacher
            );

            if (result.success) {
                setSuccess(result.message);
            } else {
                setError(result.message);
            }
        } finally {
            setIsUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Upload Teacher Timetable
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Button
                variant="contained"
                component="label"
                disabled={isUploading || !userNodes?.connectedNodes?.teacher}
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

            {!userNodes?.connectedNodes?.teacher && (
                <Typography color="error" sx={{ mt: 1 }}>
                    No teacher node found. Please ensure you have the correct permissions.
                </Typography>
            )}
        </Box>
    );
}; 