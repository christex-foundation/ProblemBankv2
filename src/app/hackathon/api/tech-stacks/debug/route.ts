import { NextResponse } from 'next/server';
import { fetchTechStacks } from '@/lib/airtable';

export async function GET() {
  try {
    console.log('Environment variables:');
    console.log('AIRTABLE_TECH_TOKEN:', process.env['AIRTABLE_TECH_TOKEN'] ? 'SET' : 'NOT SET');
    console.log('AIRTABLE_TECH_BASE_ID:', process.env['AIRTABLE_TECH_BASE_ID'] || 'NOT SET');
    console.log('AIRTABLE_TECH_TABLE_ID:', process.env['AIRTABLE_TECH_TABLE_ID'] || 'NOT SET');
    console.log('AIRTABLE_TECH_TABLE_NAME:', process.env['AIRTABLE_TECH_TABLE_NAME'] || 'NOT SET');
    
    const result = await fetchTechStacks(50); // Fetch more records to see all data
    
    return NextResponse.json({
      environment: {
        token: process.env['AIRTABLE_TECH_TOKEN'] ? 'SET' : 'NOT SET',
        baseId: process.env['AIRTABLE_TECH_BASE_ID'] || 'NOT SET',
        tableId: process.env['AIRTABLE_TECH_TABLE_ID'] || 'NOT SET',
        tableName: process.env['AIRTABLE_TECH_TABLE_NAME'] || 'NOT SET',
      },
      result
    });
  } catch (error) {
    console.error('Debug error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
