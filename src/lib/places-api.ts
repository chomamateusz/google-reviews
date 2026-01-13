import { Review } from './types';

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export interface PlacesReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlaceDetailsResponse {
  result: {
    name: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: PlacesReview[];
  };
  status: string;
  error_message?: string;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured');
  }

  // Handle both standard Place IDs (ChIJ...) and feature IDs (/g/...)
  let finalPlaceId = placeId;
  
  // If it's a Google feature ID format (/g/...), try to resolve it
  if (placeId.startsWith('/g/') || placeId.startsWith('g/')) {
    const featureId = placeId.replace(/^\//, ''); // Remove leading slash if present
    // Google feature IDs can sometimes be used directly with the "ftid" parameter
    // but for Place Details, we need a proper Place ID
    console.log(`Note: Detected Google feature ID format: ${featureId}. This may require conversion.`);
  }

  const url = `${PLACES_API_BASE}/details/json?place_id=${finalPlaceId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=pl`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.error_message || `Places API error: ${data.status}`);
  }

  return data;
}

export function transformPlacesReview(review: PlacesReview): Review {
  return {
    id: `places-${review.time}`,
    author: review.author_name,
    authorPhoto: review.profile_photo_url,
    rating: review.rating,
    text: review.text,
    createdAt: new Date(review.time * 1000).toISOString(),
    relativeTime: review.relative_time_description,
  };
}

export async function getPlacesReviews(placeId: string): Promise<{
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  businessName: string;
}> {
  const data = await getPlaceDetails(placeId);

  const reviews = (data.result.reviews || []).map(transformPlacesReview);

  return {
    reviews,
    totalCount: data.result.user_ratings_total || reviews.length,
    averageRating: data.result.rating || 0,
    businessName: data.result.name,
  };
}
