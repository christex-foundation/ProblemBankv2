import { NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export async function GET() {
  try {
    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID || 'tbl8aO2Bd8Sj9exgW';
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Civic Idea';

    if (!token || !baseId) {
      return NextResponse.json({ ideas: [] }, { status: 200 });
    }

    // Use table ID if available, otherwise use table name
    const tableIdentifier = tableId || encodeURIComponent(tableName);
    const url = new URL(`${AIRTABLE_API_BASE}/${baseId}/${tableIdentifier}`);

    // Fetch all civic ideas (Status='Published')
    url.searchParams.set('filterByFormula', "{Status} = 'Published'");
    url.searchParams.set('pageSize', '100');
    url.searchParams.append('fields[]', 'Idea Title');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      console.error('Airtable API error:', response.status);
      return NextResponse.json({ ideas: [] }, { status: 200 });
    }

    const data = await response.json();

    const ideas = data.records.map((record: any) => ({
      id: record.id,
      title: record.fields['Idea Title'] || 'Untitled',
    }));

    // Sort alphabetically
    ideas.sort((a: any, b: any) => a.title.localeCompare(b.title));

    console.log(`Fetched ${ideas.length} civic ideas`);

    return NextResponse.json({ ideas }, { status: 200 });

  } catch (error) {
    console.error('Error fetching civic ideas:', error);
    return NextResponse.json({ ideas: [] }, { status: 200 });
  }
}
