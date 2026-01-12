import { NextResponse } from 'next/server';
import { listAccounts } from '@/lib/gbp-api';

export async function GET() {
  try {
    const accounts = await listAccounts();

    return NextResponse.json({
      success: true,
      message: 'Use the account ID (number after "accounts/") as your GBP_ACCOUNT_ID',
      accounts: accounts.map((account) => ({
        id: account.name.replace('accounts/', ''),
        fullName: account.name,
        displayName: account.accountName,
        type: account.type,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to list accounts',
        message,
        help: 'Make sure you have completed the OAuth flow and set GOOGLE_REFRESH_TOKEN.',
      },
      { status: 500 }
    );
  }
}
