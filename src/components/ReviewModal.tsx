"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Check, Eye, Send, Sparkles, AlertTriangle } from "lucide-react";
import { Review, Client } from "@/lib/mockData";
import { useApp } from "@/app/context/AppContext";

interface ReviewModalProps {
  review: Review | null;
  onClose: () => void;
}

export default function ReviewModal({ review, onClose }: ReviewModalProps) {
  const { clients, publishReview, ignoreReview } = useApp();
  const [replyText, setReplyText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Sync draft text when review changes
  useEffect(() => {
    if (review) {
      setReplyText(review.replyDraft || "");
      setPublishSuccess(false);
      setIsPublishing(false);
    }
  }, [review]);

  if (!review) return null;

  const client = clients.find((c) => c.id === review.clientId);

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    publishReview(review.id, replyText);
    setIsPublishing(false);
    setPublishSuccess(true);
    // Close modal after success animation
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleIgnore = () => {
    ignoreReview(review.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card border border-border/80 shadow-2xl z-10 glow-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 p-6 bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Modération d'Avis</h3>
                <p className="text-xs text-muted-foreground">
                  Établissement : <span className="font-medium text-foreground">{client?.name || "Inconnu"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Original Review Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Avis d'origine
                </span>
                <span className="text-xs text-muted-foreground">
                  Recu le {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {review.reviewerPhotoUrl ? (
                      <img
                        src={review.reviewerPhotoUrl}
                        alt={review.reviewerName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-sm">{review.reviewerName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={
                          i < review.rating
                            ? "fill-amber-400 stroke-amber-500"
                            : "fill-none stroke-muted-foreground/40"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/90 italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            </div>

            {/* AI Assistant Context Banner */}
            {client?.customPrompt && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">Consigne IA personnalisée appliquée :</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                    "{client.customPrompt}"
                  </p>
                </div>
              </div>
            )}

            {/* AI Response Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Réponse proposée par l'IA
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Modifiable librement avant publication
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full h-40 rounded-xl bg-background/50 border border-border p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none leading-relaxed"
                  placeholder="Écrivez votre réponse ici..."
                  disabled={isPublishing || publishSuccess}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border/60 p-6 bg-muted/10 flex items-center justify-between">
            <button
              onClick={handleIgnore}
              disabled={isPublishing || publishSuccess}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-500/80 hover:text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-lg transition-all disabled:opacity-50"
            >
              <AlertTriangle size={14} />
              Ignorer cet avis
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isPublishing || publishSuccess}
                className="px-4 py-2 text-xs font-semibold hover:bg-muted/80 rounded-lg border border-border transition-colors disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing || publishSuccess || !replyText.trim()}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-primary-foreground shadow-lg transition-all ${
                  publishSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 hover:shadow-amber-500/10"
                } disabled:opacity-50 min-w-[160px] justify-center`}
              >
                {isPublishing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Publication...
                  </>
                ) : publishSuccess ? (
                  <>
                    <Check size={16} />
                    Publié sur Google !
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Approuver & Publier
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
