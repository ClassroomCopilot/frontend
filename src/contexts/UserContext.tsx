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
  isInitialized: boolean;
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
  isInitialized: false,
  error: null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
  clearError: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading, isInitialized: isAuthInitialized } = useAuth();
  const { userNode } = useNeo4j();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth <= 768);

  // Load user profile
  useEffect(() => {
    // Wait for auth to be initialized
    if (!isAuthInitialized || isAuthLoading) {
      logger.debug('user-context', '⏳ Waiting for auth initialization...');
      return;
    }
    
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      setIsInitialized(true);  // Mark as initialized even with no user
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

        // Log raw profile data
        logger.debug('user-context', '📥 Raw user profile data from Supabase', {
          id: data.id,
          email: data.email,
          role: data.user_role,
          neo4j_user_node: data.neo4j_user_node,
          worker_db_name: data.worker_db_name,
          user_db_name: data.user_db_name
        });

        // If we have a neo4j_user_node, inspect its worker_node_data
        if (data.neo4j_user_node?.worker_node_data) {
          try {
            const workerNodeData = JSON.parse(data.neo4j_user_node.worker_node_data);
            logger.debug('user-context', '📥 Parsed worker node data', {
              workerNodeData,
              worker_db_name: workerNodeData.worker_db_name,
              user_db_name: workerNodeData.user_db_name
            });
          } catch (parseError) {
            logger.error('user-context', '❌ Failed to parse worker_node_data', {
              error: parseError,
              raw_data: data.neo4j_user_node.worker_node_data
            });
          }
        } else {
          logger.debug('user-context', 'ℹ️ No worker node data found in neo4j_user_node');
        }

        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          user_role: data.user_role,
          user_db_name: data.user_db_name,
          worker_db_name: data.worker_db_name,
          neo4j_user_node: data.neo4j_user_node,
          created_at: data.created_at,
          updated_at: data.updated_at,
          tldraw_preferences: data.tldraw_preferences
        };

        logger.debug('user-context', '✅ Processed user profile', {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.user_role,
          hasNeo4jNode: !!userProfile.neo4j_user_node,
          worker_db_name: userProfile.worker_db_name,
          user_db_name: userProfile.user_db_name,
          worker_node_data: userProfile.neo4j_user_node?.worker_node_data
        });

        setProfile(userProfile);
        setIsInitialized(true);  // Mark as initialized after successful profile load
        
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
  }, [user, isAuthLoading, isAuthInitialized, userNode]);

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
        isInitialized,
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
