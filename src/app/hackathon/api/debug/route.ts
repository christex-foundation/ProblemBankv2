import { NextResponse } from 'next/server';

// Diagnostic endpoint to check Airtable configuration
// Access this at: https://your-site.vercel.app/api/debug
export async function GET() {
  const config = {
    hasToken: !!process.env.AIRTABLE_TOKEN,
    hasBaseId: !!process.env.AIRTABLE_BASE_ID,
    hasTableName: !!process.env.AIRTABLE_TABLE_NAME,
    hasTableId: !!process.env.AIRTABLE_TABLE_ID,
    titleField: process.env.AIRTABLE_TITLE_FIELD || 'Title (using default)',
    blurbField: process.env.AIRTABLE_BLURB_FIELD || 'Blurb (using default)',
    categoryField: process.env.AIRTABLE_CATEGORY_FIELD || 'Category (using default)',
    sortField: process.env.AIRTABLE_SORT_FIELD || 'Not set',
    sortDirection: process.env.AIRTABLE_SORT_DIRECTION || 'asc (using default)',
    pageSize: process.env.AIRTABLE_PAGE_SIZE || '10 (using default)',
    // Show partial token for verification (first 10 chars only)
    tokenPreview: process.env.AIRTABLE_TOKEN?.substring(0, 10) + '...',
    baseIdPreview: process.env.AIRTABLE_BASE_ID?.substring(0, 8) + '...',
  };

  // Test Airtable API connection
  let apiTest: {
    success: boolean;
    error: string | null;
    recordCount: number;
  };

  if (config.hasToken && config.hasBaseId && config.hasTableName) {
    try {
      const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME!)}?pageSize=1&filterByFormula={Status}='Published'`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache diagnostic requests
      });

      if (res.ok) {
        const data = await res.json();
        apiTest = {
          success: true,
          error: null,
          recordCount: data.records?.length || 0,
        };
      } else {
        const errorText = await res.text();
        apiTest = {
          success: false,
          error: `${res.status} ${res.statusText}: ${errorText}`,
          recordCount: 0,
        };
      }
    } catch (error) {
      apiTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recordCount: 0,
      };
    }
  } else {
    apiTest = {
      success: false,
      error: 'Missing required environment variables',
      recordCount: 0,
    };
  }

  return NextResponse.json({
    message: 'Airtable Configuration Diagnostic',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config,
    apiTest,
    troubleshooting: {
      allConfigured: config.hasToken && config.hasBaseId && config.hasTableName,
      steps: [
        'Check that AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME are set in Vercel',
        'Verify your Airtable records have a "Status" field set to "Published"',
        'Make sure field names match: AIRTABLE_TITLE_FIELD="Idea Title", AIRTABLE_BLURB_FIELD="The Problem"',
        'Redeploy after adding environment variables',
      ],
    },
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
