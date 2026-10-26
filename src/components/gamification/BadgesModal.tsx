"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Badge, loadBadges } from "@/lib/badges";
import {
  XIcon,
  TrophyIcon,
  SparklesIcon,
  FlameIcon,
  MessageIcon,
  BookIcon,
  MaskIcon,
  HeadphonesIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { playAchievementFanfare } from "@/lib/sound-effects";

function renderBadgeIcon(iconKey: string) {
  switch (iconKey) {
    case "sparkles":
      return <SparklesIcon size={22} className="text-terracotta-500" />;
    case "flame":
    case "streak":
      return <FlameIcon size={22} className="text-orange-500" />;
    case "message":
      return <MessageIcon size={22} className="text-blue-500" />;
    case "book":
      return <BookIcon size={22} className="text-amber-600" />;
    case "mask":
      return <MaskIcon size={22} className="text-purple-500" />;
    case "headphones":
      return <HeadphonesIcon size={22} className="text-emerald-500" />;
    case "trophy":
    default:
      return <TrophyIcon size={22} className="text-terracotta-600" />;
  }
}

interface BadgesModalProps {
  isOpen?: boolean;
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

export function BadgesModal({ isOpen = true, onClose, stats }: BadgesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const loaded = loadBadges(stats);
    setBadges(loaded);
    if (loaded.some((b) => b.unlocked)) {
      playAchievementFanfare();
    }
  }, [isOpen, stats]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shadow-xs">
              <TrophyIcon size={20} />
            </div>
            <div>
              <h2 id="badges-modal-title" className="text-base font-bold text-brown-800">
                Trophées & Badges
              </h2>
              <p className="text-xs text-brown-400">
                {unlockedCount}/{badges.length} débloqués
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-400 hover:text-brown-700 hover:bg-cream-200 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Barre de progression globale */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-brown-500 mb-1.5">
            <span>Progression globale</span>
            <span className="text-terracotta-600 font-bold">
              {Math.round((unlockedCount / Math.max(1, badges.length)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-cream-200/90 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / Math.max(1, badges.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Liste des badges avec défilement */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 min-h-0">
          {badges.map((badge) => {
            const pct = Math.round((badge.currentValue / badge.targetValue) * 100);
            return (
              <div
                key={badge.id}
                className={[
                  "p-3.5 rounded-xl border transition-all flex items-center gap-3.5",
                  badge.unlocked
                    ? "bg-white border-cream-200 shadow-xs"
                    : "bg-cream-100/60 border-cream-200/60 opacity-75",
                ].join(" ")}
              >
                {/* Icône du badge */}
                <div
                  className={[
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                    badge.unlocked
                      ? "bg-terracotta-50 border border-terracotta-200"
                      : "bg-cream-200/70 opacity-60",
                  ].join(" ")}
                >
                  {renderBadgeIcon(badge.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-brown-800 truncate">
                      {badge.title}
                    </h3>
                    {badge.unlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 inline-flex items-center gap-1">
                        <CheckIcon size={11} />
                        Débloqué
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-brown-400 shrink-0">
                        {badge.currentValue} / {badge.targetValue}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brown-500 mt-0.5 line-clamp-2">
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
    </div>,
    document.body
  );
}
