export interface EmailCredentials {
  email: string;
  password: string;
  role: 'email_teacher' | 'email_student';
}

export interface MicrosoftCredentials {
  role: 'ms_teacher' | 'ms_student';
}

export type AuthCredentials = EmailCredentials | MicrosoftCredentials;
