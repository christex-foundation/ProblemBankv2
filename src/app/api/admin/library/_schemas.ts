import { z } from 'zod';
import { DOC_TYPES } from '@/lib/enums';

const docTypeKeys = DOC_TYPES.map((d) => d.key) as [
  (typeof DOC_TYPES)[number]['key'],
  ...(typeof DOC_TYPES)[number]['key'][],
];

const DocSchema = z.object({
  docType: z.enum(docTypeKeys),
  url: z.string().url(),
  fileName: z.string().min(1).max(200),
});

const optionalUrl = z.string().url().optional().or(z.literal('')).nullable();

// TODO(auth): drop `createdBy` from the body — session provides the admin's id.
const BaseSchema = z.object({
  createdBy: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or dashes'),
  title: z.string().min(1).max(200),
  problemStatement: z.string().min(1),
  sector: z.string().min(1).max(60),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  kitUrl: optionalUrl,
  demoUrl: optionalUrl,
  infographicUrl: optionalUrl,
  linkedSubmissionId: z.string().optional().nullable().or(z.literal('')),
  documents: z.array(DocSchema).optional().default([]),
  publish: z.boolean().default(false),
});

export const CreateLibraryEntrySchema = BaseSchema;
export const UpdateLibraryEntrySchema = BaseSchema.extend({
  id: z.string().uuid(),
});

export type CreateLibraryEntryInput = z.infer<typeof CreateLibraryEntrySchema>;
export type UpdateLibraryEntryInput = z.infer<typeof UpdateLibraryEntrySchema>;
