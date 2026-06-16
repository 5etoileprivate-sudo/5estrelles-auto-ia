import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { clientName, clientPrompt, rating, comment } = await req.json();

    if (!clientName || !rating || comment === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if Gemini key is not set or placeholder
    if (!apiKey || apiKey.includes("your_gemini_api_key_here")) {
      console.log("GEMINI_API_KEY is not configured, returning simulated response");
      
      const simulatedReply = rating >= 4
        ? `Hola, ¡muchas gracias por tu reseña sobre ${clientName}! Nos encanta saber que has disfrutado del servicio y el ambiente. Estilo y precisión es lo que nos define. ¡Esperamos verte pronto de nuevo en el salón! Un saludo.`
        : `Hola, lamentamos mucho leer que tu experiencia no ha sido de tu total agrado en ${clientName}. En nuestro salón cuidamos cada detalle y nos gustaría hablar contigo para entender qué ha fallado y cómo podemos solucionarlo. Escríbenos directamente. Un saludo.`;
        
      return NextResponse.json({ reply: simulatedReply });
    }

    // Gemini 1.5 Flash System and User Prompt definition
    const systemInstruction = `Vous êtes un assistant IA de 5estrelles.com chargé de répondre de façon professionnelle et polie aux avis de l'établissement "${clientName}".
Vous devez IMPÉRATIVEMENT répondre dans la même langue que celle utilisée par l'auteur de l'avis (Espagnol, Catalan, Anglais, Français, etc.).
Consigne de style globale : Soyez chaleureux, court (3 à 4 phrases maximum), poli, et mentionnez le nom de l'établissement de temps en temps.
Consignes spécifiques de l'établissement : "${clientPrompt || 'Ton professionnel et courtois.'}"`;

    const userMessage = `Veuillez générer la réponse optimale pour cet avis Google :
Note donnée : ${rating} / 5 étoiles
Commentaire du client : "${comment}"`;

    const fullPrompt = `${systemInstruction}\n\n${userMessage}`;

    // Call Google Gemini 1.5 Flash API (Free Tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Gemini API error:", data.error || data);
      return NextResponse.json({ error: data.error?.message || "Failed to query Gemini API" }, { status: response.status || 500 });
    }

    // Extract text from Gemini structure
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error generating Gemini AI response:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
