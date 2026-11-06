import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Dev only: forward /api to the Express server so the browser sees one origin
  // (no CORS in development, and cookies behave like production behind a reverse proxy).
  const apiTarget = env.VITE_DEV_API_PROXY_TARGET ?? 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      sourcemap: false,
      target: 'es2022',
    },
  };
});
