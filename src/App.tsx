import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/index';
import { AuthProvider } from './contexts/AuthContext';
import { Neo4jProvider } from './contexts/Neo4jContext';
import { TLDrawProvider } from './contexts/TLDrawContext';
import { UserProvider } from './contexts/UserContext';
import AppRoutes from './AppRoutes';
import { logger } from './debugConfig';

function App() {
  logger.debug('app', '🚀 App initializing');
  return (
    <BrowserRouter>
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
  );
}

export default App;