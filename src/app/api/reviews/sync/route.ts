import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper function to query Gemini inside sync
async function generateAIResponse(clientName: string, clientPrompt: string, rating: number, comment: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("your_gemini_api_key_here")) {
    // Return simulated response
    return rating >= 4
      ? `Hola, ¡muchas gracias por tu reseña sobre ${clientName}! Nos encanta saber que has disfrutado del servicio y el ambiente. Estilo y precisión es lo que nos define. ¡Esperamos verte pronto de nuevo en el salón! Un saludo.`
      : `Hola, lamentamos mucho leer que tu experiencia no ha sido de tu total agrado en ${clientName}. En nuestro salón cuidamos cada detalle y nos gustaría hablar contigo para entender qué ha fallado y cómo podemos solucionarlo. Escríbenos directamente. Un saludo.`;
  }

  try {
    const systemInstruction = `Vous êtes un assistant IA de 5estrelles.com chargé de répondre de façon professionnelle et polie aux avis de l'établissement "${clientName}".
Vous devez IMPÉRATIVEMENT répondre dans la même langue que celle utilisée par l'auteur de l'avis (Espagnol, Catalan, Anglais, Français, etc.).
Consigne de style globale : Soyez chaleureux, court (3 à 4 phrases maximum), poli, et mentionnez le nom de l'établissement de temps en temps.
Consignes spécifiques de l'établissement : "${clientPrompt || 'Ton professionnel et courtois.'}"`;

    const userMessage = `Veuillez générer la réponse optimale pour cet avis Google : Note: ${rating}/5, Commentaire: "${comment}"`;
    const fullPrompt = `${systemInstruction}\n\n${userMessage}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (e) {
    console.error("AI Generation error inside sync:", e);
    return "Hola, gracias por tu reseña. Nos pondremos en contacto contigo pronto.";
  }
}

// Helper to post reply to Google
async function publishReplyToGoogle(accountId: string, locationId: string, reviewId: string, replyText: string, accessToken: string): Promise<boolean> {
  try {
    const gbpUrl = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${reviewId}/reply`;
    const response = await fetch(gbpUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ comment: replyText })
    });
    return response.ok;
  } catch (e) {
    console.error("Failed to auto-post reply to Google in sync job:", e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceSimulate = searchParams.get("simulate") === "true";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isSupabaseConnected = supabaseUrl && 
                                !supabaseUrl.includes("placeholder-url") && 
                                supabaseServiceKey && 
                                !supabaseServiceKey.includes("your_service_role_key");

    if (!isSupabaseConnected) {
      return NextResponse.json({ error: "Supabase not connected" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

    // 1. Fetch all clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from("clients")
      .select("*");

    if (clientsError || !clients) {
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }

    let totalSynced = 0;
    let autoPublishedCount = 0;

    for (const client of clients) {
      const hasRealGoogleTokens = client.google_refresh_token && 
                                  !client.google_refresh_token.includes("mock_");

      // A. Handle Real Google Accounts
      if (hasRealGoogleTokens && !forceSimulate) {
        // Fetch access token
        let accessToken = client.google_access_token;
        // In real sync, check expiry and refresh if needed. For brevity, we assume token is refreshed by publisher API or here.
        
        // Fetch reviews from Google My Business API
        const gbpReviewsUrl = `https://mybusiness.googleapis.com/v4/${client.google_account_id}/${client.google_location_id}/reviews`;
        
        try {
          const gbpResponse = await fetch(gbpReviewsUrl, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          
          if (!gbpResponse.ok) {
            console.error(`Failed to pull reviews from Google for ${client.name}. Status:`, gbpResponse.status);
            continue;
          }
          
          const gbpData = await gbpResponse.json();
          const gbpReviews = gbpData.reviews || [];

          for (const reviewItem of gbpReviews) {
            // Check if review exists in DB
            const { data: existing } = await supabaseAdmin
              .from("reviews")
              .select("id")
              .eq("id", reviewItem.reviewId)
              .single();

            if (!existing) {
              // It's a new review!
              const rating = reviewItem.starRating === "FIVE" ? 5 :
                             reviewItem.starRating === "FOUR" ? 4 :
                             reviewItem.starRating === "THREE" ? 3 :
                             reviewItem.starRating === "TWO" ? 2 : 1;

              const comment = reviewItem.comment || "";
              
              // Generate reply draft with LLM
              const replyDraft = await generateAIResponse(client.name, client.custom_prompt, rating, comment);
              
              // Auto-publish logic (4-5 stars + auto mode)
              const isAuto = client.auto_mode === 'auto' && rating >= 4;
              let status = 'pending';
              let repliedAt = null;

              if (isAuto) {
                const success = await publishReplyToGoogle(client.google_account_id, client.google_location_id, reviewItem.reviewId, replyDraft, accessToken);
                if (success) {
                  status = 'published';
                  repliedAt = new Date().toISOString();
                  autoPublishedCount++;
                }
              }

              // Insert to Supabase DB
              await supabaseAdmin
                .from("reviews")
                .insert([{
                  id: reviewItem.reviewId,
                  client_id: client.id,
                  reviewer_name: reviewItem.reviewer.displayName,
                  reviewer_photo_url: reviewItem.reviewer.profilePhotoUrl,
                  rating,
                  comment,
                  reply_draft: replyDraft,
                  status,
                  created_at: new Date(reviewItem.createTime).toISOString(),
                  replied_at: repliedAt
                }]);

              totalSynced++;
            }
          }
        } catch (e) {
          console.error(`Error syncing reviews for client ${client.name}:`, e);
        }
      } 
      // B. Handle Simulation (Mock Accounts or forceSimulate query)
      else {
        // If forceSimulate or just to populate reviews for Room 21 on sync trigger
        console.log(`Running simulated review poll for client: ${client.name}`);
        
        // Randomly simulate a new review with 30% chance
        if (Math.random() < 0.3 || forceSimulate) {
          const mockComments = [
            { rating: 5, comment: "El servicio en ROOM 21 es insuperable. Me corté el pelo con Marc y realmente entendió lo que quería. Un fade perfecto." },
            { rating: 5, comment: "Súper contento con mi barba perfilada con navaja. Muy detallistas y el ambiente es de 10." },
            { rating: 3, comment: "Buen corte de pelo pero tuve que esperar 15 minutos en el sofá antes de que me atendieran." },
            { rating: 2, comment: "El degradado no quedó muy simétrico y el precio me parece elevado para el servicio." }
          ];
          
          const selected = mockComments[Math.floor(Math.random() * mockComments.length)];
          
          // Check if we already have this review to avoid duplicates
          const mockId = `rev-mock-${Date.now()}`;
          const replyDraft = await generateAIResponse(client.name, client.custom_prompt, selected.rating, selected.comment);
          
          const isAuto = client.auto_mode === 'auto' && selected.rating >= 4;
          const status = isAuto ? 'published' : 'pending';
          
          await supabaseAdmin
            .from("reviews")
            .insert([{
              id: mockId,
              client_id: client.id,
              reviewer_name: ["Miguel Angel", "Javier Gomez", "Sarah Connor", "Alex Martinez"][Math.floor(Math.random() * 4)],
              reviewer_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
              rating: selected.rating,
              comment: selected.comment,
              reply_draft: replyDraft,
              status,
              created_at: new Date().toISOString(),
              replied_at: isAuto ? new Date().toISOString() : null
            }]);
            
          totalSynced++;
          if (isAuto) autoPublishedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      syncedReviewsCount: totalSynced,
      autoPublishedCount: autoPublishedCount
    });

  } catch (error: any) {
    console.error("Error running review sync job:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
