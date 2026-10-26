"use client";
import { useState } from "react";
import { TrophyIcon, CheckIcon } from "@/components/ui/Icons";
import { BadgesModal } from "./BadgesModal";

interface DailyGoalTrackerProps {
  todayMessages: number;
  goalTarget?: number;
  stats: {
    totalSessions: number;
    totalMessages: number;
    currentStreak: number;
    totalSRSCards: number;
    roleplaysDone: number;
    dictationsPerfect: number;
    todayMessages: number;
  };
  className?: string;
}

export function DailyGoalTracker({
  todayMessages,
  goalTarget = 5,
  stats,
  className = "",
}: DailyGoalTrackerProps) {
  const [showBadges, setShowBadges] = useState(false);
  const isDone = todayMessages >= goalTarget;
  const progressPct = Math.min(100, Math.round((todayMessages / goalTarget) * 100));

  return (
    <>
      <div
        className={`inline-flex items-center gap-3 bg-white/80 border border-cream-200/90 py-1.5 px-3 rounded-2xl shadow-xs text-xs ${className}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={[
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
              isDone
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-terracotta-100 text-terracotta-600 border border-terracotta-200",
            ].join(" ")}
          >
            {isDone ? <CheckIcon size={12} /> : <TrophyIcon size={12} />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-brown-800 text-[11px]">
              <span>Objectif quotidien</span>
              <span className="text-terracotta-600 font-extrabold">
                {todayMessages}/{goalTarget}
              </span>
            </div>
            <div className="w-20 bg-cream-200 h-1 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bouton Badges */}
        <button
          onClick={() => setShowBadges(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cream-100/90 hover:bg-cream-200/90 text-brown-600 hover:text-brown-800 font-semibold text-[11px] border border-cream-200/90 transition-all active:scale-95"
          title="Voir vos badges et accomplissements"
        >
          <TrophyIcon size={13} className="text-terracotta-500" />
          <span>Trophées</span>
        </button>
      </div>

      {showBadges && (
        <BadgesModal
          onClose={() => setShowBadges(false)}
          stats={stats}
        />
      )}
    </>
  );
}
