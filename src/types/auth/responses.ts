import { CCUser } from '../auth.types';
import { UserRole } from '../auth.types';

// Login response
export interface LoginResponse {
  user: CCUser | null;
  accessToken: string | null;
  userRole: string;
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
  oneNoteNotebook: any; // TODO: Type this properly once OneNote integration is implemented
  message: string | null;
}

// Auth error response
export interface AuthErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Session response
export interface SessionResponse {
  user: CCUser | null;
  accessToken: string | null;
  message: string | null;
}

// User preferences response
export interface UserPreferencesResponse {
  preferences: Record<string, any>; // TODO: Type this based on actual preferences structure
  message: string | null;
}
