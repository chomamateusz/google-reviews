import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json(
      {
        error: 'OAuth error',
        message: error,
        description: searchParams.get('error_description'),
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        error: 'Missing authorization code',
        help: 'Start the OAuth flow by visiting /api/auth',
      },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // In production, you should securely store the refresh token
    // For now, we display it so you can add it to your environment variables
    return NextResponse.json({
      success: true,
      message: 'OAuth flow completed successfully!',
      instructions: [
        '1. Copy the refresh_token below',
        '2. Add it to your .env.local file as GOOGLE_REFRESH_TOKEN',
        '3. In Vercel, add it as an environment variable',
        '4. Restart your development server',
      ],
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
      },
      important:
        'Save the refresh_token now! It will only be shown once. If you lose it, you need to re-authorize.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to exchange code for tokens',
        message,
      },
      { status: 500 }
    );
  }
}
