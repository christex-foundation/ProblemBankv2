import { z } from 'zod';
import { MAX_COMMENT_LEN } from '@/lib/enums';

export const CommentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(MAX_COMMENT_LEN),
  turnstileToken: z.string().optional(),
  parentCommentId: z.string().uuid().optional(),
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
  parentCommentId: z.string().uuid().nullable(),
  content: z.string(),
  createdAt: z.string(),
  user: CommentAuthorSchema.nullable().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const ListCommentsResponseSchema = z.object({ comments: z.array(CommentSchema) });
export const CreateCommentResponseSchema = z.object({ comment: CommentSchema });
