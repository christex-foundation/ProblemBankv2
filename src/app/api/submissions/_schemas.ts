import { z } from 'zod';
import { CATEGORIES, MAX_TITLE_LEN } from '@/lib/enums';

const urgencyEnum = z.enum(['critical', 'high', 'medium', 'low']);
const statusEnum = z.enum([
  'submitted',
  'under_review',
  'research_in_progress',
  'not_viable',
  'live',
]);

// Category accepts either a known SECTORS value or any string (the schema is
// permissive because the DB column is `text`, not an enum). Keep the constant
// in scope so callers can show a typed dropdown.
const categorySchema = z.union([z.enum(CATEGORIES), z.string().min(1).max(60)]);

export const CreateSubmissionSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LEN),
  description: z.string().min(1),
  potentialSolution: z.string().optional(),
  urgency: urgencyEnum,
  category: categorySchema,
  turnstileToken: z.string().optional(),
});

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;

export const ListSubmissionsQuerySchema = z.object({
  sort: z.enum(['votes', 'recent', 'urgency']).default('votes'),
  category: z.string().optional(),
  urgency: urgencyEnum.optional(),
  status: statusEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListSubmissionsQuery = z.infer<typeof ListSubmissionsQuerySchema>;

// Response shapes — exported so the UI can import the inferred type when
// fetching. We avoid importing the DB row directly here so the API contract
// is decoupled from internal column changes.
export const SubmissionAuthorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
});

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  potentialSolution: z.string().nullable(),
  urgency: urgencyEnum,
  category: z.string(),
  status: statusEnum,
  voteCount: z.number().int(),
  commentCount: z.number().int(),
  libraryEntryId: z.string().uuid().nullable(),
  createdAt: z.string(),
  user: SubmissionAuthorSchema.nullable().optional(),
});

export type Submission = z.infer<typeof SubmissionSchema>;

export const CreateSubmissionResponseSchema = z.object({ submission: SubmissionSchema });
export const ListSubmissionsResponseSchema = z.object({ submissions: z.array(SubmissionSchema) });
