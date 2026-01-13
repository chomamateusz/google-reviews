import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Google Reviews Widget Infrastructure
 *
 * This Pulumi stack manages:
 * - Google Cloud project configuration
 * - Required API enablement for Google Business Profile
 * - OAuth consent screen configuration
 *
 * LIMITATION: Google Cloud does not support creating OAuth 2.0 Web Application
 * credentials via any IaC tool (Terraform, Pulumi, etc.). This is an API limitation.
 * OAuth client credentials must be created manually in the Google Cloud Console.
 *
 * Usage:
 *   cd infrastructure
 *   npm install
 *   pulumi stack init dev
 *   pulumi config set gcp:project arctic-surf-475020-g4
 *   pulumi preview  # See what will be created
 *   pulumi up       # Apply changes
 */

// Configuration
const config = new pulumi.Config();
const gcpConfig = new pulumi.Config("gcp");

const projectId = gcpConfig.require("project");
const region = gcpConfig.get("region") || "europe-central2";
const supportEmail = config.get("supportEmail") || "";

// Export project info
export const project = projectId;

// Required APIs for Google Business Profile
const requiredApis = [
  "mybusiness.googleapis.com",
  "mybusinessaccountmanagement.googleapis.com",
  "mybusinessbusinessinformation.googleapis.com",
];

// Enable required APIs
const enabledApis = requiredApis.map((api, index) => {
  return new gcp.projects.Service(`api-${index}`, {
    project: projectId,
    service: api,
    disableDependentServices: false,
    disableOnDestroy: false,
  });
});

export const enabledServices = requiredApis;

// Note: OAuth Consent Screen and OAuth Client credentials must be created manually
// in the Google Cloud Console. This is a Google API limitation - no IaC tool
// (Terraform, Pulumi, etc.) can create Web Application OAuth credentials.

// Outputs with helpful URLs
export const consoleCredentialsUrl = pulumi.interpolate`https://console.cloud.google.com/apis/credentials?project=${projectId}`;
export const consoleConsentUrl = pulumi.interpolate`https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;

// Instructions output
export const nextSteps = pulumi.interpolate`
=== OAuth Client Setup (Manual Step Required) ===

1. Go to: https://console.cloud.google.com/apis/credentials?project=${projectId}
2. Click '+ CREATE CREDENTIALS' > 'OAuth client ID'
3. Application type: 'Web application'
4. Name: 'CodeRoad Google Reviews Widget'
5. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback
   - https://your-production-domain.vercel.app/api/auth/callback
6. Copy Client ID and Secret to your .env.local file

Then run your app and visit /api/auth to complete the OAuth flow.
`;
