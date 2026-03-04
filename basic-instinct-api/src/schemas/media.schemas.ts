import { z } from 'zod';

// Types de fichiers autorisés
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Tailles max
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export const requestUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((type) => {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(type);
  }, {
    message: 'Type de fichier non supporté. Formats autorisés: JPEG, PNG, WebP, GIF, MP4, WebM, MOV',
  }),
  size: z.number().min(1).max(MAX_VIDEO_SIZE),
  type: z.enum(['image', 'video']),
});

export const confirmUploadSchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z.number().min(1),
  type: z.enum(['image', 'video']),
  folderId: z.string().uuid().optional(),
});

export const createMediaFolderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createGallerySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priceCredits: z.number().min(0).default(0),
  visibility: z.enum(['free', 'subscribers', 'paid']).default('free'),
  coverKey: z.string().min(1).optional(), // R2 key return by presigned URL upload
});
