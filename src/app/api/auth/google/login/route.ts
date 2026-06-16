import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  // Fallback for simulation mode if keys are not set
  if (!googleClientId || googleClientId.includes("your_google_client_id_here")) {
    // Return a mock callback redirect so the UI flow still completes in development!
    console.log("GOOGLE_CLIENT_ID is not configured, running OAuth flow in simulation mode");
    const mockRedirect = `${redirectUri}?code=mock_code_abc123&state=${clientId}&mock=true`;
    return NextResponse.redirect(mockRedirect);
  }

  // Real Google OAuth redirect URL construction
  const scope = "https://www.googleapis.com/auth/business.manage";
  
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", googleClientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", scope);
  // Request offline access to receive a refresh token
  googleAuthUrl.searchParams.set("access_type", "offline");
  // Force consent screen to always yield a refresh token
  googleAuthUrl.searchParams.set("prompt", "consent");
  googleAuthUrl.searchParams.set("state", clientId);

  return NextResponse.redirect(googleAuthUrl.toString());
}
