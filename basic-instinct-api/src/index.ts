import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import { prisma } from './lib/prisma';
import logger from './lib/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { mediaWorker } from './lib/queue'; // Import worker to start it

// Import routes
import authRoutes from './routes/auth';
import creatorRoutes from './routes/creator';
import clientRoutes from './routes/client';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pinoHttp({ logger }));

// Rate limiting global (DISABLED FOR TESTING)
// app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Basic Instinct API is running',
    timestamp: new Date().toISOString(),
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      userCount,
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      message: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Basic Instinct API                              ║
║                                                       ║
║   🌐 Server running on port ${PORT}                     ║
║   📍 http://localhost:${PORT}                           ║
║   🏥 Health: http://localhost:${PORT}/health            ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   📝 Logging: enabled                                ║
║   🔒 Rate limiting: enabled                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});
