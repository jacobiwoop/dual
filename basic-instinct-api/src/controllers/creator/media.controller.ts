import { Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, deleteFromR2, extractR2Key } from '../../lib/r2';
import { prisma } from '../../lib/prisma';
import { queueMediaProcessing } from '../../lib/queue';
import logger from '../../lib/logger';

export const mediaController = {
  // POST /api/creator/media/upload-url
  // Générer une presigned URL pour upload direct vers R2
  async requestUploadUrl(req: Request, res: Response) {
    const { filename, contentType, type, size } = req.body;
    const creatorId = req.user!.userId;

    try {
      // Générer un key unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `uploads/${creatorId}/${timestamp}-${randomString}-${sanitizedFilename}`;

      // Créer la commande S3
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
        Metadata: {
          'uploaded-by': creatorId,
          'upload-timestamp': timestamp.toString(),
        },
      });

      // Générer presigned URL (valide 1 heure)
      const uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 3600,
      });

      logger.info(`Generated presigned URL for ${type}: ${key}`);

      res.json({
        uploadUrl,
        key,
        expiresIn: 3600,
        message: 'Uploadez le fichier vers cette URL avec une requête PUT',
      });
    } catch (error: any) {
      logger.error('Error generating presigned URL:', error);
      res.status(500).json({
        error: 'Erreur lors de la génération de l\'URL d\'upload',
        details: error.message,
      });
    }
  },

  // POST /api/creator/media/confirm
  // Confirmer l'upload et créer l'entrée en base de données
  async confirmUpload(req: Request, res: Response) {
    const { key, filename, contentType, size, type, folderId } = req.body;
    const creatorId = req.user!.userId;

    try {
      // Vérifier que le fichier a bien été uploadé sur R2
      // (optionnel mais recommandé)
      
      // Construire l'URL publique (si bucket public) ou URL de base
      const publicUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
      
      // Créer l'entrée LibraryItem dans la DB
      const item = await prisma.libraryItem.create({
        data: {
          creatorId,
          folderId: folderId || null,
          url: publicUrl, // On stocke l'URL publique complète pour affichage direct
          type,
          filename,
          sizeBytes: BigInt(size),
          // thumbnailUrl sera ajouté après processing
        },
      });

      // Queue le processing asynchrone
      await queueMediaProcessing(
        item.id,
        key,
        type,
        'generate-thumbnail'
      );

      logger.info(`Media confirmed and queued for processing: ${item.id}`);

      res.status(201).json({
        item: {
          ...item,
          sizeBytes: size, // Convertir BigInt en number pour JSON
        },
        message: 'Upload confirmé. Le média est en cours de traitement.',
      });
    } catch (error: any) {
      logger.error('Error confirming upload:', error);
      res.status(500).json({
        error: 'Erreur lors de la confirmation de l\'upload',
        details: error.message,
      });
    }
  },

  // GET /api/creator/media/:id/url
  // Récupérer une URL signée pour accéder à un média privé
  async getMediaUrl(req: Request, res: Response) {
    const { id } = req.params;
    const { expiresIn = 3600 } = req.query;
    const creatorId = req.user!.userId;

    try {
      const item = await prisma.libraryItem.findUnique({
        where: { id: id as string },
      });

      if (!item) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      // Vérifier que le créateur est bien propriétaire
      if (item.creatorId !== creatorId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      // Générer signed URL pour accès temporaire
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: item.url, // item.url contient le key R2
      });

      const signedUrl = await getSignedUrl(r2Client, command, {
        expiresIn: Number(expiresIn),
      });

      res.json({
        url: signedUrl,
        expiresIn: Number(expiresIn),
      });
    } catch (error: any) {
      logger.error('Error generating signed URL:', error);
      res.status(500).json({
        error: 'Erreur lors de la génération de l\'URL',
        details: error.message,
      });
    }
  },

  // DELETE /api/creator/media/:id
  // Supprimer un média (override de library.controller pour gérer R2)
  async deleteMedia(req: Request, res: Response) {
    const { id } = req.params;
    const creatorId = req.user!.userId;

    try {
      const item = await prisma.libraryItem.findUnique({
        where: { id: id as string },
      });

      if (!item) {
        return res.status(404).json({ error: 'Média non trouvé' });
      }

      if (item.creatorId !== creatorId) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      // Vérifier usage dans messages
      const usageCount = await prisma.messageMedia.count({
        where: { libraryItemId: id as string },
      });

      if (usageCount > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer un média utilisé dans des messages',
          usageCount,
        });
      }

      // Supprimer de R2
      const r2Key = extractR2Key(item.url);
      await deleteFromR2(r2Key);

      // Supprimer de la DB
      await prisma.libraryItem.delete({
        where: { id: id as string },
      });

      logger.info(`Media deleted: ${id}`);

      res.json({ success: true, message: 'Média supprimé' });
    } catch (error: any) {
      logger.error('Error deleting media:', error);
      res.status(500).json({
        error: 'Erreur lors de la suppression',
        details: error.message,
      });
    }
  },
};
