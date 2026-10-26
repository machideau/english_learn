"use client";
import { useState } from "react";
import { ROLEPLAY_SCENARIOS } from "@/lib/roleplay-scenarios";
import type { RoleplayScenario, RoleplayCategory, Level } from "@/types";
import { MaskIcon, XIcon, CheckIcon } from "@/components/ui/Icons";

interface RoleplaySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: RoleplayScenario) => void;
  userLevel?: Level;
}

const CATEGORIES: Array<{ id: "all" | RoleplayCategory; label: string }> = [
  { id: "all", label: "Tous les scénarios" },
  { id: "career", label: "Carrière & Pro" },
  { id: "daily", label: "Vie quotidienne" },
  { id: "travel", label: "Voyages & Aéroports" },
];

const LEVEL_COLORS: Record<Level, string> = {
  débutant: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermédiaire: "bg-amber-50 text-amber-700 border-amber-200",
  avancé: "bg-rose-50 text-rose-700 border-rose-200",
};

export function RoleplaySelectorModal({
  isOpen,
  onClose,
  onSelectScenario,
  userLevel,
}: RoleplaySelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | RoleplayCategory>("all");

  if (!isOpen) return null;

  const filteredScenarios = ROLEPLAY_SCENARIOS.filter((s) => {
    if (selectedCategory === "all") return true;
    return s.category === selectedCategory;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roleplay-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shrink-0">
              <MaskIcon size={22} />
            </div>
            <div>
              <h2 id="roleplay-modal-title" className="text-base font-bold text-brown-800">
                Scénarios Roleplay
              </h2>
              <p className="text-xs text-brown-400">
                Situations réelles avec objectifs et débriefing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 hover:bg-cream-200 rounded-full transition-colors shrink-0"
            aria-label="Fermer"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-cream-200 bg-white overflow-x-auto shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id
                  ? "bg-terracotta-500 text-white shadow-sm"
                  : "bg-cream-100 text-brown-400 hover:text-brown-600 hover:bg-cream-200",
              ].join(" ")}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grille des scénarios */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((scenario) => {
            const isRecommended = userLevel && scenario.level === userLevel;

            return (
              <div
                key={scenario.id}
                className="bg-white rounded-2xl border border-cream-200 p-4 flex flex-col justify-between hover:border-terracotta-300 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${LEVEL_COLORS[scenario.level]}`}
                    >
                      {scenario.level}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-semibold text-terracotta-600 bg-terracotta-50 border border-terracotta-100 px-2 py-0.5 rounded-full">
                        Recommandé pour vous
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-brown-800 group-hover:text-terracotta-600 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-brown-400 mt-1 mb-3 leading-relaxed">
                    {scenario.subtitle}
                  </p>

                  <div className="bg-cream-50 rounded-xl p-2.5 border border-cream-100 mb-3 space-y-1">
                    <div className="text-[11px] text-brown-600">
                      <span className="font-semibold text-brown-700">Avec : </span>
                      {scenario.avatarName}
                    </div>
                    <div className="text-[11px] text-brown-600">
                      <span className="font-semibold text-brown-700">Rôle : </span>
                      {scenario.userRole}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brown-300">
                      Objectifs ({scenario.objectives.length})
                    </span>
                    <ul className="space-y-1">
                      {scenario.objectives.map((obj) => (
                        <li key={obj.id} className="text-xs text-brown-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400 shrink-0" />
                          <span className="truncate">{obj.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectScenario(scenario);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:bg-terracotta-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Démarrer</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
