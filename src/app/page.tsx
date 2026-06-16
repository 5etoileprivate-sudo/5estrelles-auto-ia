"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquareCode, 
  Clock, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Send, 
  Building2, 
  MessageSquare,
  HelpCircle,
  Plus
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { Review } from "@/lib/mockData";
import ReviewModal from "@/components/ReviewModal";

export default function DashboardPage() {
  const { clients, reviews, triggerNewReview, isLoading } = useApp();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // States for the review simulator
  const [simClientId, setSimClientId] = useState("");
  const [simRating, setSimRating] = useState(5);
  const [simComment, setSimComment] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync simulator client selection on loading complete
  React.useEffect(() => {
    if (clients.length > 0 && !simClientId) {
      setSimClientId(clients[0].id);
    }
  }, [clients, simClientId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-muted-foreground font-medium">Chargement des données...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const publishedReviews = reviews.filter(r => r.status === 'published').length;
  
  const autoRepliedReviews = reviews.filter(r => {
    const client = clients.find(c => c.id === r.clientId);
    return r.status === 'published' && client?.autoMode === 'auto';
  }).length;
  
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";

  const autoRate = totalReviews > 0 
    ? Math.round((autoRepliedReviews / totalReviews) * 100) 
    : 0;

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simClientId || !simComment.trim()) return;

    setIsSimulating(true);
    // Add small delay to feel like a real network call
    setTimeout(() => {
      triggerNewReview(simClientId, simRating, simComment);
      setSimComment("");
      setIsSimulating(false);
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Vue d'ensemble</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Tableau de bord</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Suivi des avis de vos clients et automatisation des réponses IA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Synchronisation active (Simulée)</span>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {/* Total Reviews Card */}
        <motion.div variants={itemVariants} className="glass-card glow-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Avis</span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalReviews}</span>
            <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">+100%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Avis importés sur tous les établissements</p>
        </motion.div>

        {/* Auto Reply Rate Card */}
        <motion.div variants={itemVariants} className="glass-card glow-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taux d'Auto-Réponse</span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquareCode size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{autoRate}%</span>
            <span className="text-xs text-muted-foreground font-medium">{autoRepliedReviews} avis auto</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Réponses 4-5★ publiées directement par l'IA</p>
        </motion.div>

        {/* Pending Moderation Card */}
        <motion.div variants={itemVariants} className="glass-card glow-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En Attente</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={18} className={pendingReviews > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{pendingReviews}</span>
            {pendingReviews > 0 ? (
              <span className="text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full animate-bounce">
                À traiter
              </span>
            ) : (
              <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                À jour
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Avis manuels ou 1-3★ nécessitant relecture</p>
        </motion.div>

        {/* Average Stars Card */}
        <motion.div variants={itemVariants} className="glass-card glow-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note Moyenne</span>
            <div className="h-9 w-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Star size={18} className="fill-yellow-500/20" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{avgRating}</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.round(Number(avgRating)) ? "fill-yellow-500 stroke-yellow-600" : "fill-none stroke-muted-foreground/30"} 
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Moyenne pondérée des établissements connectés</p>
        </motion.div>
      </motion.div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Moderation Queue - 2 cols width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              File de modération récente
            </h3>
            <span className="text-xs text-muted-foreground">{reviews.filter(r => r.status === 'pending').length} en attente</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/30 backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                    <th className="p-4">Établissement</th>
                    <th className="p-4">Avis Client</th>
                    <th className="p-4 text-center">Note</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Aucun avis reçu pour l'instant. Utilisez le simulateur à droite pour en générer un.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => {
                      const client = clients.find(c => c.id === review.clientId);
                      return (
                        <tr key={review.id} className="hover:bg-muted/15 transition-colors group">
                          {/* Establishment name */}
                          <td className="p-4 font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-xs text-primary font-bold border border-border">
                                {client?.logo || "IN"}
                              </span>
                              <span className="truncate max-w-[120px]">{client?.name || "Inconnu"}</span>
                            </div>
                          </td>
                          {/* Review Details */}
                          <td className="p-4 max-w-xs">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs text-foreground/80">{review.reviewerName}</span>
                              <span className="text-xs text-muted-foreground truncate italic mt-0.5">
                                "{review.comment}"
                              </span>
                            </div>
                          </td>
                          {/* Stars */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  className={i < review.rating ? "fill-amber-400 stroke-amber-500" : "fill-none stroke-muted-foreground/30"} 
                                />
                              ))}
                            </div>
                          </td>
                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              review.status === 'published' 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : review.status === 'ignored'
                                ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${
                                review.status === 'published' ? "bg-emerald-500" : review.status === 'ignored' ? "bg-zinc-400" : "bg-amber-500"
                              }`} />
                              {review.status === 'published' ? "Publié" : review.status === 'ignored' ? "Ignoré" : "En attente"}
                            </span>
                          </td>
                          {/* Action Button */}
                          <td className="p-4 text-right">
                            {review.status === 'pending' ? (
                              <button
                                onClick={() => setSelectedReview(review)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/10 hover:bg-primary-hover active:scale-95 transition-all"
                              >
                                Modérer
                                <ChevronRight size={12} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedReview(review)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-muted/40 hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
                              >
                                Consulter
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Review Simulator Widget - 1 col width */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            Simulateur d'Avis Google
          </h3>

          <div className="glass-card glow-card p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Injecteur d'avis en direct</h4>
              <p className="text-xs text-muted-foreground">
                Générez un faux avis Google pour voir comment l'IA réagit en direct selon le mode configuré (Auto ou Manuel).
              </p>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Établissement cible</label>
                <select
                  value={simClientId}
                  onChange={(e) => setSimClientId(e.target.value)}
                  className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  required
                >
                  <option value="" disabled>Sélectionner un client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.autoMode === 'auto' ? 'Mode Auto 4-5★' : 'Mode Manuel'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Note (Étoiles)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSimRating(star)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        simRating === star
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {star}
                      <Star size={10} className={simRating === star ? "fill-primary-foreground" : ""} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commentaire client</label>
                <textarea
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  placeholder="Ex: Super accueil, le personnel était parfait et le service très rapide. Merci !"
                  className="w-full h-24 rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  required
                />
              </div>

              {/* Trigger Button */}
              <button
                type="submit"
                disabled={isSimulating || !simComment.trim() || !simClientId}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-primary-foreground shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isSimulating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Simulation en cours...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Simuler la réception
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Moderate/Review Modal */}
      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />
    </div>
  );
}
