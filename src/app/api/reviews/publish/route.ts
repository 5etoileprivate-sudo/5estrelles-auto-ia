import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper function to refresh Google Access Token
async function refreshGoogleAccessToken(clientId: string, refreshToken: string): Promise<{ access_token: string, expires_at: string } | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Failed to refresh Google token:", data);
      return null;
    }

    const { access_token, expires_in } = data;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    return { access_token, expires_at: expiresAt };
  } catch (e) {
    console.error("Error calling Google token refresh:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reviewId, replyText } = await req.json();

    if (!reviewId || !replyText) {
      return NextResponse.json({ error: "Review ID and Reply Text are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isSupabaseConnected = supabaseUrl && 
                                !supabaseUrl.includes("placeholder-url") && 
                                supabaseServiceKey && 
                                !supabaseServiceKey.includes("your_service_role_key");

    if (!isSupabaseConnected) {
      // Offline/Mock mode fallback
      console.log("Supabase not connected. Simulating publish in memory for review:", reviewId);
      return NextResponse.json({ success: true, message: "Published (Simulation Mode)" });
    }

    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Fetch the review detail
    const { data: review, error: reviewError } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // 2. Fetch the corresponding client's credentials
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", review.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Associated client not found" }, { status: 404 });
    }

    const hasRealGoogleTokens = client.google_refresh_token && 
                                !client.google_refresh_token.includes("mock_");

    // 3. Fallback to simulation if Google OAuth token is mock
    if (!hasRealGoogleTokens) {
      console.log("Simulation Google Token detected. Simulating API call for:", reviewId);
      
      // Update review status in Supabase
      const { error: updateError } = await supabaseAdmin
        .from("reviews")
        .update({
          status: "published",
          reply_draft: replyText,
          replied_at: new Date().toISOString()
        })
        .eq("id", reviewId);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update review status in DB" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Published (Simulation Mode - Mock Token)" });
    }

    // 4. Handle Real Google API Token Expiration
    let accessToken = client.google_access_token;
    let expiresAt = new Date(client.google_token_expires_at);

    // Refresh if expired or expiring within next 5 minutes
    if (!accessToken || expiresAt.getTime() - Date.now() < 300 * 1000) {
      console.log("Refreshing expired Google access token for client:", client.name);
      const refreshResult = await refreshGoogleAccessToken(client.id, client.google_refresh_token);

      if (!refreshResult) {
        return NextResponse.json({ error: "Google credentials authorization expired. Please reconnect." }, { status: 401 });
      }

      accessToken = refreshResult.access_token;
      
      // Save updated access token to DB
      await supabaseAdmin
        .from("clients")
        .update({
          google_access_token: accessToken,
          google_token_expires_at: refreshResult.expires_at
        })
        .eq("id", client.id);
    }

    // 5. Call Real Google Business Profile API to reply to the review
    // PUT https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
    const accountId = client.google_account_id;
    const locationId = client.google_location_id;

    if (!accountId || !locationId) {
      return NextResponse.json({ error: "Google Location ID and Account ID are missing in client profile" }, { status: 400 });
    }

    const gbpUrl = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${reviewId}/reply`;

    const gbpResponse = await fetch(gbpUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        comment: replyText
      })
    });

    const gbpData = await gbpResponse.json();

    if (!gbpResponse.ok) {
      console.error("Google Business Profile API reply error:", gbpData);
      return NextResponse.json({ error: gbpData.error?.message || "Failed to publish reply to Google Maps" }, { status: gbpResponse.status });
    }

    // 6. Success: Update review status in DB
    const { error: updateError } = await supabaseAdmin
      .from("reviews")
      .update({
        status: "published",
        reply_draft: replyText,
        replied_at: new Date().toISOString()
      })
      .eq("id", reviewId);

    if (updateError) {
      console.error("Failed to update status in DB after successful Google reply:", updateError);
    }

    return NextResponse.json({ success: true, message: "Published successfully to Google Maps!" });

  } catch (error: any) {
    console.error("Error publishing review:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
