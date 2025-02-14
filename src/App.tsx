import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './services/themeService';
import { AuthProvider } from './contexts/AuthContext';
import { TLDrawProvider } from './contexts/TLDrawContext';
import { UserProvider } from './contexts/UserContext';
import { NeoUserProvider } from './contexts/NeoUserContext';
import { NeoInstituteProvider } from './contexts/NeoInstituteContext';
import AppRoutes from './AppRoutes';
import React from 'react';

// Wrap the entire app in a memo to prevent unnecessary re-renders
const App = React.memo(() => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <UserProvider>
          <NeoUserProvider>
            <NeoInstituteProvider>
              <TLDrawProvider>
                <AppRoutes />
              </TLDrawProvider>
            </NeoInstituteProvider>
          </NeoUserProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
));

// Add display name for better debugging
App.displayName = import.meta.env.VITE_APP_NAME;

export default App;