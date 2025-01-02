import React, { createContext, useContext, useState, useEffect } from 'react';
import { CCUser } from '../services/auth/authService';
import { EmailCredentials } from '../services/auth/authService';
import { LoginResponse } from '../services/auth/authService';
import { authService } from '../services/auth/authService';
import { getUserProfile } from '../services/auth/profileService';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { logger } from '../debugConfig';

interface AuthContextType {
  user: CCUser | null;
  userRole: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: EmailCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isLoading: true,
  error: null,
  login: async () => { throw new Error('Not implemented') },
  logout: async () => { throw new Error('Not implemented') },
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CCUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized) return;
    
    let mounted = true;
    const initializeAuth = async () => {
      try {
        logger.debug('auth-context', '🔄 Initializing auth');
        const session = await authService.getCurrentSession();
        if (!mounted) return;
        
        if (session.user) {
          setUser(session.user);
          const storedRole = storageService.get(StorageKeys.USER_ROLE);
          if (storedRole) {
            setUserRole(storedRole);
          } else {
            const profile = await getUserProfile(session.user.id);
            if (profile?.user_role && mounted) {
              setUserRole(profile.user_role);
              storageService.set(StorageKeys.USER_ROLE, profile.user_role);
            }
          }
        }
      } catch (error) {
        if (!mounted) return;
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';
        logger.error('auth-context', '❌ Auth initialization failed', { error });
        setError(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
          logger.debug('auth-context', '🔄 Auth initialization complete');
        }
      }
    };

    initializeAuth();
    return () => { mounted = false; };
  }, [isInitialized]);

  const login = async (credentials: EmailCredentials): Promise<LoginResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
        setUserRole(response.userRole);
        storageService.set(StorageKeys.USER, response.user);
        storageService.set(StorageKeys.USER_ROLE, response.userRole);
        logger.debug('auth-context', '🔄 User logged in', { user: response.user });
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      setUserRole(null);
      storageService.clearAll();
      logger.debug('auth-context', '🔄 User logged out');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      isLoading,
      error,
      login,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
