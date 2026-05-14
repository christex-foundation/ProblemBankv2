// Cloudflare Turnstile server-side token verification.
// Site key lives on the client (NEXT_PUBLIC_TURNSTILE_SITE_KEY); the secret is server-only.

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!token) return false;
  if (!process.env.TURNSTILE_SECRET_KEY) {
    // Dev-mode fallback: when no secret is configured we treat the check as passing so the rest
    // of the app remains usable. Production deployments must set TURNSTILE_SECRET_KEY.
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const form = new URLSearchParams();
  form.append('secret', process.env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
