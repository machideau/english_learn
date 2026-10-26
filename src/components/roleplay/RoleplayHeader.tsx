"use client";
import { useState, useEffect, useRef } from "react";
import type { RoleplayScenario } from "@/types";
import { CheckIcon, MaskIcon, XIcon } from "@/components/ui/Icons";


interface RoleplayHeaderProps {
  scenario: RoleplayScenario;
  completedObjectives: string[];
  onEndScenario: () => void;
  onExit: () => void;
}

export function RoleplayHeader({
  scenario,
  completedObjectives,
  onEndScenario,
  onExit,
}: RoleplayHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const prevCompleted = useRef<string[]>([]);

  // Détection d'un nouvel objectif complété
  useEffect(() => {
    const newlyCompleted = completedObjectives.filter(
      (id) => !prevCompleted.current.includes(id)
    );
    if (newlyCompleted.length > 0) {
      const obj = scenario.objectives.find((o) => o.id === newlyCompleted[0]);
      if (obj) setToastLabel(obj.label);
    }
    prevCompleted.current = completedObjectives;
  }, [completedObjectives, scenario.objectives]);

  // Efface le toast après l'animation
  useEffect(() => {
    if (!toastLabel) return;
    const t = setTimeout(() => setToastLabel(null), 3300);
    return () => clearTimeout(t);
  }, [toastLabel]);

  const completedCount = scenario.objectives.filter((o) =>
    completedObjectives.includes(o.id)
  ).length;
  const totalCount = scenario.objectives.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-cream-50 border-b border-cream-200 px-4 py-2.5 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar Character & Scenario Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shrink-0">
            <MaskIcon size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brown-800 truncate">
                {scenario.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cream-200/80 text-brown-500 font-medium">
                {scenario.avatarName} ({scenario.avatarRole})
              </span>
            </div>
            <p className="text-[11px] text-brown-300 truncate">
              Votre rôle : <span className="text-brown-500">{scenario.userRole}</span>
            </p>
          </div>
        </div>

        {/* Objectives Progress & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-cream-200 hover:border-terracotta-300 text-brown-600 transition-colors shadow-subtle"
            title="Voir les objectifs du scénario"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span>Objectifs : {completedCount}/{totalCount}</span>
          </button>

          {/* Barre de progression visuelle */}
          <div
            className="hidden sm:block w-16 h-1.5 rounded-full bg-cream-200 overflow-hidden"
            title={`${progressPercent}% accompli`}
            aria-label={`Progression : ${progressPercent}%`}
          >
            <div
              className="h-full rounded-full bg-terracotta-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="hidden sm:inline text-[10px] text-terracotta-600 font-bold tabular-nums">
            {progressPercent}%
          </span>

          <button
            onClick={onEndScenario}
            className="px-2.5 py-1 text-xs font-medium rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white transition-colors shadow-sm"
          >
            Terminer
          </button>

          <button
            onClick={onExit}
            className="p-1 text-brown-300 hover:text-brown-600 rounded-full hover:bg-cream-200 transition-colors"
            title="Quitter le scénario"
            aria-label="Quitter le scénario"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>

      {/* Toast « Objectif atteint » */}
      {toastLabel && (
        <div
          key={toastLabel}
          className="objective-toast pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lift"
          role="status"
          aria-live="polite"
        >
          <CheckIcon size={16} />
          <span>🎯 Objectif atteint : {toastLabel}</span>
        </div>
      )}

      {/* Expanded Objectives Dropdown */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-cream-200 animate-fade-in space-y-2">
          <div className="text-[11px] text-brown-400 font-medium flex items-center justify-between">
            <span>Missions à accomplir pendant l'échange :</span>
            <span className="italic">{scenario.context}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {scenario.objectives.map((obj) => {
              const isDone = completedObjectives.includes(obj.id);
              return (
                <div
                  key={obj.id}
                  className={[
                    "p-2.5 rounded-xl border text-xs transition-all",
                    isDone
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                      : "bg-white border-cream-200 text-brown-600",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-semibold text-[11px] truncate">{obj.label}</span>
                    {isDone ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 shrink-0">
                        <CheckIcon size={12} /> Validé
                      </span>
                    ) : (
                      <span className="text-[10px] text-brown-300 shrink-0">À faire</span>
                    )}
                  </div>
                  <p className="text-[10px] text-brown-400 leading-tight">
                    {obj.description}
                  </p>
                  {!isDone && obj.hint && (
                    <p className="mt-1 text-[10px] text-terracotta-500/90 italic">
                      💡 {obj.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
