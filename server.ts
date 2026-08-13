import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Real-world API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date().toISOString(), version: '1.0.0-pro' });
  });

  // Example of a secure market data proxy
  app.get('/api/market/prices', async (req, res) => {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'Missing asset IDs' });
    
    try {
      // In a real pro app, we'd use a paid API like Bloomberg, FactSet, or Polygon.io
      // For this demo, we'll proxy CoinGecko but structure it for scalability
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Market data feed unavailable' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m[FinTech Server]\x1b[0m Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
