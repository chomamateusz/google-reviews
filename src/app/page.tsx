import Script from 'next/script';

export default function Home() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
  const hasAccountId = !!process.env.GBP_ACCOUNT_ID;
  const hasLocationId = !!process.env.GBP_LOCATION_ID;
  const isConfigured = hasRefreshToken && hasAccountId && hasLocationId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Google Reviews Widget
          </h1>
          <p className="text-lg text-gray-600">
            CodeRoad - Self-hosted Google Business Profile Reviews
          </p>
        </header>

        {/* Setup Status */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Status</h2>
          <div className="space-y-3">
            <StatusItem
              label="OAuth Token"
              configured={hasRefreshToken}
              help={hasRefreshToken ? 'Configured' : 'Visit /api/auth to authorize'}
            />
            <StatusItem
              label="Account ID"
              configured={hasAccountId}
              help={hasAccountId ? 'Configured' : 'Visit /api/accounts to find your ID'}
            />
            <StatusItem
              label="Location ID"
              configured={hasLocationId}
              help={hasLocationId ? 'Configured' : 'Visit /api/locations to find your ID'}
            />
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Steps</h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Authorize with Google</p>
                <p className="text-sm text-gray-600 mb-2">
                  Complete the OAuth flow to get your refresh token.
                </p>
                <a
                  href="/api/auth"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start OAuth Flow
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Find your Account ID</p>
                <p className="text-sm text-gray-600 mb-2">
                  List your Google Business Profile accounts.
                </p>
                <a
                  href="/api/accounts"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Accounts
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Find your Location ID</p>
                <p className="text-sm text-gray-600 mb-2">
                  List locations for your account.
                </p>
                <a
                  href="/api/locations"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Locations
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <p className="font-medium text-gray-900">Test the Reviews API</p>
                <p className="text-sm text-gray-600 mb-2">
                  Verify reviews are being fetched correctly.
                </p>
                <a
                  href="/api/reviews"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Reviews API
                </a>
              </div>
            </li>
          </ol>
        </section>

        {/* Widget Preview */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Widget Preview</h2>
          {isConfigured ? (
            <>
              <div id="coderoad-reviews" data-theme="light" data-max="5"></div>
              <Script src="/widget.js" strategy="lazyOnload" />
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Complete the setup steps above to see the widget preview.
              </p>
            </div>
          )}
        </section>

        {/* Embed Code */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Embed Code</h2>
          <p className="text-gray-600 mb-4">
            Add this code to your website to display the reviews widget:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`<!-- CodeRoad Google Reviews Widget -->
<div id="coderoad-reviews" data-theme="light" data-max="5"></div>
<script src="${appUrl}/widget.js"></script>`}</code>
          </pre>
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Options:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">data-theme</code> - &quot;light&quot; or &quot;dark&quot;</li>
              <li><code className="bg-gray-100 px-1 rounded">data-max</code> - Maximum number of reviews to show</li>
            </ul>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <p className="text-gray-600 mb-4">
            Add these to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# After completing OAuth flow
GOOGLE_REFRESH_TOKEN=your_refresh_token

# After finding your account/location IDs
GBP_ACCOUNT_ID=your_account_id
GBP_LOCATION_ID=your_location_id

# App URL
NEXT_PUBLIC_APP_URL=${appUrl}

# CORS (your website domain)
ALLOWED_ORIGINS=https://coderoad.pl,https://www.coderoad.pl`}</code>
          </pre>
        </section>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>CodeRoad - Kurs JavaScript Online</p>
        </footer>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  configured,
  help,
}: {
  label: string;
  configured: boolean;
  help: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${configured ? 'text-green-600' : 'text-amber-600'}`}>
          {help}
        </span>
        <span
          className={`w-3 h-3 rounded-full ${configured ? 'bg-green-500' : 'bg-amber-500'}`}
        />
      </div>
    </div>
  );
}
