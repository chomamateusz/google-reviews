import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to generate auth URL',
        message,
        help: 'Make sure GOOGLE_CLIENT_ID and NEXT_PUBLIC_APP_URL are set in your environment variables.',
      },
      { status: 500 }
    );
  }
}
