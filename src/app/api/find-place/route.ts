import { NextRequest, NextResponse } from 'next/server';

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

interface PlaceCandidate {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
}

async function findPlaceFromText(query: string, apiKey: string): Promise<PlaceCandidate[]> {
  const url = `${PLACES_API_BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.candidates?.length > 0) {
    return data.candidates;
  }
  return [];
}

async function textSearch(query: string, apiKey: string, location?: string): Promise<PlaceCandidate[]> {
  let url = `${PLACES_API_BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  
  // Add location bias if provided (lat,lng format)
  if (location) {
    url += `&location=${location}&radius=50000`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.results?.length > 0) {
    return data.results.map((r: { place_id: string; name: string; formatted_address?: string; rating?: number; user_ratings_total?: number }) => ({
      place_id: r.place_id,
      name: r.name,
      formatted_address: r.formatted_address,
      rating: r.rating,
      user_ratings_total: r.user_ratings_total,
    }));
  }
  return [];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || 'CodeRoad Kurs JavaScript Online';
  const location = searchParams.get('location'); // Optional: lat,lng format

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Try multiple search methods
    let candidates: PlaceCandidate[] = [];
    let method = '';
    
    // Method 1: Find Place from Text
    candidates = await findPlaceFromText(query, apiKey);
    if (candidates.length > 0) {
      method = 'findplacefromtext';
    }
    
    // Method 2: Text Search (more flexible)
    if (candidates.length === 0) {
      candidates = await textSearch(query, apiKey, location || undefined);
      if (candidates.length > 0) {
        method = 'textsearch';
      }
    }
    
    // Method 3: Text Search with Poland location if no location specified
    if (candidates.length === 0 && !location) {
      candidates = await textSearch(query, apiKey, '52.0,19.0'); // Center of Poland
      if (candidates.length > 0) {
        method = 'textsearch-poland';
      }
    }
    
    // Method 4: Try nearby search if exact coordinates provided
    if (candidates.length === 0 && location) {
      const nearbyUrl = `${PLACES_API_BASE}/nearbysearch/json?location=${location}&radius=100&keyword=${encodeURIComponent(query)}&key=${apiKey}`;
      const nearbyResponse = await fetch(nearbyUrl);
      const nearbyData = await nearbyResponse.json();
      
      if (nearbyData.status === 'OK' && nearbyData.results?.length > 0) {
        candidates = nearbyData.results.map((r: { place_id: string; name: string; vicinity?: string; rating?: number; user_ratings_total?: number }) => ({
          place_id: r.place_id,
          name: r.name,
          formatted_address: r.vicinity,
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
        }));
        method = 'nearbysearch';
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        query,
        candidates: [],
        message: 'No places found. Try different search terms like your business name with city.',
        suggestions: [
          'Try adding your city name to the query',
          'Use your Google Maps listing name exactly',
          'Search for your business address',
        ],
      });
    }

    return NextResponse.json({
      success: true,
      query,
      method,
      candidates: candidates.slice(0, 5), // Return top 5
      message: `Found ${candidates.length} place(s). Use the place_id value in your GOOGLE_PLACE_ID environment variable.`,
      instruction: 'Copy the place_id from the matching result and add it to your .env.local file as GOOGLE_PLACE_ID=<place_id>',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
