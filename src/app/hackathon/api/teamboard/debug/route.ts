import { NextResponse } from 'next/server';

export async function GET() {
  const debug = {
    hasTeamToken: !!process.env['AIRTABLE_TEAM_TOKEN'],
    hasTeamBaseId: !!process.env['AIRTABLE_TEAM_BASE_ID'],
    hasTeamTableId: !!process.env['AIRTABLE_TEAM_TABLE_ID'],
    hasBaseToken: !!process.env['AIRTABLE_TOKEN'],
    hasBaseBaseId: !!process.env['AIRTABLE_BASE_ID'],
    hasBaseTableId: !!process.env['AIRTABLE_TABLE_ID'],
    teamBaseId: process.env['AIRTABLE_TEAM_BASE_ID'] || process.env['AIRTABLE_BASE_ID'],
    teamTableId: process.env['AIRTABLE_TEAM_TABLE_ID'] || process.env['AIRTABLE_TABLE_ID'],
  };
  
  return NextResponse.json(debug);
}
