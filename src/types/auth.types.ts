import { User as SupabaseUser } from '@supabase/gotrue-js'
import { TLUserPreferences } from '@tldraw/tldraw'

interface CCUserMetadata {
  role: UserRole;
  tldraw_preferences?: TLUserPreferences;
}

export interface CCUser extends SupabaseUser {
  displayName: string;
  instanceCount?: number;
  user_metadata: CCUserMetadata;
}

export const convertToCCUser = (
  user: SupabaseUser
): CCUser => {
  return {
    ...user,
    displayName: user.user_metadata?.display_name,
    user_metadata: {
      role: user.user_metadata?.role,
      tldraw_preferences: user.user_metadata?.tldraw_preferences
    },
    instanceCount: 0
  };
};

export const getTldrawPreferences = (user: CCUser): TLUserPreferences => {
  return user.user_metadata?.tldraw_preferences || {
    id: user.id,
    colorScheme: 'system'
  };
};

export type UserRole = 'email_teacher' | 'email_student' | 'ms_teacher' | 'ms_student' | 'cc_admin';