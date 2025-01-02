import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import SitePage from './pages/sitePage';
import AuthPage from './pages/auth/authPage';
import UserHomePage from './pages/user/userHomePage';
import CalendarPage from './pages/user/calendarPage';
import DevPage from './pages/tldraw/devPage';
import TLDrawDevPage from './pages/tldraw/devPlayerPage';
import SinglePlayerPage from './pages/tldraw/singlePlayerPage';
import MultiplayerPage from './pages/tldraw/multiplayerUser';
import AdminPage from './pages/auth/adminPage';
import { logger } from './debugConfig';
import { storageService, StorageKeys } from './services/auth/localStorageService';
import { SUPER_ADMIN_EMAIL } from './config/constants';
import { useNeo4j } from './contexts/Neo4jContext';
import TeacherPlanner from './pages/react-flow/teacherPlanner';
import { Container, CircularProgress } from '@mui/material';

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const storedUser = storageService.get(StorageKeys.USER);

  // Log route changes only when path or auth state changes
  useEffect(() => {
    logger.debug('routes', '🔄 Route change', { 
      path: location.pathname,
      hasUser: !!user,
      hasStoredUser: !!storedUser
    });
  }, [location.pathname, user, storedUser]);

  // Memoize routes to prevent unnecessary re-renders
  const routes = useMemo(() => (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SitePage />} />

      <Route path="/auth" element={
        (user) ? <Navigate to="/user" replace /> : <AuthPage />
      } />

      {/* Protected Routes */}
      <Route path="/user" element={
        <ProtectedRoute>
          <UserHomePage />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireSuperAdmin>
          <AdminPage />
        </ProtectedRoute>
      } />

      <Route path="/user/calendar" element={
        <ProtectedRoute requireNeo4j>
          <CalendarPage />
        </ProtectedRoute>
      } />

      <Route path="/user/tldraw-dev" element={
        <ProtectedRoute>
          <TLDrawDevPage />
        </ProtectedRoute>
      } />

      <Route path="/user/singleplayer" element={
        <ProtectedRoute>
          <SinglePlayerPage />
        </ProtectedRoute>
      } />

      <Route path="/user/multiplayer" element={
        <ProtectedRoute>
          <MultiplayerPage />
        </ProtectedRoute>
      } />

      <Route path="/user/teacher-planner" element={
        <ProtectedRoute>
          <TeacherPlanner />
        </ProtectedRoute>
      } />

      <Route path="/dev" element={
        <ProtectedRoute 
          requiredRoles={['cc_admin', 'email_teacher', 'ms_teacher']}
        >
          <DevPage />
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to site page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  ), [user]); // Only re-render routes when user changes

  return routes;
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRoles?: string[];
  requireSuperAdmin?: boolean;
  requireNeo4j?: boolean;
}> = ({ children, requiredRoles, requireSuperAdmin, requireNeo4j }) => {
  const { user, userRole, isLoading } = useAuth();
  const { userNodes, isLoading: isNeo4jLoading } = useNeo4j();

  // Single loading state for all async operations
  if (isLoading || (requireNeo4j && isNeo4jLoading)) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    logger.error('routes', '🔄 No user - Redirecting to auth page');
    return <Navigate to="/auth" />;
  }

  if (requireNeo4j && !userNodes?.privateUserNode) {
    logger.warn('routes', '🔄 Neo4j privateUserNode required - Redirecting to user home page');
    return <Navigate to="/user" />;
  }

  if (requireSuperAdmin && user.email !== SUPER_ADMIN_EMAIL) {
    logger.warn('routes', '🔄 Not super admin - Redirecting to user page', {
      userEmail: user.email,
      requiredEmail: SUPER_ADMIN_EMAIL
    });
    return <Navigate to="/user" />;
  }

  if (requiredRoles?.length && !requiredRoles.includes(userRole || '')) {
    logger.warn('routes', '🔄 Insufficient role - Redirecting to user page', {
      required: requiredRoles,
      current: userRole
    });
    return <Navigate to="/user" />;
  }

  return <>{children}</>;
};

export default AppRoutes;