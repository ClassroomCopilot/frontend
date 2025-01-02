import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { logger } from '../debugConfig';

function NotFoundPublic() {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleReturn = () => {
        logger.debug('not-found', '🔄 Public user navigating to home');
        navigate('/');
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                    gap: 3
                }}
            >
                <ErrorOutlineIcon sx={{ fontSize: 60, color: theme.palette.error.main }} />
                <Typography variant="h2" component="h1" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    The page you're looking for doesn't exist or has been moved.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleReturn}
                >
                    Return to Canvas
                </Button>
            </Box>
        </Container>
    );
}

export default NotFoundPublic; 