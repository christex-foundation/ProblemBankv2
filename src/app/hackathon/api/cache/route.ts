import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import {
  invalidateAllAirtableCache,
  invalidateIdeasCache,
  invalidateTechStackCache,
  getCacheInfo,
  CACHE_TAGS
} from '@/lib/cache';

/**
 * Cache management API endpoint
 * GET: Get cache information
 * POST: Invalidate caches
 */
export async function GET() {
  try {
    const cacheInfo = getCacheInfo();
    return NextResponse.json({
      success: true,
      cache: cacheInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tags } = body;

    switch (action) {
      case 'invalidate-all':
        await invalidateAllAirtableCache();
        return NextResponse.json({
          success: true,
          message: 'All Airtable caches invalidated',
          timestamp: new Date().toISOString(),
        });

      case 'invalidate-ideas':
        await invalidateIdeasCache();
        return NextResponse.json({
          success: true,
          message: 'Ideas caches invalidated',
          timestamp: new Date().toISOString(),
        });

      case 'invalidate-tech-stacks':
        await invalidateTechStackCache();
        return NextResponse.json({
          success: true,
          message: 'Tech stack caches invalidated',
          timestamp: new Date().toISOString(),
        });

      case 'invalidate-tags':
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json(
            { success: false, error: 'Tags array is required' },
            { status: 400 }
          );
        }
        
        // Validate tags
        const validTags = Object.values(CACHE_TAGS);
        const invalidTags = tags.filter(tag => !validTags.includes(tag));
        if (invalidTags.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Invalid tags: ${invalidTags.join(', ')}`,
              validTags 
            },
            { status: 400 }
          );
        }

        for (const tag of tags) {
          revalidateTag(tag, '/');
        }
        return NextResponse.json({
          success: true,
          message: `Cache tags invalidated: ${tags.join(', ')}`,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: invalidate-all, invalidate-ideas, invalidate-tech-stacks, or invalidate-tags' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cache invalidation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Cache invalidation failed' },
      { status: 500 }
    );
  }
}








