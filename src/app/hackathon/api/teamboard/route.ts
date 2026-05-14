import { NextRequest, NextResponse } from 'next/server';
import { listTeamProfiles, createTeamProfile, deleteTeamProfile, getTeamProfile, normalizeTwitterHandle, validateLinkedInUrl } from '@/lib/teamboard';

// In-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fixed: Removed invalid request.ip property access
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
    const ip = getClientIP(request);
    const profiles = await listTeamProfiles();
    
    // Enrich profiles with isMine flag and sort mine-first
    const enriched = profiles.map(p => ({
      ...p,
      isMine: p.clientIp === ip
    }));
    
    const sorted = enriched.sort((a, b) => Number(b.isMine) - Number(a.isMine));
    
    return NextResponse.json({ profiles: sorted });
  } catch (error) {
    console.error('Error fetching team profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { twitter, linkedin, skills, repos, website } = body;
    
    // Honeypot check
    if (website && website.trim()) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!twitter || !twitter.trim()) {
      return NextResponse.json(
        { error: 'Twitter handle is required' },
        { status: 400 }
      );
    }
    
    // Normalize Twitter handle
    const { handle, url: twitterUrl } = normalizeTwitterHandle(twitter);
    
    // Validate LinkedIn if provided
    if (linkedin && linkedin.trim()) {
      if (!validateLinkedInUrl(linkedin)) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL' },
          { status: 400 }
        );
      }
    }
    
    // Normalize skills to array
    let skillsArray: string[] = [];
    if (skills) {
      if (Array.isArray(skills)) {
        skillsArray = skills.map(s => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    // Normalize repos to array
    let reposArray: string[] = [];
    if (repos) {
      if (Array.isArray(repos)) {
        reposArray = repos.map(r => r.trim()).filter(Boolean);
      } else if (typeof repos === 'string') {
        reposArray = repos.split(/[\n,]/).map(r => r.trim()).filter(Boolean);
      }
    }
    
    // Validate repo URLs
    reposArray = reposArray.filter(r => {
      try {
        new URL(r);
        return r.startsWith('http://') || r.startsWith('https://');
      } catch {
        return false;
      }
    });
    
    // Create profile
    const result = await createTeamProfile({
      handle,
      twitterUrl,
      linkedinUrl: linkedin?.trim() || undefined,
      skills: skillsArray,
      repos: reposArray,
      clientIp: ip,
    });
    
    return NextResponse.json({ id: result.id, success: true });
    
  } catch (error) {
    console.error('Error creating team profile:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to create profile';
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

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }
    
    // Get the profile to check ownership
    const profile = await getTeamProfile(id);
    
    if (profile.clientIp !== ip) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Delete the profile
    await deleteTeamProfile(id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting team profile:', error);
    
    let errorMessage = 'Failed to delete profile';
    if (error instanceof Error) {
      if (error.message.includes('Profile not found')) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      } else if (error.message.includes('Missing Airtable credentials')) {
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
