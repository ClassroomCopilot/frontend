import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/index';
import { AuthProvider } from './contexts/AuthContext';
import { Neo4jProvider } from './contexts/Neo4jContext';
import { TLDrawProvider } from './contexts/TLDrawContext';
import { UserProvider } from './contexts/UserContext';
import AppRoutes from './AppRoutes';
import { LoadingSpinner } from './pages/components/common/LoadingSpinner';
import { logger } from './debugConfig';

function App() {
  logger.debug('app', '🚀 App initializing');

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <UserProvider>
            <Neo4jProvider>
              <TLDrawProvider>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <AppRoutes />
                </React.Suspense>
              </TLDrawProvider>
            </Neo4jProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;