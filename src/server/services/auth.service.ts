import 'server-only';

import bcrypt from 'bcryptjs';
import { UserRepository } from '@/server/repositories/user.repository';
import { AuthError } from '@/server/lib/errors';
import { sendOtp as twilioSendOtp, checkOtp as twilioCheckOtp, isTwilioConfigured } from '@/lib/twilio';
import type { UserRow } from '@/types/database';

const BCRYPT_ROUNDS = 10;

// In-memory OTP attempt tracker. 3 wrong attempts → 15-minute lockout per phone.
// Best-effort only; resets on server restart and is per-instance.
const OTP_LOCKOUT_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;
const otpAttempts = new Map<string, { count: number; lockedUntil: number }>();

function recordOtpFailure(phone: string): void {
  const rec = otpAttempts.get(phone) ?? { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= OTP_MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + OTP_LOCKOUT_MS;
    rec.count = 0;
  }
  otpAttempts.set(phone, rec);
}

function isOtpLocked(phone: string): boolean {
  const rec = otpAttempts.get(phone);
  if (!rec) return false;
  if (rec.lockedUntil > Date.now()) return true;
  if (rec.lockedUntil > 0) otpAttempts.delete(phone);
  return false;
}

function clearOtpFailures(phone: string): void {
  otpAttempts.delete(phone);
}

export type OAuthProvider = 'google' | 'github';

export type FindOrCreateOAuthInput = {
  provider: OAuthProvider;
  email: string | null | undefined;
  name?: string | null;
  githubUrl?: string | null;
};

export type RegisterEmailPasswordInput = {
  name?: string | null;
  email: string;
  password: string;
};

export const AuthService = {
  /**
   * Look up an OAuth user by email; create if missing. If the provider is GitHub
   * and the existing row has no githubUrl, backfill it. Returns the user row.
   */
  async findOrCreateOAuthUser(input: FindOrCreateOAuthInput): Promise<UserRow> {
    if (!input.email) {
      throw new AuthError('OAUTH_MISSING_EMAIL', 'OAuth provider did not return an email');
    }

    const existing = await UserRepository.findByEmail(input.email);
    if (!existing) {
      return UserRepository.create({
        email: input.email,
        name: input.name ?? null,
        githubUrl: input.provider === 'github' ? input.githubUrl ?? null : null,
      });
    }

    if (input.provider === 'github' && !existing.githubUrl && input.githubUrl) {
      return UserRepository.update(existing.id, { githubUrl: input.githubUrl });
    }

    return existing;
  },

  /**
   * Register a new email/password user. Throws EMAIL_ALREADY_REGISTERED if the
   * email is already taken.
   */
  async registerEmailPassword(input: RegisterEmailPasswordInput): Promise<UserRow> {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new AuthError('EMAIL_ALREADY_REGISTERED');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    return UserRepository.create({
      email: input.email,
      name: input.name ?? null,
      passwordHash,
    });
  },

  /**
   * Verify email + password. Returns the user row on success, `null` on bad
   * credentials (so this can be used directly from a NextAuth Credentials
   * provider's `authorize`, which expects `null` on failure).
   */
  async verifyEmailPassword(input: { email: string; password: string }): Promise<UserRow | null> {
    const user = await UserRepository.findByEmail(input.email);
    if (!user?.passwordHash) return null;
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    return ok ? user : null;
  },

  /**
   * Send a Twilio Verify OTP. Throws TWILIO_NOT_CONFIGURED if env is missing.
   */
  async sendPhoneOtp(phone: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<void> {
    if (!isTwilioConfigured()) {
      throw new AuthError('TWILIO_NOT_CONFIGURED');
    }
    await twilioSendOtp(phone, channel);
  },

  /**
   * Verify a Twilio OTP and find-or-create the user by phone.
   * Throws OTP_LOCKED, TWILIO_NOT_CONFIGURED, or OTP_INVALID on failure.
   */
  async verifyPhoneOtp(input: { phone: string; code: string }): Promise<UserRow> {
    if (!isTwilioConfigured()) {
      throw new AuthError('TWILIO_NOT_CONFIGURED');
    }
    if (isOtpLocked(input.phone)) {
      throw new AuthError('OTP_LOCKED');
    }

    let approved = false;
    try {
      const result = await twilioCheckOtp(input.phone, input.code);
      approved = result.status === 'approved';
    } catch {
      approved = false;
    }

    if (!approved) {
      recordOtpFailure(input.phone);
      throw new AuthError('OTP_INVALID');
    }

    clearOtpFailures(input.phone);

    const existing = await UserRepository.findByPhone(input.phone);
    if (existing) return existing;
    return UserRepository.create({ phone: input.phone });
  },
};

export type AuthServiceType = typeof AuthService;
