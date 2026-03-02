import Redis from 'ioredis';
import logger from './logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Redis client pour usage général (cache, sessions, etc.)
export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (error) => {
  logger.error({ error }, '❌ Redis connection error');
});

redis.on('ready', () => {
  logger.info('🚀 Redis ready');
});

export default redis;
