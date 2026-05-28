import { z } from 'zod';

export const BuildRegistryParamsSchema = z.object({
  id: z.string().uuid(), // LibraryEntry id
});

// TODO(auth): drop `userId` once auth lands and session.user.id provides it.
//
// `repoUrl` is permissive: any string up to 300 chars (or empty) goes through.
// The route validates github.com hostnames separately via parseGitHubRepo and
// silently coerces invalid URLs to null — see docs/endpoints/library.md.
export const RegisterSchema = z.object({
  userId: z.string().uuid(),
  repoUrl: z.string().max(300).optional().or(z.literal('')),
});

export const UpdateSchema = z.object({
  userId: z.string().uuid(),
  repoUrl: z.string().max(300).optional().or(z.literal('')),
});

export const DeleteQuerySchema = z.object({
  userId: z.string().uuid(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;

export const BuildRegistrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  libraryEntryId: z.string().uuid(),
  repoUrl: z.string().nullable(),
  registeredAt: z.string(),
});

export type BuildRegistry = z.infer<typeof BuildRegistrySchema>;

export const BuildRegistryResponseSchema = z.object({ record: BuildRegistrySchema });
