import { defineConfig } from 'vite';
export default defineConfig({ root: 'scripts/staging-auth-method', server: { host: '0.0.0.0', allowedHosts: true, port: 5174, strictPort: true }, clearScreen: false });
