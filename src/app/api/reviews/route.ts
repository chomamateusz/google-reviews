import { NextRequest, NextResponse } from 'next/server';
import { getFormattedReviews } from '@/lib/gbp-api';
import { getPlacesReviews } from '@/lib/places-api';
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

  // Determine which API to use
  const hasGbpConfig = process.env.GBP_ACCOUNT_ID && process.env.GBP_LOCATION_ID;
  const hasPlacesConfig = process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID;

  try {
    let reviews;
    let totalCount;
    let averageRating;
    let businessName = 'CodeRoad - Kurs JavaScript Online';
    let source: 'google-business-profile' | 'google-places-api' = 'google-business-profile';

    if (hasGbpConfig) {
      // Use Google Business Profile API (all reviews)
      const result = await getFormattedReviews();
      reviews = result.reviews;
      totalCount = result.totalCount;
      averageRating = result.averageRating;
      source = 'google-business-profile';
    } else if (hasPlacesConfig) {
      // Fallback to Google Places API (max 5 reviews)
      const result = await getPlacesReviews(process.env.GOOGLE_PLACE_ID!);
      reviews = result.reviews;
      totalCount = result.totalCount;
      averageRating = result.averageRating;
      businessName = result.businessName;
      source = 'google-places-api';
    } else {
      throw new Error(
        'No API configured. Set either GBP_ACCOUNT_ID + GBP_LOCATION_ID (for all reviews) or GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID (for max 5 reviews).'
      );
    }

    const response: ReviewsApiResponse = {
      success: true,
      business: {
        name: businessName,
        rating: averageRating,
        totalReviews: totalCount,
      },
      reviews,
      cachedAt: new Date().toISOString(),
      source,
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
