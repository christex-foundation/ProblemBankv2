import twilio from 'twilio';

// Lazy-init so the module can be imported in environments without credentials.
let cachedClient: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error('Twilio not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing)');
  }
  cachedClient = twilio(sid, token);
  return cachedClient;
}

function verifyServiceSid() {
  const sid = process.env.TWILIO_VERIFY_SID;
  if (!sid) {
    throw new Error('Twilio Verify SID missing (TWILIO_VERIFY_SID)');
  }
  return sid;
}

export async function sendOtp(phone: string, channel: 'sms' | 'whatsapp') {
  const client = getClient();
  return client.verify.v2
    .services(verifyServiceSid())
    .verifications.create({ to: phone, channel });
}

export async function checkOtp(phone: string, code: string) {
  const client = getClient();
  return client.verify.v2
    .services(verifyServiceSid())
    .verificationChecks.create({ to: phone, code });
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SID,
  );
}
