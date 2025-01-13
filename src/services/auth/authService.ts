import { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { TLUserPreferences } from '@tldraw/tldraw'
import { supabase } from '../../supabaseClient';
import { storageService, StorageKeys } from './localStorageService';
import { StandardizedOneNoteDetails } from './microsoft/oneNoteService';
import { logger } from '../../debugConfig';

export interface CCUser extends SupabaseUser {
  displayName: string;
  user_metadata: CCUserMetadata;
}

interface CCUserMetadata {
  role: UserRole;
  display_name: string;
  tldraw_preferences?: TLUserPreferences;
}

export type UserRole = 'email_teacher' | 'email_student' | 'ms_teacher' | 'ms_student' | 'cc_admin';

// Login response
export interface LoginResponse {
  user: CCUser | null;
  accessToken: string | null;
  userRole: string;
  message: string | null;
}

// Session response
export interface SessionResponse {
  user: CCUser | null;
  accessToken: string | null;
  message: string | null;
}

// Registration response
export interface RegistrationResponse extends LoginResponse {
  user: CCUser;
  accessToken: string | null;
  userRole: UserRole;
  message: string | null;
}

// Microsoft auth response
export interface MicrosoftAuthResponse {
  data: { provider: string; url: string } | null;
  user: CCUser | null;
  accessToken: string | null;
  msAccessToken: string | null;
  userRole: string;
  oneNoteNotebook: StandardizedOneNoteDetails; // TODO: Type this properly once OneNote integration is implemented
  message: string | null;
}

export interface EmailCredentials {
  email: string;
  password: string;
  role: 'email_teacher' | 'email_student';
}

export interface MicrosoftCredentials {
  role: 'ms_teacher' | 'ms_student';
}

export type AuthCredentials = EmailCredentials | MicrosoftCredentials;

export const convertToCCUser = (
  user: SupabaseUser
): CCUser => {
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous User';
  return {
    ...user,
    displayName,
    user_metadata: {
      role: user.user_metadata?.role,
      display_name: displayName,
      tldraw_preferences: user.user_metadata?.tldraw_preferences
    }
  };
};

export const getTldrawPreferences = (user: CCUser): TLUserPreferences => {
  return user.user_metadata?.tldraw_preferences || {
    id: user.id,
    colorScheme: 'system'
  };
};

class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('auth-service', '🔄 Auth state changed', { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id,
        eventType: event
      });

      // Ensure we clear storage on signout
      if (event === 'SIGNED_OUT') {
        storageService.clearAll();
      }

      callback(event, session);
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
      if (error) {
        throw error;
      }

      if (!session) {
        return { user: null, accessToken: null, message: 'No active session' };
      }

      return {
        user: convertToCCUser(session.user),
        accessToken: session.access_token,
        message: 'Session retrieved'
      };
    } catch (error) {
      logger.error('auth-service', 'Failed to get current session:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<CCUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }
      return convertToCCUser(user);
    } catch (error) {
      logger.error('auth-service', 'Failed to get current user:', error);
      return null;
    }
  }

  async login({ email, password, role }: EmailCredentials): Promise<LoginResponse> {
    try {
      logger.debug('auth-service', '🔄 Attempting login', { 
        email,
        role,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('auth-service', '❌ Supabase auth error', { 
          error: error.message,
          status: error.status
        });
        throw error;
      }

      if (!data.session) {
        logger.error('auth-service', '❌ No session after login');
        throw new Error('No session after login');
      }

      const ccUser = convertToCCUser(data.user);
      
      // Store auth session in storage
      storageService.set(StorageKeys.USER_ROLE, role);
      storageService.set(StorageKeys.USER, ccUser);
      storageService.set(StorageKeys.SUPABASE_TOKEN, data.session.access_token);

      logger.info('auth-service', '✅ Login successful', {
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
      logger.error('auth-service', '❌ Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      logger.debug('auth-service', '🔄 Attempting logout');
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        logger.error('auth-service', '❌ Logout failed:', error);
        throw error;
      }
      // Clear all stored data
      storageService.clearAll();
      // Force a refresh of the auth state
      await supabase.auth.refreshSession();
      logger.debug('auth-service', '✅ Logout successful');
    } catch (error) {
      logger.error('auth-service', '❌ Logout failed:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();