import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/index';
import { AuthProvider } from './contexts/AuthContext';
import { Neo4jProvider } from './contexts/Neo4jContext';
import { TLDrawProvider } from './contexts/TLDrawContext';
import { UserProvider } from './contexts/UserContext';
import AppRoutes from './AppRoutes';
import React from 'react';

// Wrap the entire app in a memo to prevent unnecessary re-renders
const App = React.memo(() => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <UserProvider>
          <Neo4jProvider>
            <TLDrawProvider>
              <AppRoutes />
            </TLDrawProvider>
          </Neo4jProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
));

// Add display name for better debugging
App.displayName = import.meta.env.VITE_APP_NAME;

export default App;