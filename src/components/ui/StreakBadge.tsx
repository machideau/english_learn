"use client";
import type { StreakData } from "@/types";
import { FlameIcon } from "@/components/ui/Icons";

interface StreakBadgeProps {
  streak: StreakData;
  compact?: boolean;
}

export function StreakBadge({ streak, compact }: StreakBadgeProps) {
  const { currentStreak, longestStreak, totalMessages } = streak;
  const isActive = currentStreak > 0;

  if (compact) {
    return (
      <div
        className={[
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
          isActive
            ? "bg-orange-50 border-orange-200 text-orange-600"
            : "bg-cream-100 border-cream-200 text-brown-300",
        ].join(" ")}
        title={`Série : ${currentStreak} jour${currentStreak > 1 ? "s" : ""} - Record : ${longestStreak} jour${longestStreak > 1 ? "s" : ""}`}
      >
        <FlameIcon
          size={13}
          className={isActive ? "text-orange-500" : "text-brown-200"}
        />
        <span>{currentStreak}</span>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={[
            "w-8 h-8 rounded-full flex items-center justify-center border",
            isActive
              ? "bg-orange-50 border-orange-200 text-orange-500"
              : "bg-cream-100 border-cream-200 text-brown-200",
          ].join(" ")}
        >
          <FlameIcon size={16} />
        </div>
        <div>
          <p className="text-xs font-semibold text-brown-600">Série de pratique</p>
          <p className="text-[11px] text-brown-300">Restez régulier pour progresser</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="card-inset text-center py-2">
          <span
            className={[
              "block text-2xl font-bold",
              isActive ? "text-orange-500" : "text-brown-300",
            ].join(" ")}
          >
            {currentStreak}
          </span>
          <span className="text-[10px] text-brown-300 font-medium">
            {currentStreak > 1 ? "jours" : "jour"}
          </span>
          <p className="text-[10px] text-brown-200 mt-0.5">Série actuelle</p>
        </div>

        <div className="card-inset text-center py-2">
          <span className="block text-2xl font-bold text-brown-500">
            {longestStreak}
          </span>
          <span className="text-[10px] text-brown-300 font-medium">
            {longestStreak > 1 ? "jours" : "jour"}
          </span>
          <p className="text-[10px] text-brown-200 mt-0.5">Record</p>
        </div>

        <div className="card-inset text-center py-2">
          <span className="block text-2xl font-bold text-brown-500">
            {totalMessages}
          </span>
          <span className="text-[10px] text-brown-300 font-medium">messages</span>
          <p className="text-[10px] text-brown-200 mt-0.5">Total</p>
        </div>
      </div>

      {isActive && currentStreak >= 3 && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-700 font-medium text-center">
          {currentStreak >= 30
            ? "Incroyable ! 30 jours de suite !"
            : currentStreak >= 14
            ? "Deux semaines de pratique continue !"
            : currentStreak >= 7
            ? "Une semaine entiere ! Excellent !"
            : `${currentStreak} jours d'affilée. Continuez !`}
        </div>
      )}
    </div>
  );
}
