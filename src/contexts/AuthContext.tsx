import React, { createContext, useContext, useState, useEffect } from 'react';
import { CCUser } from '../types/auth.types';
import { EmailCredentials } from '../types/auth/credentials';
import { LoginResponse } from '../types/auth/responses';
import { authService } from '../services/auth/authService';
import { getUserProfile } from '../services/auth/profileService';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { logger } from '../debugConfig';

interface AuthContextType {
  user: CCUser | null;
  userRole: string | null;
  isLoading: boolean;
  login: (credentials: EmailCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isLoading: true,
  login: async () => { throw new Error('Not implemented') },
  logout: async () => { throw new Error('Not implemented') },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CCUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session.user) {
          setUser(session.user);
          const storedRole = storageService.get(StorageKeys.USER_ROLE);
          if (storedRole) {
            setUserRole(storedRole);
          } else {
            const profile = await getUserProfile(session.user.id);
            if (profile?.user_role) {
              setUserRole(profile.user_role);
              storageService.set(StorageKeys.USER_ROLE, profile.user_role);
            }
          }
        }
      } catch (error) {
        logger.error('auth-context', '❌ Auth initialization failed', { error });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: EmailCredentials): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    if (response.user) {
      setUser(response.user);
      setUserRole(response.userRole);
      storageService.set(StorageKeys.USER, response.user);
      storageService.set(StorageKeys.USER_ROLE, response.userRole);
      logger.debug('auth-context', '🔄 User logged in', { user: response.user });
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserRole(null);
    storageService.clearAll();
    logger.debug('auth-context', '🔄 User logged out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
