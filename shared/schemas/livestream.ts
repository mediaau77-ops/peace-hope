import { z } from 'zod';

export const LivestreamStatusSchema = z.enum(['live', 'paused', 'ended']);

export const ChatMessageInputSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  messageType: z.enum(['text', 'verse', 'emoji']).default('text'),
});

export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

export const LivestreamSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: LivestreamStatusSchema,
  isPublic: z.boolean().default(true),
  description: z.string().optional(),
  provider: z.string().optional(),
});
