import { NextResponse } from 'next/server';
import { fetchAllTechCategories } from '@/lib/airtable';

export async function GET() {
  try {
    const categories = await fetchAllTechCategories();
    
    const response = NextResponse.json(categories);
    
    // Set cache headers for browser caching (longer cache for categories)
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=900');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=900');
    
    return response;
  } catch (error) {
    console.error('Error fetching tech categories:', error);
    return NextResponse.json([], { status: 500 });
  }
}
