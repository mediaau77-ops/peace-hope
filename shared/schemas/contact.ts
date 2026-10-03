import { z } from 'zod';

export const ContactInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;
