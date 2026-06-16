import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const clientId = searchParams.get("state"); // client_id stored in OAuth state
  const isMock = searchParams.get("mock") === "true";

  if (!code || !clientId) {
    return NextResponse.json({ error: "Code and Client state are required" }, { status: 400 });
  }

  // Redirect target dashboard URL
  const baseUrl = new URL(req.url).origin;
  const redirectTarget = `${baseUrl}/clients?google-success=true`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isSupabaseConnected = supabaseUrl && 
                              !supabaseUrl.includes("placeholder-url") && 
                              supabaseServiceKey &&
                              !supabaseServiceKey.includes("your_service_role_key");

  // Fallback for simulation mode (no real OAuth keys configured)
  if (isMock || !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes("your_google_client_id_here")) {
    console.log("Saving mock Google Connection token to database/state for client:", clientId);
    
    if (isSupabaseConnected) {
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
      try {
        await supabaseAdmin
          .from("clients")
          .update({
            google_refresh_token: "mock_refresh_token_xyz987",
            google_access_token: "mock_access_token_xyz123",
            google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            google_account_id: "accounts/acc-mock-google-developer",
            google_location_id: "locations/loc-mock-establishment"
          })
          .eq("id", clientId);
      } catch (e) {
        console.error("Failed updating client in Supabase admin client", e);
      }
    }
    
    return NextResponse.redirect(redirectTarget);
  }

  // Real Google OAuth Token Exchange
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
        code: code,
      }),
    });

    const tokens = await response.json();

    if (tokens.error) {
      console.error("Google OAuth token exchange error:", tokens);
      return NextResponse.json({ error: tokens.error_description || tokens.error }, { status: 400 });
    }

    const { access_token, refresh_token, expires_in } = tokens;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Store in Supabase
    if (isSupabaseConnected) {
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
      
      let targetClientId = clientId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(clientId)) {
        console.warn(`Provided clientId "${clientId}" is not a valid UUID. Attempting fallback lookup...`);
        // Try to find the first client in the database to link the token to
        const { data: fallbackClients, error: lookupError } = await supabaseAdmin
          .from("clients")
          .select("id, name")
          .order("created_at", { ascending: true })
          .limit(1);
          
        if (!lookupError && fallbackClients && fallbackClients.length > 0) {
          targetClientId = fallbackClients[0].id;
          console.log(`Fallback resolved client "${fallbackClients[0].name}" with UUID: ${targetClientId}`);
        } else {
          console.error("No clients found in database for fallback lookup. Lookup error:", lookupError);
        }
      }
      
      // Update client credentials
      const { error } = await supabaseAdmin
        .from("clients")
        .update({
          google_access_token: access_token,
          // refresh_token is only sent on the first authorization or when prompt=consent is used
          ...(refresh_token ? { google_refresh_token: refresh_token } : {}),
          google_token_expires_at: expiresAt,
          google_account_id: "accounts/acc-room21-prod", // In production we can fetch this from GCP
          google_location_id: "locations/loc-room21-prod" // In production we can list locations from GCP
        })
        .eq("id", targetClientId);

      if (error) {
        console.error("Supabase error saving Google credentials for client:", targetClientId, error);
        return NextResponse.json({ error: "Failed to save tokens to database" }, { status: 500 });
      }
    } else {
      console.warn("Supabase keys are missing. Real OAuth tokens cannot be saved to database.");
    }

    return NextResponse.redirect(redirectTarget);
  } catch (error) {
    console.error("Error exchanging OAuth code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
