import { z } from 'zod';
import { MAX_BIO_LEN } from '@/lib/enums';

export const BuilderParamsSchema = z.object({
  id: z.string().uuid(),
});

// Empty strings are accepted on all optional URL/email fields and coerced to
// null at the DB layer — this matches the existing UI behavior (a cleared
// field clears the row).
const urlOrEmpty = z.string().url().optional().nullable().or(z.literal(''));
const emailOrEmpty = z.string().email().optional().nullable().or(z.literal(''));

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional().nullable(),
  bio: z.string().max(MAX_BIO_LEN).optional().nullable(),
  contactEmail: emailOrEmpty,
  githubUrl: urlOrEmpty,
  websiteUrl: urlOrEmpty,
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  contactEmail: z.string().nullable(),
  githubUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileResponseSchema = z.object({ user: ProfileSchema });
