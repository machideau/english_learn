"use client";
import { useState, useEffect } from "react";
import { Badge, loadBadges } from "@/lib/badges";
import { XIcon, TrophyIcon } from "@/components/ui/Icons";
import { playAchievementFanfare } from "@/lib/sound-effects";

interface BadgesModalProps {
  onClose: () => void;
  stats: {
    totalSessions: number;
    totalMessages: number;
    currentStreak: number;
    totalSRSCards: number;
    roleplaysDone: number;
    dictationsPerfect: number;
    todayMessages: number;
  };
}

export function BadgesModal({ onClose, stats }: BadgesModalProps) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const loaded = loadBadges(stats);
    setBadges(loaded);
    // Si des badges sont débloqués, jouer la fanfare
    if (loaded.some((b) => b.unlocked)) {
      playAchievementFanfare();
    }
  }, [stats]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-200/90 shadow-2xl p-6 flex flex-col gap-4 text-brown-800 animate-scale-up max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-600">
              <TrophyIcon size={22} />
            </div>
            <div>
              <h2 id="badges-modal-title" className="text-lg font-extrabold text-brown-800">
                Trophées & Badges
              </h2>
              <p className="text-xs text-brown-400">
                {unlockedCount} sur {badges.length} succès débloqués
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brown-400 hover:text-brown-700 hover:bg-cream-200/60 transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Barre de progression globale */}
        <div className="w-full bg-cream-200/80 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / Math.max(1, badges.length)) * 100}%` }}
          />
        </div>

        {/* Liste des badges */}
        <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
          {badges.map((badge) => {
            const pct = Math.round((badge.currentValue / badge.targetValue) * 100);
            return (
              <div
                key={badge.id}
                className={[
                  "p-3.5 rounded-xl border transition-all flex items-center gap-3.5",
                  badge.unlocked
                    ? "bg-white border-cream-200/90 shadow-xs"
                    : "bg-cream-100/50 border-cream-200/50 opacity-70",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs",
                    badge.unlocked
                      ? "bg-terracotta-50 border border-terracotta-200"
                      : "bg-cream-200/60 grayscale",
                  ].join(" ")}
                >
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-brown-800 truncate">
                      {badge.title}
                    </h3>
                    {badge.unlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                        Débloqué
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-brown-400 shrink-0">
                        {badge.currentValue} / {badge.targetValue}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brown-400 mt-0.5 line-clamp-2">
                    {badge.description}
                  </p>

                  {!badge.unlocked && (
                    <div className="mt-1.5 w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-terracotta-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
