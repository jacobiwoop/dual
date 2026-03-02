import dotenv from 'dotenv';
dotenv.config();

import { ListBucketsCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '../lib/r2';
import logger from '../lib/logger';

async function testR2() {
  try {
    logger.info('🧪 Testing Cloudflare R2 connection...');
    
    // Test 1: List buckets
    logger.info('Test 1: Listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const buckets = await r2Client.send(listCommand);
    logger.info(`✅ Buckets found: ${buckets.Buckets?.map(b => b.Name).join(', ')}`);
    
    // Test 2: Upload un fichier de test
    logger.info('Test 2: Uploading test file...');
    const testContent = 'Hello from Basic Instinct API! ' + new Date().toISOString();
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: 'test/hello.txt',
      Body: testContent,
      ContentType: 'text/plain',
    });
    await r2Client.send(uploadCommand);
    logger.info('✅ File uploaded successfully');
    
    // Test 3: Download le fichier
    logger.info('Test 3: Downloading test file...');
    const downloadCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: 'test/hello.txt',
    });
    const response = await r2Client.send(downloadCommand);
    const body = await response.Body?.transformToString();
    logger.info(`✅ File downloaded: ${body}`);
    
    logger.info('🎉 All R2 tests passed!');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ R2 test failed:');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    if (error.$metadata) {
      console.error('Error metadata:', {
        statusCode: error.$metadata.httpStatusCode,
        requestId: error.$metadata.requestId,
      });
    }
    console.error('Full error:', error);
    process.exit(1);
  }
}

testR2();
