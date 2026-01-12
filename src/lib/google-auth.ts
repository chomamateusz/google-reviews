import { TokenResponse, OAuthError } from './types';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Scopes needed for Google Business Profile API
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
].join(' ');

export function getAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent', // Force consent to get refresh token
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as OAuthError;
    throw new Error(error.error_description || error.error || 'Failed to exchange code for tokens');
  }

  return data as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as OAuthError;
    throw new Error(error.error_description || error.error || 'Failed to refresh access token');
  }

  return data as TokenResponse;
}

// Token cache to avoid refreshing on every request
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getValidAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not configured. Please complete the OAuth flow first.');
  }

  // Check if we have a cached token that's still valid (with 5 min buffer)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.accessToken;
  }

  // Refresh the token
  const tokenResponse = await refreshAccessToken(refreshToken);

  cachedToken = {
    accessToken: tokenResponse.access_token,
    expiresAt: now + tokenResponse.expires_in * 1000,
  };

  return cachedToken.accessToken;
}
