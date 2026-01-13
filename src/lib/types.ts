// Google Business Profile API types

export type StarRating = 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export interface Reviewer {
  profilePhotoUrl?: string;
  displayName: string;
  isAnonymous?: boolean;
}

export interface ReviewReply {
  comment: string;
  updateTime: string;
}

export interface GoogleReview {
  name: string; // Format: accounts/{account_id}/locations/{location_id}/reviews/{review_id}
  reviewId: string;
  reviewer: Reviewer;
  starRating: StarRating;
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: ReviewReply;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

// Simplified review format for the widget
export interface Review {
  id: string;
  author: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  createdAt: string;
  relativeTime: string;
  reply?: {
    text: string;
    createdAt: string;
  };
}

export interface ReviewsApiResponse {
  success: boolean;
  business: {
    name: string;
    rating: number;
    totalReviews: number;
  };
  reviews: Review[];
  cachedAt: string;
  source: 'google-business-profile' | 'google-places-api';
  error?: string;
}

// OAuth types
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface OAuthError {
  error: string;
  error_description?: string;
}

// Google Business Profile Account & Location types
export interface GBPAccount {
  name: string; // Format: accounts/{account_id}
  accountName: string;
  type: string;
  verificationState?: string;
}

export interface GBPLocation {
  name: string; // Format: accounts/{account_id}/locations/{location_id}
  title: string;
  storefrontAddress?: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    regionCode: string;
  };
  websiteUri?: string;
}

// Helper function to convert star rating to number
export function starRatingToNumber(rating: StarRating): number {
  const map: Record<StarRating, number> = {
    STAR_RATING_UNSPECIFIED: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[rating];
}

// Helper function to get relative time string
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'dzisiaj';
  if (diffDays === 1) return 'wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mies. temu`;
  return `${Math.floor(diffDays / 365)} lat temu`;
}
