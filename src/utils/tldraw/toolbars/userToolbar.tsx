import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ReactNode } from 'react';
import { logger } from '../../../debugConfig';

export function UserToolbar({ children }: { children: (props: { handleLogout: () => Promise<void>, handleNavUserHome: () => void }) => ReactNode }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            logger.info('user-toolbar', '🚪 User logged out, navigating to home');
            navigate('/');
        } catch (error) {
            logger.error('user-toolbar', '❌ Logout failed:', error);
        }
    };

    const handleNavUserHome = () => {
        logger.info('user-toolbar', '🏠 Navigating to user page');
        navigate('/user');
    }

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {children({ handleLogout, handleNavUserHome })}
        </div>
    );
}
