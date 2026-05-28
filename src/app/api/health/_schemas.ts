import { z } from 'zod';

// Health endpoint keeps its own response shape (not the standard error envelope)
// because external monitors and dashboards consume it directly and expect this
// contract. Status code 200 means everything's ok, 503 means at least one check
// failed — both share this body.

export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});

export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  checks: z.record(z.string(), HealthCheckSchema),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
