import { z } from 'zod';
import { MAX_COMMENT_LEN } from '@/lib/enums';

export const CommentParamsSchema = z.object({
  id: z.string().uuid(),
});

// TODO(auth): drop `userId` — once auth lands, the session provides the
// commenter's id and zod stops accepting userId from clients.
export const CreateCommentSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1).max(MAX_COMMENT_LEN),
  turnstileToken: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const CommentAuthorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  submissionId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string(),
  user: CommentAuthorSchema.nullable().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const ListCommentsResponseSchema = z.object({ comments: z.array(CommentSchema) });
export const CreateCommentResponseSchema = z.object({ comment: CommentSchema });
