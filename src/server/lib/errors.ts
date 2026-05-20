import 'server-only';

export type AuthErrorCode =
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'OAUTH_MISSING_EMAIL'
  | 'TWILIO_NOT_CONFIGURED'
  | 'OTP_LOCKED'
  | 'OTP_INVALID';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function isAuthError(err: unknown): err is AuthError {
  return err instanceof AuthError;
}
