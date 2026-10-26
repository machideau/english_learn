"use client";
import { useMemo } from "react";

interface ActivityHeatmapProps {
  activeDates?: string[]; // liste de dates "YYYY-MM-DD"
  currentStreak?: number;
  className?: string;
}

export function ActivityHeatmap({
  activeDates = [],
  currentStreak = 0,
  className = "",
}: ActivityHeatmapProps) {
  // Générer les 28 derniers jours (4 semaines)
  const days = useMemo(() => {
    const list: Array<{ dateStr: string; dayNum: number; active: boolean; isToday: boolean }> = [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dateSet = new Set(activeDates);
    // Inclure aujourd'hui si streak > 0
    if (currentStreak > 0) dateSet.add(todayStr);

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split("T")[0];
      list.push({
        dateStr: str,
        dayNum: d.getDate(),
        active: dateSet.has(str),
        isToday: str === todayStr,
      });
    }
    return list;
  }, [activeDates, currentStreak]);

  const totalActive = days.filter((d) => d.active).length;

  return (
    <div className={`bg-white/80 rounded-2xl border border-cream-200/90 p-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brown-800">Activité des 4 dernières semaines</span>
          <span className="px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-600 font-semibold text-[10px]">
            {totalActive} / 28 jours
          </span>
        </div>
        {currentStreak > 0 && (
          <span className="text-terracotta-600 font-bold flex items-center gap-1">
            🔥 {currentStreak} j. de suite
          </span>
        )}
      </div>

      {/* Grille de 28 cases (4 rangées de 7 jours) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => (
          <div
            key={day.dateStr}
            title={`${day.dateStr} : ${day.active ? "Activité enregistrée" : "Aucune session"}`}
            className={[
              "h-7 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all duration-150",
              day.active
                ? "bg-terracotta-500 text-white shadow-xs font-bold"
                : "bg-cream-100/80 text-brown-300 hover:bg-cream-200/70",
              day.isToday ? "ring-2 ring-terracotta-400 ring-offset-1" : "",
            ].join(" ")}
          >
            {day.dayNum}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] text-brown-400">
        <span>Il y a 4 semaines</span>
        <div className="flex items-center gap-1.5">
          <span>Inactif</span>
          <span className="w-2.5 h-2.5 rounded bg-cream-200 inline-block" />
          <span className="w-2.5 h-2.5 rounded bg-terracotta-500 inline-block" />
          <span>Actif</span>
        </div>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  );
}
