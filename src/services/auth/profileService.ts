import { supabase } from '../../supabaseClient';
import { UserProfile, UserProfileUpdate } from '../../types/supabase/profiles';
import { logger } from '../../debugConfig';

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

// Instance count management
export async function incrementUserInstanceCount(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_instance_count', {
    user_id: userId
  });

  if (error) {
    console.error('Error incrementing instance count:', error);
    throw error;
  }

  return data.instance_count;
}

export async function getUserInstanceCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('instance_count')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching instance count:', error);
    throw error;
  }

  return data?.instance_count || 0;
} 