import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useUser } from './contexts/UserContext';
import { useNeoUser } from './contexts/NeoUserContext';
import { useNeoInstitute } from './contexts/NeoInstituteContext';
import Layout from './pages/Layout';
import LoginPage from './pages/auth/loginPage';
import SignupPage from './pages/auth/signupPage';
import SinglePlayerPage from './pages/tldraw/singlePlayerPage';
import MultiplayerUser from './pages/tldraw/multiplayerUser';
import { CCExamMarker } from './pages/tldraw/CCExamMarker/CCExamMarker';
import CalendarPage from './pages/user/calendarPage';
import SettingsPage from './pages/user/settingsPage';
import TLDrawCanvas from './pages/tldraw/TLDrawCanvas';
import AdminDashboard from './pages/auth/adminPage';
import TLDrawDevPage from './pages/tldraw/devPlayerPage';
import DevPage from './pages/tldraw/devPage';
import TeacherPlanner from './pages/react-flow/teacherPlanner';
import MorphicPage from './pages/morphicPage';
import NotFound from './pages/user/NotFound';
import NotFoundPublic from './pages/NotFoundPublic';
import ShareHandler from './pages/tldraw/ShareHandler';
import SearxngPage from './pages/searxngPage';
import { logger } from './debugConfig';
import { CircularProgress } from '@mui/material';

const AppRoutes: React.FC = () => {
  const { user, isLoading: isAuthLoading, isInitialized: isAuthInitialized } = useAuth();
  const { isLoading: isUserLoading, isInitialized: isUserInitialized } = useUser();
  const { isLoading: isNeoUserLoading, isInitialized: isNeoUserInitialized } = useNeoUser();
  const { isLoading: isNeoInstituteLoading, isInitialized: isNeoInstituteInitialized } = useNeoInstitute();
  const location = useLocation();

  // Debug log for routing
  logger.debug('routing', '🔄 Rendering routes', { 
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    currentPath: location.pathname,
    authStatus: {
      isLoading: isAuthLoading,
      isInitialized: isAuthInitialized
    },
    userStatus: {
      isLoading: isUserLoading,
      isInitialized: isUserInitialized
    },
    neoUserStatus: {
      isLoading: isNeoUserLoading,
      isInitialized: isNeoUserInitialized
    },
    neoInstituteStatus: {
      isLoading: isNeoInstituteLoading,
      isInitialized: isNeoInstituteInitialized
    }
  });

  // Show loading state while initializing
  if (!isAuthInitialized || (user && (!isUserInitialized || !isNeoUserInitialized || !isNeoInstituteInitialized))) {
    return (
      <Layout>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}>
          <CircularProgress />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <SinglePlayerPage /> : <TLDrawCanvas />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/share" element={<ShareHandler />} />

        {/* Super Admin only routes */}
        <Route
          path="/admin"
          element={user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL ? <AdminDashboard /> : null}
        />

        {/* Authentication only routes - only render if all contexts are initialized */}
        {user && isUserInitialized && isNeoUserInitialized && isNeoInstituteInitialized && (
          <>
            <Route path="/search" element={<SearxngPage />} />
            <Route path="/teacher-planner" element={<TeacherPlanner />} />
            <Route path="/exam-marker" element={<CCExamMarker />} />
            <Route path="/morphic" element={<MorphicPage />} />
            <Route path="/tldraw-dev" element={<TLDrawDevPage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="/single-player" element={<SinglePlayerPage />} />
            <Route path="/multiplayer" element={<MultiplayerUser />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </>
        )}

        {/* Fallback route - use different NotFound pages based on auth state */}
        <Route path="*" element={user ? <NotFound /> : <NotFoundPublic />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;