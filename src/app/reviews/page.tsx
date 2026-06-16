"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquareReply, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { Review } from "@/lib/mockData";
import ReviewModal from "@/components/ReviewModal";

export default function ReviewsPage() {
  const { reviews, clients, isLoading } = useApp();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'ignored'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-muted-foreground font-medium">Chargement des avis...</span>
        </div>
      </div>
    );
  }

  // Apply filters
  const filteredReviews = reviews.filter(review => {
    const client = clients.find(c => c.id === review.clientId);
    const matchesSearch = 
      review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' ? true : review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' ? true : review.rating === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Modération en direct</span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">Avis Réceptionnés</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Consultez, modifiez et validez les réponses automatiques générées par l'IA.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-card/30 border border-border/80 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, rédacteur, mot clé..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
        </div>

        {/* Filters Select */}
        <div className="flex flex-wrap gap-3">
          {/* Status filter */}
          <div className="flex bg-muted/40 p-1 rounded-xl border border-border/60">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'pending', label: 'En attente' },
              { id: 'published', label: 'Publiés' },
              { id: 'ignored', label: 'Ignorés' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stars filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-xl bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground hover:text-foreground transition-colors"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">5 Étoiles</option>
            <option value="4">4 Étoiles</option>
            <option value="3">3 Étoiles</option>
            <option value="2">2 Étoiles</option>
            <option value="1">1 Étoile</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-card/20 border border-border/60 rounded-2xl">
          <MessageSquare size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-bold text-sm text-foreground/80">Aucun avis trouvé</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ajustez vos filtres ou générez des avis via le simulateur du tableau de bord.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.map((review) => {
            const client = clients.find(c => c.id === review.clientId);
            return (
              <motion.div
                key={review.id}
                layoutId={`card-${review.id}`}
                className="glass-card glow-card p-6 rounded-2xl flex flex-col justify-between space-y-4"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {client?.logo || "IN"}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm truncate max-w-[180px]">{client?.name || "Inconnu"}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-foreground/80 font-medium">{review.reviewerName}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    review.status === 'published' 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : review.status === 'ignored'
                      ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {review.status === 'published' ? "Publié" : review.status === 'ignored' ? "Ignoré" : "En attente"}
                  </span>
                </div>

                {/* Content body */}
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? "fill-amber-400 stroke-amber-500"
                            : "fill-none stroke-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/90 line-clamp-3 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                {/* AI Draft summary */}
                {review.replyDraft && (
                  <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      <Sparkles size={11} />
                      {review.status === 'published' ? 'Réponse publiée :' : 'Brouillon IA :'}
                    </span>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {review.replyDraft}
                    </p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar size={12} />
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </span>

                  <button
                    onClick={() => setSelectedReview(review)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    {review.status === 'pending' ? "Traiter l'avis" : "Consulter"}
                    <ChevronRight size={14} />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Moderation Overlay */}
      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />
    </div>
  );
}
