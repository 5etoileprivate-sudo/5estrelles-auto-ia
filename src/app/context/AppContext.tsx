"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Client, 
  Review, 
  getAppState, 
  saveAppState, 
  updateReviewStatus, 
  updateClientSettings,
  addClient,
  simulateIncomingReview
} from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

interface AppContextType {
  clients: Client[];
  reviews: Review[];
  isLoading: boolean;
  publishReview: (reviewId: string, replyText: string) => void;
  ignoreReview: (reviewId: string) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addNewClient: (name: string, placeId: string, locationId: string, autoMode: 'auto' | 'manual', customPrompt: string) => void;
  triggerNewReview: (clientId: string, rating: number, comment: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ clients: Client[]; reviews: Review[] }>({
    clients: [],
    reviews: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load state on mount: Try Supabase first, fallback to localStorage
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
      
      if (!isPlaceholder) {
        try {
          // Fetch clients from Supabase
          const { data: clientsData, error: clientsError } = await supabase
            .from("clients")
            .select("*")
            .order("name", { ascending: true });
            
          // Fetch reviews from Supabase
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });
            
          if (!clientsError && !reviewsError && clientsData) {
            const mappedClients = clientsData.map((c: any) => ({
              id: c.id,
              name: c.name,
              logo: c.logo || c.name.split(' ').map((w: any) => w[0]).join('').substring(0, 2).toUpperCase(),
              placeId: c.place_id,
              locationId: c.google_location_id || "",
              accountId: c.google_account_id || "",
              autoMode: c.auto_mode || "manual",
              customPrompt: c.custom_prompt || "",
              googleConnected: !!c.google_refresh_token,
              googleAccountName: c.google_refresh_token ? "Compte lié" : ""
            }));
            
            const mappedReviews = (reviewsData || []).map((r: any) => ({
              id: r.id,
              clientId: r.client_id,
              reviewerName: r.reviewer_name,
              reviewerPhotoUrl: r.reviewer_photo_url,
              rating: r.rating,
              comment: r.comment || "",
              replyDraft: r.reply_draft || "",
              status: r.status || "pending",
              createdAt: r.created_at,
              repliedAt: r.replied_at
            }));

            // If completely empty database, insert ROOM 21 automatically
            if (mappedClients.length === 0) {
              const { data: inserted, error: insertError } = await supabase
                .from("clients")
                .insert([{
                  name: "ROOM 21",
                  logo: "R2",
                  place_id: "ChIJR5aJaxSjpBIRyew2zmpJSh0",
                  google_location_id: "locations/loc-room-21",
                  google_account_id: "accounts/acc-5estrelles-agency",
                  auto_mode: "manual",
                  custom_prompt: "ROOM 21 es una barbería de diseño en Barcelona enfocada en corte fade, a navaja y rituels tradicionales. Responde siempre en el mismo idioma que el cliente (español, catalán, inglés, etc.). Sé elegante, dinámico y agradecido."
                }])
                .select();
                
              if (!insertError && inserted) {
                init();
                return;
              }
            } else {
              setState({ clients: mappedClients, reviews: mappedReviews });
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Supabase load failed, falling back to localStorage", e);
        }
      }
      
      // LocalStorage Fallback (also inject Room 21 by default if empty)
      const loaded = getAppState();
      const hasRoom21 = loaded.clients.some(c => c.name === "ROOM 21");
      if (!hasRoom21) {
        const room21Client = {
          id: "client-room21",
          name: "ROOM 21",
          logo: "R2",
          placeId: "ChIJR5aJaxSjpBIRyew2zmpJSh0",
          locationId: "locations/loc-room-21",
          accountId: "accounts/acc-5estrelles-agency",
          autoMode: "manual" as const,
          customPrompt: "ROOM 21 es una barbería de diseño en Barcelona enfocada en corte fade, a navaja y rituels tradicionales. Responde siempre en el mismo idioma que el cliente (español, catalán, inglés, etc.). Sé elegante, dinámico y agradecido.",
          googleConnected: false,
          googleAccountName: ""
        };
        const updatedClients = [room21Client];
        const updatedReviews = [
          {
            id: "rev-r21-1",
            clientId: "client-room21",
            reviewerName: "Carlos Menendez",
            reviewerPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
            rating: 5,
            comment: "El mejor corte degradado de Barcelona. La atención de Marc es impecable, te asesora de verdad y el ritual de la toalla caliente es espectacular. 100% recomendable.",
            replyDraft: "Hola Carlos, ¡muchas gracias por tu comentario! Nos alegra mucho saber que disfrutaste del degradado y del ritual de toalla caliente con Marc. En ROOM 21 nos esforzamos para que cada visita sea una gran experiencia. ¡Esperamos verte pronto de nuevo por el salón!",
            status: "published" as const,
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            repliedAt: new Date(Date.now() - 1.9 * 3600000).toISOString()
          },
          {
            id: "rev-r21-2",
            clientId: "client-room21",
            reviewerName: "John Smith",
            rating: 4,
            comment: "Great haircut, very professional barbers. The music and style of the shop are top-notch. Took a bit longer than scheduled but the result was perfect.",
            replyDraft: "Hi John, thank you very much for your feedback! We are thrilled to hear you liked the haircut and the shop's vibe. We appreciate your patience with the timing and will work to keep it prompt. Hope to see you back in the chair soon!",
            status: "pending" as const,
            createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
          }
        ];
        
        saveAppState({ clients: updatedClients, reviews: updatedReviews });
        setState({ clients: updatedClients, reviews: updatedReviews });
      } else {
        setState(loaded);
      }
      setIsLoading(false);
    }
    
    init();
  }, []);

  const publishReview = async (reviewId: string, replyText: string) => {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (!isPlaceholder) {
      try {
        const { error } = await supabase
          .from("reviews")
          .update({ 
            status: 'published', 
            reply_draft: replyText, 
            replied_at: new Date().toISOString() 
          })
          .eq("id", reviewId);
          
        if (!error) {
          setState(prev => ({
            ...prev,
            reviews: prev.reviews.map(r => r.id === reviewId ? { 
              ...r, 
              status: 'published', 
              replyDraft: replyText, 
              repliedAt: new Date().toISOString() 
            } : r)
          }));
          return;
        }
      } catch (e) {
        console.error("Supabase update failed, falling back to localStorage", e);
      }
    }
    
    const updatedReviews = updateReviewStatus(reviewId, 'published', replyText);
    setState(prev => ({ ...prev, reviews: updatedReviews }));
  };

  const ignoreReview = async (reviewId: string) => {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (!isPlaceholder) {
      try {
        const { error } = await supabase
          .from("reviews")
          .update({ status: 'ignored' })
          .eq("id", reviewId);
          
        if (!error) {
          setState(prev => ({
            ...prev,
            reviews: prev.reviews.map(r => r.id === reviewId ? { ...r, status: 'ignored' } : r)
          }));
          return;
        }
      } catch (e) {
        console.error("Supabase ignore failed, falling back to localStorage", e);
      }
    }
    
    const updatedReviews = updateReviewStatus(reviewId, 'ignored');
    setState(prev => ({ ...prev, reviews: updatedReviews }));
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (!isPlaceholder) {
      try {
        // Map keys to DB snake_case columns
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.autoMode !== undefined) dbUpdates.auto_mode = updates.autoMode;
        if (updates.customPrompt !== undefined) dbUpdates.custom_prompt = updates.customPrompt;
        if (updates.placeId !== undefined) dbUpdates.place_id = updates.placeId;
        if (updates.locationId !== undefined) dbUpdates.google_location_id = updates.locationId;
        if (updates.googleConnected !== undefined && !updates.googleConnected) {
          dbUpdates.google_refresh_token = null;
          dbUpdates.google_access_token = null;
          dbUpdates.google_token_expires_at = null;
        }

        const { error } = await supabase
          .from("clients")
          .update(dbUpdates)
          .eq("id", clientId);
          
        if (!error) {
          setState(prev => ({
            ...prev,
            clients: prev.clients.map(c => c.id === clientId ? { ...c, ...updates } : c)
          }));
          return;
        }
      } catch (e) {
        console.error("Supabase client update failed, falling back to localStorage", e);
      }
    }
    
    const updatedClients = updateClientSettings(clientId, updates);
    setState(prev => ({ ...prev, clients: updatedClients }));
  };

  const addNewClient = async (name: string, placeId: string, locationId: string, autoMode: 'auto' | 'manual', customPrompt: string) => {
    const logo = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (!isPlaceholder) {
      try {
        const { data, error } = await supabase
          .from("clients")
          .insert([{
            name,
            logo,
            place_id: placeId,
            google_location_id: locationId,
            google_account_id: "accounts/acc-5estrelles-agency",
            auto_mode: autoMode,
            custom_prompt: customPrompt
          }])
          .select();
          
        if (!error && data) {
          const newC: Client = {
            id: data[0].id,
            name,
            logo,
            placeId,
            locationId,
            accountId: "accounts/acc-5estrelles-agency",
            autoMode,
            customPrompt,
            googleConnected: false,
            googleAccountName: ""
          };
          setState(prev => ({ ...prev, clients: [...prev.clients, newC] }));
          return;
        }
      } catch (e) {
        console.error("Supabase add client failed, falling back to localStorage", e);
      }
    }

    const updatedClients = addClient({
      name,
      logo,
      placeId,
      locationId,
      accountId: "accounts/acc-5estrelles-agency",
      autoMode,
      customPrompt
    });
    setState(prev => ({ ...prev, clients: updatedClients }));
  };

  const triggerNewReview = async (clientId: string, rating: number, comment: string) => {
    const generateReplyMock = (client: Client, rat: number, comm: string) => {
      if (rat >= 4) {
        return `Hola, ¡muchas gracias por tu reseña sobre ROOM 21! Nos encanta saber que has disfrutado del servicio y el ambiente. Estilo y precisión es lo que nos define. ¡Esperamos verte pronto de nuevo en el salón! Un saludo.`;
      } else {
        return `Hola, lamentamos mucho leer que tu experiencia no ha sido de tu total agrado. En ROOM 21 cuidamos cada detalle y nos gustaría hablar contigo para entender qué ha fallado y cómo podemos solucionarlo. Escríbenos directamente. Un saludo.`;
      }
    };

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (!isPlaceholder) {
      try {
        const client = state.clients.find(c => c.id === clientId);
        if (client) {
          const replyDraft = generateReplyMock(client, rating, comment);
          const isAuto = client.autoMode === 'auto' && rating >= 4;
          const status = isAuto ? 'published' : 'pending';
          const newId = `rev-${Date.now()}`;

          const { error } = await supabase
            .from("reviews")
            .insert([{
              id: newId,
              client_id: clientId,
              reviewer_name: ["Marc Antoine", "Camille Leroux", "David Dupont", "Elsa Pires", "Gilles Vart"][Math.floor(Math.random() * 5)],
              reviewer_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
              rating,
              comment,
              reply_draft: replyDraft,
              status,
              created_at: new Date().toISOString(),
              replied_at: isAuto ? new Date().toISOString() : null
            }]);

          if (!error) {
            // Reload context reviews
            const { data: reviewsData } = await supabase
              .from("reviews")
              .select("*")
              .order("created_at", { ascending: false });
              
            if (reviewsData) {
              const mappedReviews = reviewsData.map((r: any) => ({
                id: r.id,
                clientId: r.client_id,
                reviewerName: r.reviewer_name,
                reviewerPhotoUrl: r.reviewer_photo_url,
                rating: r.rating,
                comment: r.comment || "",
                replyDraft: r.reply_draft || "",
                status: r.status || "pending",
                createdAt: r.created_at,
                repliedAt: r.replied_at
              }));
              setState(prev => ({ ...prev, reviews: mappedReviews }));
              return;
            }
          }
        }
      } catch (e) {
        console.error("Supabase insert review failed, falling back to localStorage", e);
      }
    }

    const result = simulateIncomingReview(clientId, rating, comment, generateReplyMock);
    setState(prev => ({
      ...prev,
      reviews: result.reviews
    }));
  };

  return (
    <AppContext.Provider value={{
      clients: state.clients,
      reviews: state.reviews,
      isLoading,
      publishReview,
      ignoreReview,
      updateClient,
      addNewClient,
      triggerNewReview
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
