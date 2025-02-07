import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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
import { logger } from './debugConfig';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Debug log for routing
  logger.debug('routing', '🔄 Rendering routes', { 
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    currentPath: location.pathname
  });

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<TLDrawCanvas />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/share" element={<ShareHandler />} />

        {/* Super Admin only routes */}
        <Route
          path="/admin"
          element={user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL ? <AdminDashboard /> : null}
        />
        {/* Authentication only routes */}
        <Route
          path="/teacher-planner"
          element={user ? <TeacherPlanner /> : null}
        />
        <Route
          path="/exam-marker"
          element={user ? <CCExamMarker /> : null}
        />
        <Route
          path="/morphic"
          element={user ? <MorphicPage /> : null}
        />
        <Route
          path="/tldraw-dev"
          element={user ? <TLDrawDevPage /> : null}
        />
        <Route
          path="/dev"
          element={user ? <DevPage /> : null}
        />
        <Route
          path="/single-player"
          element={user ? <SinglePlayerPage /> : null}
        />
        <Route
          path="/multiplayer"
          element={user ? <MultiplayerUser /> : null}
        />
        <Route
          path="/calendar"
          element={user ? <CalendarPage /> : null}
        />
        <Route
          path="/settings"
          element={user ? <SettingsPage /> : null}
        />

        {/* Fallback route - use different NotFound pages based on auth state */}
        <Route path="*" element={user ? <NotFound /> : <NotFoundPublic />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;