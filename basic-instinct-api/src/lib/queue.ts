import { Queue, Worker, QueueEvents } from 'bullmq';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from './r2';
import { prisma } from './prisma';
import logger from './logger';
import { Readable } from 'stream';
import fs from 'fs';
import { downloadVideoToLocal, extractVideoThumbnail, cleanupLocalFiles, compressVideo } from './video';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Configuration de connexion Redis pour BullMQ
const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

// ============================================
// QUEUE: Media Processing
// ============================================
export const mediaQueue = new Queue('media-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Garder les 100 derniers jobs complétés
    },
    removeOnFail: {
      count: 500, // Garder les 500 derniers jobs en erreur
    },
  },
});

// Events de la queue
const mediaQueueEvents = new QueueEvents('media-processing', { connection });

mediaQueueEvents.on('completed', ({ jobId }) => {
  logger.info(`✅ Media processing job ${jobId} completed`);
});

mediaQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`❌ Media processing job ${jobId} failed: ${failedReason}`);
});

// ============================================
// WORKER: Media Processing
// ============================================
export const mediaWorker = new Worker(
  'media-processing',
  async (job) => {
    const { itemId, key, type, action, model = 'LibraryItem' } = job.data;
    
    logger.info({ key, action, type, model }, `Processing ${type} media: ${itemId}`);
    
    try {
      if (action === 'generate-thumbnail') {
        logger.info(`🔧 Calling generateThumbnail for ${itemId} (${model})`);
        await generateThumbnail(itemId, key, type, model);
      } else if (action === 'process-video') {
        logger.info(`🔧 Calling processVideo for ${itemId} (${model})`);
        await processVideo(itemId, key);
      } else if (action === 'generate-variants') {
        logger.info(`🔧 Calling generateImageVariants for ${itemId}`);
        await generateImageVariants(itemId, key);
      } else {
        logger.warn({ action }, `Unknown action: ${action}`);
      }
      
      return { success: true, itemId };
    } catch (error: any) {
      logger.error({ error }, `Error processing media ${itemId}`);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // 5 jobs en parallèle
  }
);

mediaWorker.on('completed', (job) => {
  logger.info(`Worker completed job ${job.id}`);
});

mediaWorker.on('failed', (job, err) => {
  logger.error({ err, jobId: job?.id }, `Worker failed job`);
});

// ============================================
// Helper: Télécharger un fichier depuis R2
// ============================================
async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  const stream = response.Body as Readable;
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// ============================================
// Helper: Upload vers R2
// ============================================
async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  
  const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-xxxxx.r2.dev`;
  return `${publicUrl}/${key}`;
}

// ============================================
// Functions de processing
// ============================================

/**
 * Générer une thumbnail pour une image ou vidéo
 */
async function generateThumbnail(itemId: string, key: string, type: string, model: 'LibraryItem' | 'MediaItem' = 'LibraryItem') {
  logger.info(`Generating thumbnail for ${type}: ${itemId} on ${model}`);
  
  try {
    if (type === 'image') {
      // Télécharger l'image originale
      const imageBuffer = await downloadFromR2(key);
      
      // Générer une thumbnail 400x400
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      // Upload de la thumbnail
      const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb.jpg');
      const thumbnailUrl = await uploadToR2(thumbnailKey, thumbnailBuffer, 'image/jpeg');
      
      // Mettre à jour la DB
      if (model === 'MediaItem') {
        await prisma.mediaItem.update({
          where: { id: itemId },
          data: { thumbnailUrl },
        });
      } else {
        await prisma.libraryItem.update({
          where: { id: itemId },
          data: { thumbnailUrl },
        });
      }
      
      logger.info(`✅ Thumbnail generated for image: ${itemId}`);
    } else if (type === 'video') {
      logger.info(`🎬 Extracting video thumbnail for: ${itemId}`);
      let localVideoPath = '';
      let thumbLocalPath = '';
      
      try {
        // 1. Télécharger la vidéo
        localVideoPath = await downloadVideoToLocal(key, itemId);
        
        // 2. Extraire la miniature
        thumbLocalPath = await extractVideoThumbnail(localVideoPath, itemId);
        
        // 3. Lire le fichier généré
        const thumbBuffer = fs.readFileSync(thumbLocalPath);
        
        // 4. Upload sur R2
        const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb.jpg');
        const thumbnailUrl = await uploadToR2(thumbnailKey, thumbBuffer, 'image/jpeg');
        
        // 5. Update DB
        if (model === 'MediaItem') {
          await prisma.mediaItem.update({
            where: { id: itemId },
            data: { thumbnailUrl },
          });
        } else {
          await prisma.libraryItem.update({
            where: { id: itemId },
            data: { thumbnailUrl },
          });
        }
        logger.info(`✅ Video thumbnail generated for: ${itemId}`);
      } finally {
        // 6. Nettoyage
        cleanupLocalFiles([localVideoPath, thumbLocalPath]);
      }
    }
  } catch (error: any) {
    logger.error(`Error generating thumbnail for ${itemId}:`, error);
    throw error;
  }
}

/**
 * Traiter une vidéo (compression, formats multiples)
 */
async function processVideo(itemId: string, key: string) {
  logger.info(`Processing video: ${itemId}`);
  
  let localVideoPath = '';
  const convertedPaths: string[] = [];
  
  try {
    // 1. Download de R2 vers disque local temp
    logger.info(`📥 Downloading video to temp disk: ${key}`);
    localVideoPath = await downloadVideoToLocal(key, itemId);

    // 2. Compresser en 720p et 480p
    logger.info(`⚙️ Compressing video...`);
    const resolutions = ['720x?', '480x?'] as const;
    const variantsUrls: Record<string, string> = {};

    for (const res of resolutions) {
      logger.info(`   - Format ${res}`);
      const compPath = await compressVideo(localVideoPath, res, itemId);
      convertedPaths.push(compPath);
      
      const compBuffer = fs.readFileSync(compPath);
      const resName = res.replace('x?', 'p'); // 720x? -> 720p
      const outKey = key.replace(/\.[^.]+$/, `_${resName}.mp4`);
      
      const uploadedUrl = await uploadToR2(outKey, compBuffer, 'video/mp4');
      variantsUrls[resName] = uploadedUrl;
    }
    
    // 3. Update DB
    await prisma.libraryItem.update({
      where: { id: itemId },
      data: {
        metadata: JSON.stringify({
          processed: true,
          processedAt: new Date().toISOString(),
          variants: variantsUrls, // Les URLs des résolutions 720p / 480p
        })
      }
    });
    
    logger.info(`✅ Video successfully processed and variants uploaded: ${itemId}`);
  } catch (error: any) {
    logger.error(`❌ Error processing video ${itemId}:`, error);
    throw error;
  } finally {
    // 4. Nettoyage vital
    logger.info(`🧹 Cleaning up temp video files`);
    cleanupLocalFiles([localVideoPath, ...convertedPaths]);
  }
}

/**
 * Générer des variantes d'image (différentes tailles + optimisation)
 */
async function generateImageVariants(itemId: string, key: string) {
  logger.info(`Generating image variants for: ${itemId}`);
  
  try {
    // Télécharger l'image originale
    const imageBuffer = await downloadFromR2(key);
    const image = sharp(imageBuffer);
    
    // Récupérer les métadonnées
    const metadata = await image.metadata();
    logger.info({ 
      width: metadata.width, 
      height: metadata.height, 
      format: metadata.format 
    }, `Image metadata`);
    
    // Générer différentes variantes
    const variants = [
      { name: 'small', width: 640, quality: 80 },
      { name: 'medium', width: 1280, quality: 85 },
      { name: 'large', width: 1920, quality: 90 },
    ];
    
    const variantUrls: Record<string, string> = {};
    
    for (const variant of variants) {
      // Skip si l'image originale est plus petite que la variante
      if (metadata.width && metadata.width < variant.width) {
        logger.info(`Skipping ${variant.name} variant (original is smaller)`);
        continue;
      }
      
      // Générer la variante
      const variantBuffer = await sharp(imageBuffer)
        .resize(variant.width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: variant.quality })
        .toBuffer();
      
      // Upload de la variante
      const variantKey = key.replace(/\.[^.]+$/, `_${variant.name}.jpg`);
      const variantUrl = await uploadToR2(variantKey, variantBuffer, 'image/jpeg');
      
      variantUrls[variant.name] = variantUrl;
      logger.info(`✅ Generated ${variant.name} variant`);
    }
    
    // Mettre à jour la DB avec les URLs des variantes (stocké en JSON)
    await prisma.libraryItem.update({
      where: { id: itemId },
      data: {
        metadata: JSON.stringify({
          variants: variantUrls,
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          format: metadata.format,
        })
      }
    });
    
    logger.info(`✅ Image variants generated for: ${itemId}`);
  } catch (error: any) {
    logger.error(`Error generating image variants for ${itemId}:`, error);
    throw error;
  }
}

// ============================================
// Helper: Ajouter un job à la queue
// ============================================
export async function queueMediaProcessing(
  itemId: string,
  key: string,
  type: 'image' | 'video',
  action: 'generate-thumbnail' | 'process-video' | 'generate-variants' = 'generate-thumbnail',
  model: 'LibraryItem' | 'MediaItem' = 'LibraryItem'
) {
  const job = await mediaQueue.add(
    `${action}-${type}`,
    { itemId, key, type, action, model },
    {
      // Ne pas utiliser jobId fixe pour éviter les conflits avec les anciens jobs
      // jobId: `${itemId}-${action}`,
      priority: type === 'image' ? 1 : 2, // Images prioritaires
    }
  );
  
  logger.info(`Queued media processing job: ${job.id}`);
  return job;
}

// ============================================
// Graceful shutdown
// ============================================
async function gracefulShutdown() {
  logger.info('Closing media queue and worker...');
  await mediaQueue.close();
  await mediaWorker.close();
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default { mediaQueue, mediaWorker, queueMediaProcessing };
