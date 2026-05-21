import { z } from 'zod';

export const GithubActivityQuerySchema = z.object({
  repo: z.string().min(1).max(300),
});

export const GithubActivityResponseSchema = z.object({
  lastPushed: z.string().nullable(),
});

export type GithubActivityResponse = z.infer<typeof GithubActivityResponseSchema>;
