/** Vite's build-time flags (the project's tsconfig does not load `vite/client`). */
interface ImportMetaEnv {
  readonly DEV: boolean;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
