/** Vite's build-time flags (the project's tsconfig does not load `vite/client`). */
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_ACCOUNT_MODE?: string;
  readonly VITE_PARENT_ENABLED?: string;
  readonly VITE_ADMIN_ENABLED?: string;
  readonly VITE_PASSWORD_RECOVERY_ENABLED?: string;
  readonly VITE_ACCOUNT_SIGNUP_REVIEW?: string;
  readonly VITE_GOOGLE_AUTH_REVIEW?: string;
  readonly VITE_GOOGLE_PROOF_REVIEW?: string;
  readonly VITE_CLASSROOM_CODES_ENABLED?: string;
  readonly VITE_AUTH_CALLBACK_ORIGIN?: string;
  readonly VITE_TURNSTILE_REVIEW?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
