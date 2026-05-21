import { z } from 'zod';

export const CloudinarySignSchema = z.object({
  folder: z.string().min(1).max(120).optional(),
});

export type CloudinarySignInput = z.infer<typeof CloudinarySignSchema>;

export const CloudinarySignResponseSchema = z.object({
  signature: z.string(),
  timestamp: z.number().int(),
  cloudName: z.string(),
  apiKey: z.string(),
  folder: z.string(),
});

export type CloudinarySignResponse = z.infer<typeof CloudinarySignResponseSchema>;
