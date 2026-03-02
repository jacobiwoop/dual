import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------
// Routes de test (Healthcheck)
// ----------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Creator Studio API is running' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', userCount });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Middleware d'erreur global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend Creator Studio en écoute sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api/health`);
});
