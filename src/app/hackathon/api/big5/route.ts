import { NextRequest, NextResponse } from 'next/server';
import { createBig5Submission, listBig5Submissions } from '@/lib/big5';

// In-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 submissions
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const submissions = await listBig5Submissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching Big5 submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      teamName,
      name,
      email,
      phone,
      track,
      ideaTitle,
      teamMembers,
      githubRepo,
      presentationVideo,
      technicalVideo,
      productLogo,
      location,
      productDescription,
      website // honeypot field
    } = body;

    // Honeypot check
    if (website && website.trim()) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!track || (track !== 'AI Pulse' && track !== 'DeepStack')) {
      return NextResponse.json(
        { error: 'Invalid track selection' },
        { status: 400 }
      );
    }

    if (!ideaTitle || !ideaTitle.trim()) {
      return NextResponse.json(
        { error: 'Idea title is required' },
        { status: 400 }
      );
    }

    if (!githubRepo || !githubRepo.trim()) {
      return NextResponse.json(
        { error: 'GitHub repository is required' },
        { status: 400 }
      );
    }

    if (!presentationVideo || !presentationVideo.trim()) {
      return NextResponse.json(
        { error: 'Presentation video is required' },
        { status: 400 }
      );
    }

    if (!technicalVideo || !technicalVideo.trim()) {
      return NextResponse.json(
        { error: 'Technical video is required' },
        { status: 400 }
      );
    }

    if (!productLogo || !productLogo.trim()) {
      return NextResponse.json(
        { error: 'Product logo is required' },
        { status: 400 }
      );
    }

    if (!location || !location.trim()) {
      return NextResponse.json(
        { error: 'Team location is required' },
        { status: 400 }
      );
    }

    if (!productDescription || !productDescription.trim()) {
      return NextResponse.json(
        { error: 'Product description is required' },
        { status: 400 }
      );
    }

    // Create submission
    const result = await createBig5Submission({
      teamName: teamName?.trim() || undefined,
      teamLeadName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      track,
      focusArea: '',
      ideaTitle: ideaTitle.trim(),
      ideaSummary: '',
      teamMembers: teamMembers?.trim() || undefined,
      githubRepo: githubRepo.trim(),
      presentationVideo: presentationVideo.trim(),
      technicalVideo: technicalVideo.trim(),
      productLogo: productLogo.trim(),
      location: location.trim(),
      productDescription: productDescription.trim(),
      clientIp: ip,
    });

    return NextResponse.json({ id: result.id, success: true });

  } catch (error) {
    console.error('Error creating Big5 submission:', error);

    // Provide more specific error information
    let errorMessage = 'Failed to submit application';
    if (error instanceof Error) {
      if (error.message.includes('Missing Airtable credentials')) {
        errorMessage = 'Airtable configuration error. Please check environment variables.';
      } else if (error.message.includes('Airtable API error')) {
        errorMessage = 'Airtable API error. Please check your table configuration.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
