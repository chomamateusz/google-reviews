import { NextRequest, NextResponse } from 'next/server';
import { listLocations } from '@/lib/gbp-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId') || process.env.GBP_ACCOUNT_ID;

  if (!accountId) {
    return NextResponse.json(
      {
        error: 'Missing accountId',
        help: 'Provide accountId as a query parameter or set GBP_ACCOUNT_ID in environment variables. Use /api/accounts to find your account ID.',
      },
      { status: 400 }
    );
  }

  try {
    const locations = await listLocations(accountId);

    return NextResponse.json({
      success: true,
      message: 'Use the location ID (number after "locations/") as your GBP_LOCATION_ID',
      accountId,
      locations: locations.map((location) => {
        const parts = location.name.split('/');
        const locationId = parts[parts.length - 1];
        return {
          id: locationId,
          fullName: location.name,
          title: location.title,
          website: location.websiteUri,
          address: location.storefrontAddress,
        };
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to list locations',
        message,
        help: 'Make sure the accountId is correct and you have access to it.',
      },
      { status: 500 }
    );
  }
}
