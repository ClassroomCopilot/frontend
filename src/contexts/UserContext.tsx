import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNeo4j } from './Neo4jContext';
import { UserProfile, UserPreferences } from '../services/auth/profileService';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { supabase } from '../supabaseClient';
import { logger } from '../debugConfig';

interface UserContextType {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isMobile: boolean;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  preferences: {},
  isMobile: false,
  isLoading: false,
  error: null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
  clearError: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { userNode } = useNeo4j();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth <= 768);

  // Load user profile
  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait for auth to complete
    }
    
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    const loadUserProfile = async () => {
      if (!user?.id) {
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          user_role: data.user_role,
          worker_db_name: data.worker_db_name,
          neo4j_user_node: data.neo4j_user_node,
          created_at: data.created_at,
          updated_at: data.updated_at,
          tldraw_preferences: data.tldraw_preferences
        };

        setProfile(userProfile);
        
        // Load preferences
        setPreferences({
          tldraw: user.user_metadata.tldraw_preferences,
          theme: data.theme || 'system',
          notifications: data.notifications_enabled || false
        });

      } catch (error) {
        logger.error('user-context', '❌ Failed to load user profile', { error });
        setError(error instanceof Error ? error.message : 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user, isAuthLoading, userNode]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      logger.info('user-context', '✅ Profile updated successfully');
    } catch (error) {
      logger.error('user-context', '❌ Failed to update profile', { error });
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    try {
      // Update local state
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Persist to database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update storage
      storageService.set(StorageKeys.USER, {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          tldraw_preferences: newPreferences.tldraw
        }
      });

      logger.info('user-context', '✅ Preferences updated successfully');
    } catch (error) {
      logger.error('user-context', '❌ Failed to update preferences', { error });
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        isMobile,
        isLoading,
        error,
        updateProfile,
        updatePreferences,
        clearError: () => setError(null),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
