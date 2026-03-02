import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import logger from './logger';

// Charger les credentials depuis les variables d'environnement
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
  logger.warn('⚠️  Cloudflare R2 credentials missing. Upload features will not work.');
  logger.warn('Please set: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT');
}

// Client S3 pour Cloudflare R2
// Note: Cloudflare R2 est compatible S3 mais nécessite forcePathStyle
export const r2Client = new S3Client({
  region: 'us-east-1', // Region bidon (R2 n'utilise pas de région)
  endpoint: R2_ENDPOINT || '',
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Important pour R2
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'basic-instinct-media';

if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  logger.info('✅ Cloudflare R2 client configured');
}

/**
 * Supprimer un fichier de R2
 * @param key - Clé du fichier dans le bucket (ex: "creators/123/image.jpg")
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    logger.info(`✅ Deleted from R2: ${key}`);
  } catch (error: any) {
    logger.error(`❌ Error deleting from R2: ${key}`, error);
    throw new Error(`Failed to delete file from R2: ${error.message}`);
  }
}

/**
 * Supprimer plusieurs fichiers de R2 en une seule opération
 * @param keys - Tableau de clés à supprimer
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  try {
    const command = new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    const result = await r2Client.send(command);
    
    if (result.Deleted && result.Deleted.length > 0) {
      logger.info(`✅ Deleted ${result.Deleted.length} files from R2`);
    }
    
    if (result.Errors && result.Errors.length > 0) {
      logger.error({ errors: result.Errors }, `❌ Failed to delete ${result.Errors.length} files from R2`);
      throw new Error(`Failed to delete some files from R2`);
    }
  } catch (error: any) {
    logger.error(`❌ Error deleting multiple files from R2`, error);
    throw new Error(`Failed to delete files from R2: ${error.message}`);
  }
}

/**
 * Extraire la clé R2 depuis une URL
 * @param url - URL complète du fichier (ex: "https://pub-xxx.r2.dev/creators/123/image.jpg")
 * @returns La clé (ex: "creators/123/image.jpg")
 */
export function extractR2Key(url: string): string {
  try {
    const urlObj = new URL(url);
    // Retirer le premier "/" du pathname
    return urlObj.pathname.substring(1);
  } catch (error) {
    // Si ce n'est pas une URL valide, retourner tel quel
    return url;
  }
}

export default r2Client;
