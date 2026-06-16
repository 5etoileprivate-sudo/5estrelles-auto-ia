export interface Client {
  id: string;
  name: string;
  logo: string;
  placeId: string;
  locationId: string;
  accountId: string;
  autoMode: 'auto' | 'manual';
  customPrompt: string;
  googleConnected: boolean;
  googleAccountName: string;
}

export interface Review {
  id: string;
  clientId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  comment: string;
  replyDraft?: string;
  status: 'pending' | 'published' | 'ignored';
  createdAt: string;
  repliedAt?: string;
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "client-1",
    name: "Le Bistrot Gourmand",
    logo: "BG",
    placeId: "ChIJuQ2M5m5v5kcR0Bq6vV_bQcI",
    locationId: "locations/loc-bistrot-gourmand",
    accountId: "accounts/acc-5estrelles-agency",
    autoMode: "auto",
    customPrompt: "Bistrot traditionnel parisien proposant des plats faits maison avec des produits locaux de saison. Le ton des réponses doit être extrêmement chaleureux, gourmet et poli. Remercie toujours chaleureusement le client et invite-le à revenir goûter nos nouvelles suggestions de saison.",
    googleConnected: true,
    googleAccountName: "esteban@5estrelles.com"
  },
  {
    id: "client-2",
    name: "Garage Auto Perf 92",
    logo: "AP",
    placeId: "ChIJs1xQvYtv5kcR7sX9m6vLccU",
    locationId: "locations/loc-auto-perf-92",
    accountId: "accounts/acc-5estrelles-agency",
    autoMode: "manual",
    customPrompt: "Garage automobile indépendant spécialisé en entretien, mécanique de précision et réparation toutes marques. Le ton doit être très professionnel, rassurant et axé sur la sécurité, la rapidité et la transparence des tarifs. Mentionne l'importance de la satisfaction client pour notre équipe familiale.",
    googleConnected: true,
    googleAccountName: "esteban@5estrelles.com"
  },
  {
    id: "client-3",
    name: "L'Écrin de Beauté & Spa",
    logo: "EB",
    placeId: "ChIJ7TqXkQpv5kcRl4c486PzQc8",
    locationId: "locations/loc-ecrin-beaute-spa",
    accountId: "accounts/acc-5estrelles-agency",
    autoMode: "auto",
    customPrompt: "Spa de jour haut de gamme proposant des soins du visage holistiques, des massages du monde et des rituels de relaxation. Le ton doit être apaisant, raffiné, empathique et propice à la détente. Utilise un vocabulaire axé sur le bien-être, la sérénité et le voyage sensoriel.",
    googleConnected: false,
    googleAccountName: ""
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    clientId: "client-1",
    reviewerName: "Jean-Pierre Dupuis",
    reviewerPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
    rating: 5,
    comment: "Une expérience incroyable ! L'entrecôte était cuite à la perfection et la sauce au poivre maison est un pur délice. Le service est rapide et le serveur était d'une gentillesse remarquable. Nous reviendrons sans hésiter !",
    replyDraft: "Bonjour Jean-Pierre, Un grand merci pour ce superbe retour ! Nous sommes ravis que notre entrecôte maison et sa sauce au poivre aient régalé vos papilles. C'est un plaisir de lire que notre équipe a su rendre votre moment agréable par son service. Nous avons hâte de vous accueillir à nouveau pour vous faire découvrir nos suggestions de saison ! À très bientôt au Bistrot !",
    status: "published",
    createdAt: "2026-06-16T12:30:00Z",
    repliedAt: "2026-06-16T12:35:00Z"
  },
  {
    id: "rev-2",
    clientId: "client-1",
    reviewerName: "Sophie Martin",
    reviewerPhotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
    rating: 4,
    comment: "Très bon repas en terrasse. Les desserts sont excellents, surtout la tarte tatin réinventée ! Seul petit bémol, le pain a mis un peu de temps à arriver sur table. Mais l'ambiance générale est super.",
    replyDraft: "Bonjour Sophie, Merci beaucoup pour votre visite et d'avoir pris le temps de partager votre avis. Nous sommes enchantés que vous ayez apprécié notre terrasse et notre fameuse tarte tatin réinventée ! Nous prenons note pour le service du pain afin de nous améliorer. Au plaisir de vous revoir bientôt pour une autre parenthèse gourmande !",
    status: "pending",
    createdAt: "2026-06-16T14:15:00Z"
  },
  {
    id: "rev-3",
    clientId: "client-2",
    reviewerName: "Marc Lambert",
    reviewerPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    rating: 5,
    comment: "Changement de plaquettes de frein effectué ce matin. Équipe très pro, tarif conforme au devis et voiture rendue impeccable et lavée ! Merci pour votre sérieux, je recommande vivement ce garage.",
    replyDraft: "Bonjour Marc, Merci d'avoir partagé votre expérience avec notre garage. Nous sommes ravis d'avoir pu procéder à l'entretien de vos freins en toute transparence et avec professionnalisme. Offrir un véhicule propre fait partie de nos engagements de service ! Merci pour votre recommandation et roulez en toute sécurité. L'équipe d'Auto Perf 92.",
    status: "pending",
    createdAt: "2026-06-16T10:00:00Z"
  },
  {
    id: "rev-4",
    clientId: "client-2",
    reviewerName: "Nicolas Roux",
    rating: 2,
    comment: "Déçu par la prestation. Je suis venu pour un bruit suspect, on m'a facturé un diagnostic mais le bruit est toujours là après réparation. De plus, j'ai attendu 30 minutes de plus que prévu pour récupérer ma voiture sans excuses.",
    replyDraft: "Bonjour Nicolas, Nous regrettons sincèrement votre déception. La persistance de ce bruit et l'attente prolongée ne reflètent pas notre standard de qualité. Nous vous invitons à nous recontacter directement au garage ou à repasser afin que notre chef d'atelier examine à nouveau votre véhicule gratuitement et résolve ce problème au plus vite. Votre sécurité et votre satisfaction sont nos priorités. Cordialement, Le Responsable Clientèle.",
    status: "pending",
    createdAt: "2026-06-15T16:45:00Z"
  },
  {
    id: "rev-5",
    clientId: "client-3",
    reviewerName: "Amélie Dubois",
    reviewerPhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
    rating: 5,
    comment: "Un moment de pure détente. Le massage signature d'1h30 était divin, les huiles sentent extrêmement bon et la tisane offerte à la fin dans le salon de repos prolonge parfaitement l'expérience. Le personnel est aux petits soins.",
    replyDraft: "Bonjour Amélie, Quel bonheur de lire votre retour ! Nous sommes enchantés que notre massage signature et notre espace détente vous aient offert cette bulle de bien-être et de sérénité. C'est notre plus belle récompense d'accompagner vos moments de relaxation. Au plaisir de vous ouvrir à nouveau les portes de notre écrin sensoriel ! Douce journée.",
    status: "published",
    createdAt: "2026-06-15T09:30:00Z",
    repliedAt: "2026-06-15T10:00:00Z"
  },
  {
    id: "rev-6",
    clientId: "client-3",
    reviewerName: "Lucas Girard",
    rating: 3,
    comment: "Le cadre est très beau et relaxant. Cependant, la cabine de soin manquait un peu de chauffage et le massage était un peu trop énergique à mon goût alors que j'avais demandé une formule douce de relaxation.",
    replyDraft: "Bonjour Lucas, Merci de votre retour d'expérience. Nous sommes heureux que le cadre vous ait plu, mais navrés d'apprendre que la température de la cabine et la pression du massage n'étaient pas optimales. Nous sensibilisons immédiatement notre équipe de praticiennes pour toujours mieux adapter le soin à vos attentes en cabine. Nous espérons regagner votre confiance lors d'un futur soin personnalisé. Bien cordialement.",
    status: "pending",
    createdAt: "2026-06-14T15:20:00Z"
  }
];

const LOCAL_STORAGE_KEY = '5estrelles_auto_ia_data';

interface AppState {
  clients: Client[];
  reviews: Review[];
}

export function getAppState(): AppState {
  if (typeof window === 'undefined') {
    return { clients: INITIAL_CLIENTS, reviews: INITIAL_REVIEWS };
  }
  
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) {
    const initialState = { clients: INITIAL_CLIENTS, reviews: INITIAL_REVIEWS };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading state, resetting", e);
    return { clients: INITIAL_CLIENTS, reviews: INITIAL_REVIEWS };
  }
}

export function saveAppState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}

export function updateReviewStatus(reviewId: string, status: 'published' | 'ignored', replyText?: string): Review[] {
  const state = getAppState();
  const updatedReviews = state.reviews.map(r => {
    if (r.id === reviewId) {
      return {
        ...r,
        status,
        replyDraft: replyText !== undefined ? replyText : r.replyDraft,
        repliedAt: status === 'published' ? new Date().toISOString() : undefined
      };
    }
    return r;
  });
  
  saveAppState({ ...state, reviews: updatedReviews });
  return updatedReviews;
}

export function updateClientSettings(clientId: string, updates: Partial<Client>): Client[] {
  const state = getAppState();
  const updatedClients = state.clients.map(c => {
    if (c.id === clientId) {
      return { ...c, ...updates };
    }
    return c;
  });
  
  saveAppState({ ...state, clients: updatedClients });
  return updatedClients;
}

export function addClient(newClient: Omit<Client, 'id' | 'googleConnected' | 'googleAccountName'>): Client[] {
  const state = getAppState();
  const client: Client = {
    ...newClient,
    id: `client-${Date.now()}`,
    googleConnected: false,
    googleAccountName: ""
  };
  
  const updatedClients = [...state.clients, client];
  saveAppState({ ...state, clients: updatedClients });
  return updatedClients;
}

export function simulateIncomingReview(clientId: string, rating: number, comment: string, generateReplyMockFn: (c: Client, rating: number, comment: string) => string): { reviews: Review[], newReview: Review } {
  const state = getAppState();
  const client = state.clients.find(c => c.id === clientId);
  if (!client) throw new Error("Client not found");

  const replyDraft = generateReplyMockFn(client, rating, comment);
  
  // Decide status based on rating + client autoMode
  const isAuto = client.autoMode === 'auto' && rating >= 4;
  const status = isAuto ? 'published' : 'pending';

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    clientId,
    reviewerName: ["Marc Antoine", "Camille Leroux", "David Dupont", "Elsa Pires", "Gilles Vart"][Math.floor(Math.random() * 5)],
    rating,
    comment,
    replyDraft,
    status,
    createdAt: new Date().toISOString(),
    repliedAt: isAuto ? new Date().toISOString() : undefined
  };

  const updatedReviews = [newReview, ...state.reviews];
  saveAppState({ ...state, reviews: updatedReviews });
  
  return { reviews: updatedReviews, newReview };
}
