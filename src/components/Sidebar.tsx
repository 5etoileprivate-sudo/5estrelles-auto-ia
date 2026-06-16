"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquareReply, 
  Building2, 
  Sliders, 
  Star, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tableau de bord", path: "/", icon: LayoutDashboard },
    { name: "Modération", path: "/reviews", icon: MessageSquareReply, badge: true },
    { name: "Établissements", path: "/clients", icon: Building2 },
    { name: "Configuration", path: "/settings", icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card/40 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6">
        <Link href="/" className="flex flex-col gap-1.5 group">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className="fill-amber-400 stroke-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform" 
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Auto IA</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            5<span className="gold-gradient-text">estrelles</span>
          </h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="relative block">
              <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}>
                {/* Active Background Overlay */}
                {isActive && (
                  <motion.span 
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-muted/65 rounded-lg border-l-2 border-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-3 w-full">
                  <item.icon size={18} className={isActive ? "text-primary drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" : "text-muted-foreground"} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">
                      Live
                    </span>
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account Status */}
      <div className="p-4 border-t border-border/60 bg-muted/20">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-background/40 border border-border/40">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
            <span className="text-xs font-bold text-primary">ES</span>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-semibold truncate">Esteban (Agence)</p>
            <p className="text-[10px] text-muted-foreground truncate">esteban@5estrelles.com</p>
          </div>
        </div>

        {/* API Status Widget */}
        <div className="mt-3 px-2 py-1.5 flex items-center justify-between rounded-md bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">GBP API Status</span>
          </div>
          <span className="text-[9px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
            Simulation
          </span>
        </div>
      </div>
    </aside>
  );
}
