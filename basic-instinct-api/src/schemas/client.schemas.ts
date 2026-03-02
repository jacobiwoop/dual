import { z } from 'zod';

export const subscribeSchema = z.object({
  body: z.object({
    tier: z.enum(['normal', 'plus']).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const purchaseCreditsSchema = z.object({
  body: z.object({
    amount: z.number().min(10).max(500),
    paymentMethod: z.string().optional(),
  }),
});

export const commentPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const sendClientMessageSchema = z.object({
  body: z.object({
    content: z.string().max(5000).optional(),
    tipAmount: z.number().min(0).optional(),
  }),
  params: z.object({
    creatorId: z.string().uuid(),
  }),
});
