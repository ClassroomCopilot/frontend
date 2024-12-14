import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNeo4j } from './Neo4jContext';
import { UserProfile } from '../types/user/profile';
import { UserPreferences } from '../types/user/preferences';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { supabase } from '../supabaseClient';
import { logger } from '../debugConfig';

interface UserContextType {
  profile: UserProfile | null;
  preferences: UserPreferences;
  instanceCount: number;
  isMobile: boolean;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  incrementInstanceCount: () => Promise<number>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  preferences: {},
  instanceCount: 0,
  isMobile: false,
  isLoading: false,
  error: null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
  incrementInstanceCount: async () => 0,
  clearError: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userNode } = useNeo4j();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [instanceCount, setInstanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth <= 768); // Simple mobile detection

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          displayName: data.display_name,
          role: user.user_metadata.role,
          workerDbName: data.worker_db_name,
          instanceCount: data.instance_count,
          neo4jNode: userNode,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setProfile(userProfile);
        setInstanceCount(data.instance_count);
        
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
  }, [user?.id, userNode]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

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
    if (!user?.id) return;

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

      if (error) throw error;

      // Update storage
      storageService.set(StorageKeys.USER, {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          tldraw_preferences: newPreferences
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

  const incrementInstanceCount = async () => {
    if (!user?.id) return 0;

    try {
      const { data, error } = await supabase.rpc('increment_instance_count', {
        user_id: user.id
      });

      if (error) throw error;

      const newCount = data.instance_count;
      setInstanceCount(newCount);
      return newCount;
    } catch (error) {
      logger.error('user-context', '❌ Failed to increment instance count', { error });
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        instanceCount,
        isMobile,
        isLoading,
        error,
        updateProfile,
        updatePreferences,
        incrementInstanceCount,
        clearError: () => setError(null),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
