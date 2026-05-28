import { z } from 'zod';

export const StatusParamsSchema = z.object({
  id: z.string().uuid(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'research_in_progress',
    'not_viable',
    'live',
  ]),
  // Optional. Empty string clears the link. UUID otherwise.
  libraryEntryId: z.string().uuid().or(z.literal('')).optional(),
});

export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
