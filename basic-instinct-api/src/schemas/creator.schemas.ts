import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(50).optional(),
    bio: z.string().max(500).optional(),
    username: z.string().min(3).max(20).optional(),
    subscriptionPrice: z.number().min(0).max(999).optional(),
    subscriptionPricePlus: z.number().min(0).max(999).optional(),
    iban: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
    mediaIds: z.array(z.string()).optional(),
    isPaid: z.boolean().optional(),
    price: z.number().min(0).optional(),
  }),
  params: z.object({
    clientId: z.string().uuid(),
  }),
});

export const createFolderSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    coverUrl: z.string().url().optional(),
  }),
});

export const createLibraryItemSchema = z.object({
  body: z.object({
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    type: z.enum(['image', 'video']),
    filename: z.string().optional(),
    sizeBytes: z.number().optional(),
    durationSec: z.number().optional(),
    folderId: z.string().uuid().optional(),
  }),
});
