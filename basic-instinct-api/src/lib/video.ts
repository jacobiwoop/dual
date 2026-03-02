import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from './r2';
import logger from './logger';

// Dossier temporaire pour le processing vidéo
const TEMP_DIR = path.join(os.tmpdir(), 'basic-instinct-video');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Télécharge un fichier vidéo depuis R2 vers le disque local temporaire.
 * FFmpeg exige un fichier physique pour travailler efficacement.
 */
export async function downloadVideoToLocal(key: string, itemId: string): Promise<string> {
  const localPath = path.join(TEMP_DIR, `${itemId}-${Date.now()}.mp4`);
  
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  
  if (!response.Body) {
    throw new Error('Empty response body from R2');
  }

  // Utilise les streams de Node pour ne pas saturer la RAM (pipeline)
  await pipeline(
    response.Body as NodeJS.ReadableStream,
    fs.createWriteStream(localPath)
  );

  return localPath;
}

/**
 * Nettoie les fichiers temporaires
 */
export function cleanupLocalFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.debug(`Cleaned up temp file: ${filePath}`);
      } catch (err) {
        logger.error({ err }, `Failed to delete temp file ${filePath}`);
      }
    }
  }
}

/**
 * Extrait la première frame d'une vidéo locale comme miniature
 */
export function extractVideoThumbnail(localVideoPath: string, itemId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const thumbFilename = `thumb-${itemId}-${Date.now()}.jpg`;
    const thumbPath = path.join(TEMP_DIR, thumbFilename);

    ffmpeg(localVideoPath)
      .on('end', () => resolve(thumbPath))
      .on('error', (err) => reject(err))
      .screenshots({
        timestamps: ['00:00:01.000'], // Première seconde
        filename: thumbFilename,
        folder: TEMP_DIR,
        size: '400x400',
      });
  });
}

/**
 * Compresse une vidéo locale en différentes résolutions
 * Retourne le chemin local de la vidéo compressée
 */
export function compressVideo(localVideoPath: string, resolution: '720x?' | '480x?', itemId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outFilename = `compressed-${resolution.replace('x?', 'p')}-${itemId}-${Date.now()}.mp4`;
    const outPath = path.join(TEMP_DIR, outFilename);

    // Profil standard pour web: H264 + AAC, faststart pour stream direct
    ffmpeg(localVideoPath)
      .size(resolution)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',           // Bon ratio vitesse/compression
        '-crf 28',                // Qualité (plus bas = meilleur, 28 est bien pour web/mobile)
        '-movflags +faststart',   // Permet la lecture avant la fin du téléchargement
        '-profile:v main',        // Compatibilité maximale
        '-pix_fmt yuv420p'        // Requis pour compatibilité web
      ])
      .on('end', () => resolve(outPath))
      .on('error', (err) => reject(err))
      .save(outPath);
  });
}
