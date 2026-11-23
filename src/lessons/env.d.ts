/** Vite's build-time flags (the project's tsconfig does not load `vite/client`). */
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_PASSWORD_RECOVERY_ENABLED?: string;
  readonly VITE_ACCOUNT_SIGNUP_REVIEW?: string;
  readonly VITE_GOOGLE_AUTH_REVIEW?: string;
  readonly VITE_CLASSROOM_CODES_ENABLED?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
