import redis from '../lib/redis';
import { mediaQueue, queueMediaProcessing } from '../lib/queue';
import logger from '../lib/logger';

async function testRedis() {
  try {
    logger.info('🧪 Testing Redis connection...');
    
    // Test 1: Ping Redis
    const pong = await redis.ping();
    logger.info(`✅ Redis ping: ${pong}`);
    
    // Test 2: Set/Get
    await redis.set('test:key', 'Hello Redis!');
    const value = await redis.get('test:key');
    logger.info(`✅ Redis get: ${value}`);
    
    // Test 3: Queue un job de test
    logger.info('🧪 Testing BullMQ queue...');
    const job = await queueMediaProcessing(
      'test-item-123',
      'uploads/test/image.jpg',
      'image',
      'generate-thumbnail'
    );
    logger.info(`✅ Job queued: ${job.id}`);
    
    // Test 4: Vérifier les stats de la queue
    const counts = await mediaQueue.getJobCounts();
    logger.info({ counts }, '✅ Queue stats');
    
    // Attendre un peu pour voir le worker traiter le job
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Cleanup
    await redis.del('test:key');
    
    logger.info('🎉 All tests passed!');
    
    // Fermer proprement
    await redis.quit();
    await mediaQueue.close();
    process.exit(0);
    
  } catch (error) {
    logger.error({ error }, '❌ Test failed');
    process.exit(1);
  }
}

testRedis();
