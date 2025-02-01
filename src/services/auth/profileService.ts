import { TLUserPreferences } from '@tldraw/tldraw';
import { supabase } from '../../supabaseClient';
import { CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { logger } from '../../debugConfig';
import { UserRole } from '../../services/auth/authService';

export interface UserProfile {
  id: string;                    // UUID from auth.users
  email: string;                 // User's email
  display_name: string;   // User's display name
  user_role: UserRole;            // Role (email_teacher, email_student, etc.)
  worker_db_name: string;       // Neo4j database name for worker
  neo4j_user_node: CCUserNodeProps; // Neo4j user node data
  tldraw_preferences: TLUserPreferences;
  created_at: string;           // Timestamp
  updated_at: string;           // Timestamp
}

export interface UserProfileUpdate extends Partial<UserProfile> {
  id: string; // ID is always required for updates
} 

export interface UserPreferences {
  tldraw?: TLUserPreferences;
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
}

export async function createUserProfile(profile: UserProfile): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      logger.error('supabase-profile-service', '❌ Failed to create user profile', { 
        userId: profile.id,
        error 
      });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('supabase-profile-service', '❌ Error in createUserProfile', error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('supabase-profile-service', '❌ Failed to fetch user profile', { 
        userId,
        error 
      });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('supabase-profile-service', '❌ Error in getUserProfile', error);
    return null;
  }
}

export async function updateUserProfile(update: UserProfileUpdate): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(update)
      .eq('id', update.id)
      .select()
      .single();

    if (error) {
      logger.error('supabase-profile-service', '❌ Failed to update user profile', { 
        userId: update.id,
        error 
      });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('supabase-profile-service', '❌ Error in updateUserProfile', error);
    return null;
  }
}
