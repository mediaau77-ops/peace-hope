import { z } from 'zod';

export const ContentItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('published'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
