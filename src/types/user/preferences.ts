import { TLUserPreferences } from '@tldraw/tldraw';

export interface UserPreferences {
  tldraw?: TLUserPreferences;
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
}
