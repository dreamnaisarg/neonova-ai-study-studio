import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {handleApiRoute} from './src/server/api.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              let body = {};
              if (req.method === 'POST' || req.method === 'PUT') {
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                }
                const bodyStr = Buffer.concat(chunks).toString('utf-8');
                try {
                  body = JSON.parse(bodyStr);
                } catch {
                  body = {};
                }
              }
              const result = await handleApiRoute(req.url, body);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.status;
              res.end(JSON.stringify(result.data));
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || __dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio preview environments to avoid proxy WebSocket errors.
      hmr: false,
      watch: null,
    },
  };
});
