import { CCUser } from '../auth.types';
import { UserNodeInterface } from '../neo4j/nodes';
import { TLUserPreferences } from '@tldraw/tldraw';

export interface AuthSession {
  user: CCUser | null;
  userRole: string | null;
  accessToken: string | null;
  msAccessToken: string | null;
  userNode: UserNodeInterface | null;
  tldrawPreferences: TLUserPreferences | null;
}

export interface SessionState extends AuthSession {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}
