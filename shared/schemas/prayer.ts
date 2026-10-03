import { z } from 'zod';

export const PrayerAmenSchema = z.object({
  id: z.string().min(1, 'Prayer id is required'),
});

export const PrayerRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  name: z.string().optional(),
  isPrivate: z.boolean().default(false),
});
