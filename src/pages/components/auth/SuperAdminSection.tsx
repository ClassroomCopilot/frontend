import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../debugConfig';

export const SuperAdminSection = () => {
    const navigate = useNavigate();

    const handleAdminClick = () => {
        logger.info('super-admin-section', '🔑 Navigating to admin page');
        navigate('/admin');
    };

    return (
        <Button 
            onClick={handleAdminClick}
            variant="contained" 
            color="warning"
            sx={{ mb: 2 }}
        >
            Admin Dashboard
        </Button>
    );
}; 