import { UserNodeInterface } from '../neo4j/nodes';
import { TLUserPreferences } from '@tldraw/tldraw';

export interface UserProfile {
  id: string;                    // UUID from auth.users
  email: string;                 // User's email
  display_name: string | null;   // User's display name
  user_role: string;            // Role (email_teacher, email_student, etc.)
  worker_db_name: string;       // Neo4j database name for worker
  instance_count: number;       // Number of active instances
  one_note_details: any | null; // OneNote integration details (to be typed later)
  neo4j_user_node: UserNodeInterface | null; // Neo4j user node data
  tldraw_preferences: TLUserPreferences | null;
  created_at: string;           // Timestamp
  updated_at: string;           // Timestamp
}

export interface UserProfileUpdate extends Partial<UserProfile> {
  id: string; // ID is always required for updates
} 