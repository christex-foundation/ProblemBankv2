import { NextResponse } from 'next/server';
import { listTeamProfiles } from '@/lib/teamboard';

export async function GET() {
  try {
    const profiles = await listTeamProfiles();
    return NextResponse.json({ 
      success: true, 
      count: profiles.length,
      message: 'Airtable connection successful'
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Airtable connection failed'
    }, { status: 500 });
  }
}
