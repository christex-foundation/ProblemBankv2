'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Phone number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
          placeholder="+232..."
          disabled={sent}
          className="w-full border rounded px-3 py-2 mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">E.164 format (e.g. +23230xxxxxxx).</p>
      </div>

      {!sent ? (
        <form onSubmit={sendCode} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Send code via</label>
            <div className="flex gap-3 mt-1">
              <label className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  checked={channel === 'whatsapp'}
                  onChange={() => setChannel('whatsapp')}
                />
                WhatsApp
              </label>
              <label className="text-sm flex items-center gap-1">
                <input
                  type="radio"
                  checked={channel === 'sms'}
                  onChange={() => setChannel('sms')}
                />
                SMS
              </label>
            </div>
          </div>
          {siteKey ? (
            <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
          ) : (
            <p className="text-xs text-yellow-700">Bot protection not configured.</p>
          )}
          <button
            type="submit"
            disabled={busy || phone.length < 8 || (!turnstileToken && !!siteKey)}
            className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Verification code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              maxLength={6}
              className="w-full border rounded px-3 py-2 mt-1 tracking-widest text-center text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={busy || code.length < 4}
            className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode('');
            }}
            className="text-xs text-gray-500 underline"
          >
            Change phone or channel
          </button>
        </form>
      )}
    </div>
  );
}
