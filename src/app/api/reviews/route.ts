import { NextRequest, NextResponse } from 'next/server';
import { getFormattedReviews } from '@/lib/gbp-api';
import { getCachedReviews, setCachedReviews } from '@/lib/cache';
import { ReviewsApiResponse } from '@/lib/types';

// CORS headers helper
function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());

  // Allow localhost in development
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  const isAllowed = allowedOrigins.includes(origin) || isLocalhost;

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const headers = corsHeaders(request);

  // Check for cache bypass
  const searchParams = request.nextUrl.searchParams;
  const noCache = searchParams.get('nocache') === 'true';

  // Try to get cached data first
  if (!noCache) {
    const cached = getCachedReviews();
    if (cached) {
      return NextResponse.json(cached, { headers });
    }
  }

  try {
    const { reviews, totalCount, averageRating } = await getFormattedReviews();

    const response: ReviewsApiResponse = {
      success: true,
      business: {
        name: 'CodeRoad - Kurs JavaScript Online',
        rating: averageRating,
        totalReviews: totalCount,
      },
      reviews,
      cachedAt: new Date().toISOString(),
      source: 'google-business-profile',
    };

    // Cache the response
    setCachedReviews(response);

    return NextResponse.json(response, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    const errorResponse: ReviewsApiResponse = {
      success: false,
      business: {
        name: 'CodeRoad - Kurs JavaScript Online',
        rating: 0,
        totalReviews: 0,
      },
      reviews: [],
      cachedAt: new Date().toISOString(),
      source: 'google-business-profile',
      error: message,
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers,
    });
  }
}
