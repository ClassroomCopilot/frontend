import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { logger } from '../../../debugConfig';
import { SchoolNeoDBService } from '../../../services/graph/schoolNeoDBService';

export const SchoolUploadSection = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSchoolUpload = async () => {
        try {
            setIsCreating(true);
            setError(null);
            setSuccess(null);

            const result = await SchoolNeoDBService.createSchools();
            setSuccess(result.message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload school';
            logger.error('admin-page', '❌ School upload failed:', error);
            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Create Schools
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
                onClick={handleSchoolUpload}
                disabled={isCreating}
            >
                {isCreating ? 'Creating...' : 'Create Schools'}
            </Button>
        </Box>
    );
}; 