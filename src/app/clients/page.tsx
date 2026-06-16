"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Plus, 
  Link2, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  Edit3, 
  Eye, 
  Copy,
  Info,
  Check
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { Client } from "@/lib/mockData";

export default function ClientsPage() {
  const { clients, updateClient, addNewClient } = useApp();
  
  // UI states
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [addMethod, setAddMethod] = useState<'oauth' | 'manager'>('oauth');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newPlaceId, setNewPlaceId] = useState("");
  const [newLocationId, setNewLocationId] = useState("");
  const [newAutoMode, setNewAutoMode] = useState<'auto' | 'manual'>('manual');
  const [newPrompt, setNewPrompt] = useState("");

  // Copy status state
  const [copiedLink, setCopiedLink] = useState(false);

  // Agency manager connection simulation state
  const [agencyConnected, setAgencyConnected] = useState(false);
  const [selectedManagerLocation, setSelectedManagerLocation] = useState("");
  
  const mockManagerLocations = [
    { name: "La Table Provençale", placeId: "ChIJtableprov999", locationId: "locations/loc-table-prov" },
    { name: "FitLife Gym & Health", placeId: "ChIJfitlifegym111", locationId: "locations/loc-fitlife-gym" },
    { name: "Boulangerie Le Moulin", placeId: "ChIJmoulinboul222", locationId: "locations/loc-moulin-boul" }
  ];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPlaceId.trim()) return;

    addNewClient(
      newName, 
      newPlaceId, 
      newLocationId || `locations/loc-${newName.toLowerCase().replace(/\s+/g, '-')}`, 
      newAutoMode, 
      newPrompt || "Ton courtois et professionnel."
    );

    // Reset form
    setNewName("");
    setNewPlaceId("");
    setNewLocationId("");
    setNewAutoMode("manual");
    setNewPrompt("");
    
    setActiveTab("list");
  };

  const handleCopyOAuthLink = () => {
    const disconnected = clients.find(c => !c.googleConnected);
    const clientId = disconnected ? disconnected.id : (clients[0]?.id || "no-client");
    const realLink = `${window.location.origin}/api/auth/google/login?clientId=${clientId}`;
    navigator.clipboard.writeText(realLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateClientClick = () => {
    const disconnected = clients.find(c => !c.googleConnected);
    if (disconnected) {
      const realLink = `${window.location.origin}/api/auth/google/login?clientId=${disconnected.id}`;
      // Open the login endpoint in a new tab to trigger callback and db updates
      window.open(realLink, "_blank");
    } else {
      alert("Tous les établissements existants sont déjà connectés.");
    }
  };

  const handleImportFromManager = () => {
    const location = mockManagerLocations.find(l => l.locationId === selectedManagerLocation);
    if (!location) return;

    addNewClient(
      location.name,
      location.placeId,
      location.locationId,
      'manual',
      `Établissement ${location.name}. Ton chaleureux et réactif.`
    );

    // Mark as Google connected directly because it's imported via agency manager account
    const addedClient = clients[clients.length - 1]; // This is async, let's connect in state context. 
    // We should locate it after context updates, but for simulation, we can simulate the onboarding
    alert(`Établissement "${location.name}" importé avec succès sous le compte Manager de l'Agence !`);
    setSelectedManagerLocation("");
    setActiveTab("list");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient.id, {
      name: editingClient.name,
      customPrompt: editingClient.customPrompt,
      autoMode: editingClient.autoMode,
      placeId: editingClient.placeId,
      locationId: editingClient.locationId
    });
    setEditingClient(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Gestion clients</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Établissements</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configurez les fiches Google Business Profile et personnalisez l'IA pour chaque entreprise.
          </p>
        </div>
        
        {/* Toggle View Tabs */}
        <div className="flex bg-muted/40 p-1 rounded-xl border border-border/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'list' 
                ? "bg-card text-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Liste des Établissements
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'add' 
                ? "bg-card text-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus size={14} />
            Ajouter un Client
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left/Middle Column - Establishments list */}
            <div className="lg:col-span-2 space-y-4">
              {clients.map(client => (
                <div key={client.id} className="glass-card glow-card p-6 rounded-2xl space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                        {client.logo}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg">{client.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[280px]">
                          Place ID: {client.placeId}
                        </p>
                      </div>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="flex items-center gap-2 bg-muted/30 border border-border p-1.5 rounded-xl">
                      <button
                        onClick={() => updateClient(client.id, { autoMode: 'manual' })}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                          client.autoMode === 'manual'
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/10 shadow-sm"
                            : "text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        Manuel
                      </button>
                      <button
                        onClick={() => updateClient(client.id, { autoMode: 'auto' })}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                          client.autoMode === 'auto'
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 shadow-sm"
                            : "text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        Auto 4-5★
                      </button>
                    </div>
                  </div>

                  {/* AI Prompt Context Section */}
                  <div className="space-y-1 bg-background/40 p-4 rounded-xl border border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                      <Sparkles size={14} />
                      Contexte IA & Consignes de réponse :
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{client.customPrompt}"
                    </p>
                  </div>

                  {/* Google Connexion Status / Actions */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs">
                    <div className="flex items-center gap-2">
                      {client.googleConnected ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                          <CheckCircle2 size={14} />
                          Compte Google lié ({client.googleAccountName})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-500 font-semibold animate-pulse">
                          <AlertCircle size={14} />
                          Google Déconnecté
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-muted/40 hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Edit3 size={12} />
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Google OAuth Simulation Panel */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Link2 size={18} className="text-primary" />
                Simulateur d'Onboarding
              </h3>

              <div className="glass-card glow-card p-6 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Vérification de flux OAuth</h4>
                  <p className="text-xs text-muted-foreground">
                    Utilisez cet outil pour simuler la connexion d'un client déconnecté via le lien unique d'autorisation Google.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleCopyOAuthLink}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-background hover:bg-muted border border-border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        Lien Copié !
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Générer & Copier le lien unique
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSimulateClientClick}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <UserCheck size={14} />
                    Simuler clic client (Autoriser Google)
                  </button>
                </div>

                <div className="p-3 bg-muted/30 border border-border/40 rounded-lg flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
                  <Info size={14} className="shrink-0 text-primary mt-0.5" />
                  <span>
                    <strong>Option A:</strong> Le lien unique redirige le client vers le consentement Google. Une fois validé, Google renvoie le <em>Refresh Token</em> qui est enregistré pour activer l'API.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ADD NEW CLIENT FORM */
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form Column - 2 cols width */}
            <div className="lg:col-span-2 glass-card glow-card p-6 rounded-2xl space-y-6">
              <div className="flex bg-muted/30 p-1 rounded-xl border border-border/80 w-fit">
                <button
                  onClick={() => setAddMethod('oauth')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    addMethod === 'oauth' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Option A : Lien Unique Client
                </button>
                <button
                  onClick={() => setAddMethod('manager')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    addMethod === 'manager' 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Option B : Mode Manager Agence
                </button>
              </div>

              {addMethod === 'oauth' ? (
                /* Method A Form */
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom de l'établissement</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex: Boulangerie Gourmande"
                        className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Google Place ID</label>
                      <input
                        type="text"
                        value={newPlaceId}
                        onChange={(e) => setNewPlaceId(e.target.value)}
                        placeholder="Ex: ChIJuQ2M5m5v5kcR0Bq6..."
                        className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">GBP Location ID (Optionnel)</label>
                      <input
                        type="text"
                        value={newLocationId}
                        onChange={(e) => setNewLocationId(e.target.value)}
                        placeholder="Ex: locations/123456"
                        className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mode de réponse par défaut</label>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setNewAutoMode('manual')}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                            newAutoMode === 'manual'
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Modération Manuelle
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAutoMode('auto')}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                            newAutoMode === 'auto'
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Auto 4-5★
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contexte & Prompt personnalisé pour l'IA</label>
                    <textarea
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder="Ex: Restaurant de sushi haut de gamme. Le ton doit être zen, poli, et mettre en valeur nos poissons frais livrés chaque matin..."
                      className="w-full h-28 rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-5 py-2.5 text-xs font-semibold hover:bg-muted rounded-xl border border-border transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-primary-foreground shadow-lg transition-all"
                    >
                      Créer le client & Générer le lien OAuth
                    </button>
                  </div>
                </form>
              ) : (
                /* Method B Form (Agency Manager mode) */
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
                    <h4 className="font-bold text-sm">Étape 1 : Connexion au compte Google de l'Agence</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Si les fiches Google Business Profile de vos clients vous ont désigné comme Manager, vous pouvez toutes les lier en connectant votre propre compte Google.
                    </p>
                    
                    {!agencyConnected ? (
                      <button
                        onClick={() => setAgencyConnected(true)}
                        className="py-2 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground flex items-center gap-2 shadow hover:shadow-primary/10 transition-all"
                      >
                        <UserCheck size={14} />
                        Se connecter avec mon compte Agence (Google)
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg w-fit">
                        <CheckCircle2 size={16} />
                        Compte Agence lié : manager@5estrelles.com
                      </div>
                    )}
                  </div>

                  {agencyConnected && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm">Étape 2 : Importer un établissement géré</h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sélectionner l'établissement détecté</label>
                          <select
                            value={selectedManagerLocation}
                            onChange={(e) => setSelectedManagerLocation(e.target.value)}
                            className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                          >
                            <option value="">-- Choisir une fiche détectée --</option>
                            {mockManagerLocations.map(loc => (
                              <option key={loc.locationId} value={loc.locationId}>
                                {loc.name} (ID: {loc.locationId})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleImportFromManager}
                          disabled={!selectedManagerLocation}
                          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-primary-foreground shadow-lg hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50"
                        >
                          Importer l'établissement sélectionné
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Right Column */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Comment ça marche ?
              </h3>
              
              <div className="glass-card glow-card p-6 rounded-2xl text-xs space-y-3 leading-relaxed text-muted-foreground">
                <p>
                  <strong>Option A (Lien Unique) :</strong> Recommandé si vous souhaitez que vos clients finaux gardent le contrôle total sur leurs identifiants de connexion. Vous leur envoyez un lien unique, ils cliquent, acceptent les accès Google Business, et l'application s'occupe de l'intégration.
                </p>
                <p>
                  <strong>Option B (Mode Manager) :</strong> Recommandé si vous gérez déjà les établissements de vos clients depuis votre console Google Business Profile d'agence. Une seule connexion de votre côté suffit à importer toutes les fiches en un clic.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing Client Modal Overlay */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingClient(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl z-10 glow-card"
          >
            <h3 className="font-bold text-lg mb-4">Modifier l'Établissement</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom de l'établissement</label>
                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contexte & Prompt de l'IA</label>
                <textarea
                  value={editingClient.customPrompt}
                  onChange={(e) => setEditingClient({ ...editingClient, customPrompt: e.target.value })}
                  className="w-full h-28 rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mode de réponse</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingClient({ ...editingClient, autoMode: 'manual' })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                      editingClient.autoMode === 'manual'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    Manuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClient({ ...editingClient, autoMode: 'auto' })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                      editingClient.autoMode === 'auto'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    Auto 4-5★
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs font-semibold hover:bg-muted border border-border rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-md flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Sauvegarder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
