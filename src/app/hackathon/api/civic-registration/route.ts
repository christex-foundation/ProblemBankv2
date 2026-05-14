import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, districtOfResidence, gender, age, whatsappNumber, track } = body;

    // Airtable API configuration
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_PAT;
    const AIRTABLE_BASE_ID = 'appXXXqFjLgeJNRDi';
    const AIRTABLE_TABLE_ID = 'tbleOdJeNkUMFuofe';

    if (!AIRTABLE_API_KEY) {
      console.error('Airtable API key not found');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create record in Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'First Name': firstName,
            'Last Name': lastName,
            'Email': email,
            'District of Residence': districtOfResidence,
            'Gender': gender,
            'Age': parseInt(age),
            'WhatsApp Number': whatsappNumber,
            'Which Track are you applying for?': track,
          },
        }),
      }
    );

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    const data = await airtableResponse.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
