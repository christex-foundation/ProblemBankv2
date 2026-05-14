import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { auth } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BodySchema = z.object({
  folder: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET ||
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = BodySchema.safeParse(body);
  const folder = parsed.success && parsed.data.folder ? parsed.data.folder : 'problem-bank/submissions';

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
}
