import { supabase } from '../../supabaseClient';
import { CCUser, convertToCCUser } from '../../types/auth.types';
import { EmailCredentials } from '../../types/auth/credentials';
import { LoginResponse, SessionResponse } from '../../types/auth/responses';
import { storageService, StorageKeys } from './localStorageService';
import { logger } from '../../debugConfig';

const AUTH_SERVICE = 'auth-service';

class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  onAuthStateChange(callback: (session: SessionResponse) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug(AUTH_SERVICE, 'Auth state changed:', { event, hasSession: !!session });
      
      if (session?.user) {
        callback({
          user: convertToCCUser(session.user),
          accessToken: session.access_token,
          message: `Auth state changed: ${event}`
        });
      } else {
        callback({
          user: null,
          accessToken: null,
          message: `Auth state changed: ${event}`
        });
      }
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getCurrentSession(): Promise<SessionResponse> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) {
        return { user: null, accessToken: null, message: 'No active session' };
      }

      return {
        user: convertToCCUser(session.user),
        accessToken: session.access_token,
        message: 'Session retrieved'
      };
    } catch (error) {
      logger.error(AUTH_SERVICE, 'Failed to get current session:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<CCUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return convertToCCUser(user);
    } catch (error) {
      logger.error(AUTH_SERVICE, 'Failed to get current user:', error);
      return null;
    }
  }

  async login({ email, password, role }: EmailCredentials): Promise<LoginResponse> {
    try {
      logger.debug(AUTH_SERVICE, '🔄 Attempting login', { 
        email,
        role,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error(AUTH_SERVICE, '❌ Supabase auth error', { 
          error: error.message,
          status: error.status
        });
        throw error;
      }

      if (!data.session) {
        logger.error(AUTH_SERVICE, '❌ No session after login');
        throw new Error('No session after login');
      }

      const ccUser = convertToCCUser(data.user);
      
      // Store auth session in storage
      storageService.set(StorageKeys.USER_ROLE, role);
      storageService.set(StorageKeys.USER, ccUser);
      storageService.set(StorageKeys.SUPABASE_TOKEN, data.session.access_token);

      logger.info(AUTH_SERVICE, '✅ Login successful', {
        userId: ccUser.id,
        role,
      });

      return {
        user: ccUser,
        accessToken: data.session.access_token,
        userRole: role,
        message: 'Login successful'
      };
    } catch (error) {
      logger.error(AUTH_SERVICE, '❌ Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all stored data
      storageService.clearAll();
    } catch (error) {
      logger.error(AUTH_SERVICE, 'Logout failed:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();