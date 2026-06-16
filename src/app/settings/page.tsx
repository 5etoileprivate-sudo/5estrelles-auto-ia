"use client";

import React, { useState } from "react";
import { 
  Sliders, 
  Settings, 
  KeyRound, 
  Brain, 
  RefreshCw, 
  Check, 
  Sparkles, 
  AlertTriangle,
  Info
} from "lucide-react";
import { INITIAL_CLIENTS, INITIAL_REVIEWS } from "@/lib/mockData";

export default function SettingsPage() {
  const [model, setModel] = useState("gpt-4o");
  const [globalPrompt, setGlobalPrompt] = useState(
    "Vous êtes un assistant IA chargé de rédiger des réponses professionnelles pour des avis Google Maps. Soyez toujours poli, courtois, synthétique (maximum 3-4 phrases) et adaptez votre ton selon les consignes spécifiques de l'établissement."
  );
  const [clientId, setClientId] = useState("5estrelles-app-client-id.apps.googleusercontent.com");
  const [clientSecret, setClientSecret] = useState("••••••••••••••••••••••••••••••••");
  
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDone, setSaveDone] = useState(false);

  const handleResetData = () => {
    setIsResetting(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const initialState = { clients: INITIAL_CLIENTS, reviews: INITIAL_REVIEWS };
        localStorage.setItem('5estrelles_auto_ia_data', JSON.stringify(initialState));
      }
      setIsResetting(false);
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2000);
      window.location.reload(); // Reload to refresh state
    }, 1200);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveDone(true);
      setTimeout(() => setSaveDone(false), 2000);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Préférences</span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">Configuration</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ajustez les paramètres de l'IA, les clés d'API Google Cloud et le comportement général.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settings forms - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* OpenAI/Claude Settings */}
            <div className="glass-card glow-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Brain size={18} className="text-primary" />
                <h3 className="font-bold text-sm">Intelligence Artificielle</h3>
              </div>

              <div className="space-y-4">
                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Modèle LLM</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="gpt-4o">OpenAI GPT-4o (Recommandé - Rapide & Précis)</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Économique)</option>
                    <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Qualité supérieure)</option>
                    <option value="gemini-1-5-pro">Google Gemini 1.5 Pro (Excellent contexte)</option>
                  </select>
                </div>

                {/* Global Prompt Instruction */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consigne système globale (System Prompt)</label>
                  <textarea
                    value={globalPrompt}
                    onChange={(e) => setGlobalPrompt(e.target.value)}
                    className="w-full h-32 rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed text-foreground"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Cette consigne s'applique à tous les établissements avant d'injecter leurs contextes locaux individuels.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Cloud API Settings */}
            <div className="glass-card glow-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <KeyRound size={18} className="text-primary" />
                <h3 className="font-bold text-sm">Clés de l'API Google Cloud</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">OAuth Client ID</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">OAuth Client Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
                <Info size={14} className="shrink-0 text-primary mt-0.5" />
                <span>
                  Clés OAuth 2.0 générées sur la Google Cloud Console avec la <strong>Google Business Profile API</strong> activée.
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving || saveDone}
              className="py-2.5 px-6 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/10 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sauvegarde en cours...
                </>
              ) : saveDone ? (
                <>
                  <Check size={14} />
                  Préférences enregistrées !
                </>
              ) : (
                <>
                  <Settings size={14} />
                  Enregistrer les configurations
                </>
              )}
            </button>
            
          </form>
        </div>

        {/* Danger zone / Reset column */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-rose-500">
            <AlertTriangle size={18} />
            Zone de Maintenance
          </h3>

          <div className="glass-card glow-card p-6 rounded-2xl border border-rose-500/10 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-500/90">Réinitialiser l'application</h4>
              <p className="text-xs text-muted-foreground">
                Cette action supprimera toutes vos modifications (établissements ajoutés, réponses validées) et rechargera les données de simulation initiales.
              </p>
            </div>

            <button
              onClick={handleResetData}
              disabled={isResetting || resetDone}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Réinitialisation...
                </>
              ) : resetDone ? (
                <>
                  <Check size={14} />
                  Réinitialisé avec succès !
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Réinitialiser les données fictives
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
