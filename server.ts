import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPortFromArgs(): number {
  const portFlagIdx = process.argv.findIndex((arg) => arg === '--port' || arg.startsWith('--port='));
  if (portFlagIdx !== -1) {
    const arg = process.argv[portFlagIdx];
    const val = arg.includes('=') ? arg.split('=')[1] : process.argv[portFlagIdx + 1];
    const parsed = Number(val);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return Number(process.env.PORT) || 3000;
}

async function startServer() {
  const app = express();
  const port = getPortFromArgs();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Fast health probe so server readiness checks succeed immediately
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      online: true,
      service: 'NeoNova Educational Backend',
      timestamp: new Date().toISOString(),
      version: '2.5.0',
      aiConfigured: true,
      capabilities: ['chat', 'solver', 'practice', '3d_models', 'verification'],
    });
  });

  // Preload heavy backend modules asynchronously so port 3000 binds immediately
  const sqlRouterPromise = import('./src/server/sqlRoutes.ts').then((m) => m.sqlRouter);
  const apiHandlerPromise = import('./src/server/api').then((m) => m.handleApiRoute);

  app.use('/api/sql', async (req, res, next) => {
    try {
      const router = await sqlRouterPromise;
      return router(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  app.all('/api/*', async (req, res) => {
    const handleApiRoute = await apiHandlerPromise;
    const result = await handleApiRoute(req.originalUrl || req.path, req.body);
    res.status(result.status).json(result.data);
  });

  if (!isProd) {
    const vitePromise = import('vite').then(({ createServer }) =>
      createServer({
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
          watch: null,
        },
        appType: 'spa',
      })
    );

    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const vite = await vitePromise;
        const result = await vite.transformRequest('/@vite/client');
        if (result?.code) {
          const patched = result.code.replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '/* HMR WebSocket disabled in preview */'
          );
          res.type('application/javascript').send(patched);
          return;
        }
      } catch {
        // Fall through to Vite middlewares
      }
      next();
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    // Serve static frontend in production
    app.use(express.static(path.join(__dirname, 'dist')));

    // Fallback to index.html for SPA
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NEONOVA server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NEONOVA server:', err);
  process.exit(1);
});
