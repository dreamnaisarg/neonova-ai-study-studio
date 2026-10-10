import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRoute } from './src/server/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Router
app.all('/api/*', async (req, res) => {
  const result = await handleApiRoute(req.path, req.body);
  res.status(result.status).json(result.data);
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`NEONOVA server listening on port ${port}`);
});
