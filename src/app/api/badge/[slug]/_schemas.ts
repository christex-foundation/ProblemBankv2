import { z } from 'zod';

// The slug is the LibraryEntry.slug — kebab-case, lowercase, numbers and dashes.
export const BadgeParamsSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes.'),
});

export type BadgeParams = z.infer<typeof BadgeParamsSchema>;
