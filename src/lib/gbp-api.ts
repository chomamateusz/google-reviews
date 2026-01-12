import { getValidAccessToken } from './google-auth';
import {
  GBPAccount,
  GBPLocation,
  GoogleReview,
  GoogleReviewsResponse,
  Review,
  starRatingToNumber,
  getRelativeTime,
} from './types';

const GBP_API_BASE = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const GBP_REVIEWS_API_BASE = 'https://mybusiness.googleapis.com/v4';

async function fetchWithAuth(url: string): Promise<Response> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function listAccounts(): Promise<GBPAccount[]> {
  const response = await fetchWithAuth(`${GBP_API_BASE}/accounts`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list accounts: ${error}`);
  }

  const data = await response.json();
  return data.accounts || [];
}

export async function listLocations(accountId: string): Promise<GBPLocation[]> {
  // The Business Information API uses a different base URL
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list locations: ${error}`);
  }

  const data = await response.json();
  return data.locations || [];
}

export async function listReviews(
  accountId: string,
  locationId: string,
  pageSize: number = 50,
  pageToken?: string
): Promise<GoogleReviewsResponse> {
  let url = `${GBP_REVIEWS_API_BASE}/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${pageSize}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list reviews: ${error}`);
  }

  return response.json();
}

export async function getAllReviews(
  accountId: string,
  locationId: string
): Promise<{ reviews: GoogleReview[]; totalCount: number; averageRating: number }> {
  const allReviews: GoogleReview[] = [];
  let pageToken: string | undefined;
  let totalCount = 0;
  let averageRating = 0;

  do {
    const response = await listReviews(accountId, locationId, 50, pageToken);

    if (response.reviews) {
      allReviews.push(...response.reviews);
    }

    if (response.totalReviewCount !== undefined) {
      totalCount = response.totalReviewCount;
    }

    if (response.averageRating !== undefined) {
      averageRating = response.averageRating;
    }

    pageToken = response.nextPageToken;
  } while (pageToken);

  return { reviews: allReviews, totalCount, averageRating };
}

export function transformReview(review: GoogleReview): Review {
  // Extract the review ID from the full name
  const parts = review.name.split('/');
  const id = parts[parts.length - 1];

  return {
    id,
    author: review.reviewer.displayName || 'Anonimowy',
    authorPhoto: review.reviewer.profilePhotoUrl,
    rating: starRatingToNumber(review.starRating),
    text: review.comment || '',
    createdAt: review.createTime,
    relativeTime: getRelativeTime(review.createTime),
    reply: review.reviewReply
      ? {
          text: review.reviewReply.comment,
          createdAt: review.reviewReply.updateTime,
        }
      : undefined,
  };
}

export async function getFormattedReviews(): Promise<{
  reviews: Review[];
  totalCount: number;
  averageRating: number;
}> {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;

  if (!accountId || !locationId) {
    throw new Error(
      'GBP_ACCOUNT_ID and GBP_LOCATION_ID are required. Use /api/accounts and /api/locations to find them.'
    );
  }

  const { reviews, totalCount, averageRating } = await getAllReviews(accountId, locationId);

  return {
    reviews: reviews.map(transformReview),
    totalCount,
    averageRating,
  };
}
