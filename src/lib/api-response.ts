// Shared helpers for the API error envelope.
//
// Envelope shape:
//   { error: { code: string, message: string, fields?: Record<string, string> } }
//
// Every route handler under src/app/api uses apiOk / apiError so that consumers
// can rely on a single shape across the whole surface.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiErrorCode } from './api-error-codes';
import { API_ERROR_CODES } from './api-error-codes';

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
};

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function apiError(
  code: ApiErrorCode,
  status: number,
  message: string,
  fields?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  );
}

// Convert a ZodError into the per-field map used by validation_failed responses.
export function zodErrorFields(err: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.');
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return fields;
}

// Parse `input` with a schema and either return the value or short-circuit
// with a 400 validation_failed response. Used at the top of route handlers.
export function parseOrError<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; response: NextResponse<ApiErrorBody> } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    response: apiError(
      API_ERROR_CODES.validation_failed,
      400,
      'Request failed validation.',
      zodErrorFields(result.error),
    ),
  };
}
