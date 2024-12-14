/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Information
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_AUTHOR: string

  // Super Admin Email
  readonly VITE_SUPER_ADMIN_EMAIL: string

  // Supabase
  readonly VITE_SUPABASE_PUBLIC_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_REDIRECT_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string

  // Site URL
  readonly VITE_SITE_URL: string

  // Host URLs
  readonly VITE_FASTAPI_HOST: string
  readonly VITE_TLDRAW_HOST: string

  // Ports
  readonly VITE_FASTAPI_PORT: string
  readonly VITE_TLDRAW_PORT: string
  readonly VITE_SEARXNG_PORT: string

  // Firebase Settings
  readonly VITE_REACT_APP_API_KEY: string
  readonly VITE_REACT_APP_AUTH_DOMAIN: string
  readonly VITE_REACT_APP_PROJECT_ID: string
  readonly VITE_REACT_APP_STORAGE_BUCKET: string
  readonly VITE_REACT_APP_MESSAGING_SENDER_ID: string
  readonly VITE_REACT_APP_APP_ID: string

  // Supabase Settings
  readonly VITE_SUPABASE_ANON_KEY: string

  // Microsoft API Settings
  readonly VITE_MICROSOFT_CLIENT_ID: string
  readonly VITE_MICROSOFT_CLIENT_SECRET_DESC: string
  readonly VITE_MICROSOFT_CLIENT_SECRET_ID: string
  readonly VITE_MICROSOFT_CLIENT_SECRET: string
  readonly VITE_MICROSOFT_TENANT_ID: string

  // Local Development Files
  readonly VITE_KCAR_TIMETABLE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
