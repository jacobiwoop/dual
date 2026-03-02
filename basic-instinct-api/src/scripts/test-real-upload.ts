import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, deleteFromR2 } from '../lib/r2';
import { queueMediaProcessing, mediaQueue, mediaWorker } from '../lib/queue';
import logger from '../lib/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRealUpload() {
  try {
    logger.info('🧪 Testing REAL Upload & Processing System...\n');

    // 1. Trouver une image à la racine du projet
    const projectRoot = path.join(__dirname, '..', '..', '..');
    const imageFiles = ['image.jpg', 'image.jpeg', 'image.png'].map(f => path.join(projectRoot, f));
    
    let testImagePath: string | null = null;
    for (const imgPath of imageFiles) {
      if (fs.existsSync(imgPath)) {
        testImagePath = imgPath;
        break;
      }
    }

    if (!testImagePath) {
      logger.error('❌ No test image found at project root. Please add image.jpg, image.jpeg, or image.png');
      process.exit(1);
    }

    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = path.basename(testImagePath);
    const fileExt = path.extname(testImagePath);
    logger.info({ fileName, size: imageBuffer.length }, '✅ Found test image');

    // 2. Upload vers R2
    logger.info('\n📤 Uploading to R2...');
    const testKey = `test-uploads/real-test-${Date.now()}${fileExt}`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: imageBuffer,
      ContentType: `image/${fileExt.replace('.', '')}`,
    });

    await r2Client.send(uploadCommand);
    logger.info({ key: testKey }, '✅ Image uploaded to R2');

    // 3. Vérifier que le fichier existe
    logger.info('\n🔍 Verifying upload...');
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
    });
    
    const getResult = await r2Client.send(getCommand);
    logger.info({ 
      contentType: getResult.ContentType,
      contentLength: getResult.ContentLength 
    }, '✅ File exists in R2');

    // 4. Créer l'item dans la DB (nécessaire pour le processing)
    logger.info('\n💾 Creating LibraryItem in database...');
    const itemId = `test-item-${Date.now()}`;
    
    // On a besoin d'un utilisateur de test - utilisons le premier créateur disponible
    const { prisma } = await import('../lib/prisma');
    let testCreator = await prisma.user.findFirst({
      where: { role: 'CREATOR' }
    });
    
    if (!testCreator) {
      // Créer un utilisateur de test si aucun n'existe
      logger.info('Creating test creator user...');
      testCreator = await prisma.user.create({
        data: {
          email: 'test-creator@example.com',
          passwordHash: 'test-hash',
          role: 'CREATOR',
          displayName: 'Test Creator',
        }
      });
    }
    
    const libraryItem = await prisma.libraryItem.create({
      data: {
        id: itemId,
        creatorId: testCreator.id,
        url: `https://pub-xxxxx.r2.dev/${testKey}`,
        type: 'image',
        filename: fileName,
        sizeBytes: BigInt(imageBuffer.length),
      }
    });
    
    logger.info({ itemId: libraryItem.id }, '✅ LibraryItem created');

    // 5. Queue le processing
    logger.info('\n⚙️ Queuing processing jobs...');
    
    await queueMediaProcessing(itemId, testKey, 'image', 'generate-thumbnail');
    await queueMediaProcessing(itemId, testKey, 'image', 'generate-variants');
    
    logger.info('✅ Jobs queued');

    // 6. Attendre le processing
    logger.info('\n⏳ Waiting 10 seconds for processing...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 7. Vérifier les stats de la queue
    const counts = await mediaQueue.getJobCounts();
    logger.info({ counts }, '✅ Queue stats after processing');

    // 8. Vérifier que les variantes ont été créées
    logger.info('\n🔍 Checking for generated variants...');
    const variants = ['_thumb.jpg', '_small.jpg', '_medium.jpg', '_large.jpg'];
    
    for (const variant of variants) {
      const variantKey = testKey.replace(/\.[^.]+$/, variant);
      try {
        const checkCmd = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: variantKey,
        });
        const result = await r2Client.send(checkCmd);
        logger.info({ 
          variant: variantKey, 
          size: result.ContentLength 
        }, '✅ Variant found');
      } catch (error: any) {
        if (error.name === 'NoSuchKey') {
          logger.warn({ variant: variantKey }, '⚠️  Variant not found');
        } else {
          throw error;
        }
      }
    }

    // 9. Vérifier les métadonnées en DB
    logger.info('\n📊 Checking database metadata...');
    const updatedItem = await prisma.libraryItem.findUnique({
      where: { id: itemId }
    });
    
    if (updatedItem) {
      logger.info({
        thumbnailUrl: updatedItem.thumbnailUrl,
        metadata: updatedItem.metadata ? JSON.parse(updatedItem.metadata) : null
      }, '✅ LibraryItem metadata');
    }

    // 10. Cleanup - Supprimer les fichiers de test
    logger.info('\n🧹 Cleaning up test files...');
    const allKeys = [testKey, ...variants.map(v => testKey.replace(/\.[^.]+$/, v))];
    
    for (const key of allKeys) {
      try {
        await deleteFromR2(key);
      } catch (error: any) {
        if (error.name !== 'NoSuchKey') {
          logger.warn({ key, error: error.message }, 'Failed to delete');
        }
      }
    }

    logger.info('✅ Cleanup complete');
    
    // Supprimer l'item de test de la DB
    await prisma.libraryItem.delete({ where: { id: itemId } });
    logger.info('✅ LibraryItem deleted from DB');

    logger.info('\n🎉 Real upload test completed successfully!');

    // Fermer proprement
    await mediaQueue.close();
    await mediaWorker.close();
    process.exit(0);

  } catch (error: any) {
    logger.error({ error }, '❌ Test failed');
    await mediaQueue.close();
    await mediaWorker.close();
    process.exit(1);
  }
}

testRealUpload();
