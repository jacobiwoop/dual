import logger from '../lib/logger';
import { r2Client, R2_BUCKET_NAME } from '../lib/r2';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { queueMediaProcessing, mediaQueue, mediaWorker } from '../lib/queue';

async function testUploadSystem() {
  try {
    logger.info('🧪 Testing Upload & Media Processing System...\n');
    
    // Test 1: Vérifier la connexion R2
    logger.info('1️⃣ Testing R2 connection...');
    try {
      const command = new ListBucketsCommand({});
      const response = await r2Client.send(command);
      logger.info(`✅ R2 connected. Buckets: ${response.Buckets?.map(b => b.Name).join(', ')}`);
    } catch (error: any) {
      logger.error({ error }, '❌ R2 connection failed');
    }
    
    // Test 2: Vérifier la queue BullMQ
    logger.info('\n2️⃣ Testing BullMQ queue...');
    try {
      const counts = await mediaQueue.getJobCounts();
      logger.info({ counts }, '✅ Media queue stats');
    } catch (error: any) {
      logger.error({ error }, '❌ Queue connection failed');
    }
    
    // Test 3: Test d'un job de processing
    logger.info('\n3️⃣ Queuing test media processing job...');
    try {
      const job = await queueMediaProcessing(
        'test-item-' + Date.now(),
        'creators/test/sample.jpg',
        'image',
        'generate-thumbnail'
      );
      logger.info({ jobId: job.id }, '✅ Job queued successfully');
      
      // Attendre un peu pour voir le résultat
      logger.info('⏳ Waiting 5 seconds to see processing...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const finalCounts = await mediaQueue.getJobCounts();
      logger.info({ finalCounts }, '✅ Final queue stats');
    } catch (error: any) {
      logger.error({ error }, '❌ Job queueing failed');
    }
    
    logger.info('\n🎉 Test completed!');
    
    // Cleanup
    await mediaQueue.close();
    await mediaWorker.close();
    process.exit(0);
    
  } catch (error: any) {
    logger.error({ error }, '❌ Test failed');
    process.exit(1);
  }
}

testUploadSystem();
