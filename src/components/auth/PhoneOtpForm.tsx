'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { Button } from '@/design/primitives';
import { AuthField, AuthHelp, authLabelCls } from '@/components/auth/AuthUI';

export default function PhoneOtpForm({ callbackUrl }: { callbackUrl: string }) {
  const [phone, setPhone] = useState('+232');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data) ?? 'Failed to send code');
      setSent(true);
      toast.success(`Code sent via ${channel}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await signIn('phone-otp', {
        phone,
        code,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Wrong code or locked. Try resending.');
      } else if (res?.url) {
        window.location.href = res.url;
      } else if (res?.ok) {
        window.location.href = callbackUrl;
      }
    } catch {
      toast.error('Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  const radioCls =
    'flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/75';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <AuthField
          id="phone"
          label="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
          placeholder="+232..."
          disabled={sent}
          inputMode="tel"
        />
        <AuthHelp>E.164 format (e.g. +23230xxxxxxx).</AuthHelp>
      </div>

      {!sent ? (
        <form onSubmit={sendCode} className="flex flex-col gap-5">
          <fieldset className="border-0 p-0 m-0">
            <legend className={authLabelCls}>Send code via</legend>
            <div className="mt-3 flex gap-6">
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={channel === 'whatsapp'}
                  onChange={() => setChannel('whatsapp')}
                  className="accent-[var(--accent)]"
                />
                WhatsApp
              </label>
              <label className={radioCls}>
                <input
                  type="radio"
                  checked={channel === 'sms'}
                  onChange={() => setChannel('sms')}
                  className="accent-[var(--accent)]"
                />
                SMS
              </label>
            </div>
          </fieldset>
          {siteKey ? (
            <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
          ) : (
            <AuthHelp>Bot protection not configured.</AuthHelp>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={busy || phone.length < 8 || (!turnstileToken && !!siteKey)}
            className="w-full disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-5">
          <AuthField
            id="code"
            label="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            maxLength={6}
            className="w-full mt-2 bg-transparent border border-foreground/15 px-4 py-3 text-center text-2xl tracking-[0.5em] num text-foreground hover:border-foreground/30 focus:border-foreground focus:border-2 focus:outline-none transition-soft"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={busy || code.length < 4}
            className="w-full disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode('');
            }}
            className="link-underline text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 self-start"
          >
            Change phone or channel
          </button>
        </form>
      )}
    </div>
  );
}
