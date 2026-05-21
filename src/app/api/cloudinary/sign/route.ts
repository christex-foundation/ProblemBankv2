import { v2 as cloudinary } from 'cloudinary';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import { CloudinarySignSchema } from './_schemas';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// TODO(auth): require an authenticated session (any role). Without auth the
// endpoint exposes signed upload credentials to anyone — fine in dev, must be
// closed before launch.

export async function POST(req: Request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return apiError(
      API_ERROR_CODES.upload_unconfigured,
      500,
      'Cloudinary credentials are not configured on the server.',
    );
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = parseOrError(CloudinarySignSchema, body);
  if (!parsed.ok) return parsed.response;

  const folder = parsed.data.folder ?? 'problem-bank/submissions';
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return apiOk({ signature, timestamp, cloudName, apiKey, folder });
}
