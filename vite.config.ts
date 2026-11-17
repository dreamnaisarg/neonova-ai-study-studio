import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    optimizeDeps: {
      entries: ['index.html'],
    },
    server: {
      // HMR and WS are disabled in AI Studio preview environments to avoid proxy WebSocket errors.
      hmr: false,
      ws: false,
      watch: null,
    },
  };
});
