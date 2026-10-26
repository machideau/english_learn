"use client";
import { useState, useEffect } from "react";
import { ROADMAP_STEPS, loadCompletedSteps } from "@/lib/learning-roadmap";
import { getRoleplayScenario } from "@/lib/roleplay-scenarios";
import type { RoadmapStep, RoleplayScenario } from "@/types";
import {
  CompassIcon,
  XIcon,
  CheckIcon,
  MaskIcon,
  GraduationIcon,
  MessageIcon,
} from "@/components/ui/Icons";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchRoleplay?: (scenario: RoleplayScenario) => void;
  onLaunchLesson?: (lessonId?: string) => void;
  onLaunchConversation?: (topic: string) => void;
}

export function RoadmapModal({
  isOpen,
  onClose,
  onLaunchRoleplay,
  onLaunchLesson,
  onLaunchConversation,
}: RoadmapModalProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCompletedSteps(loadCompletedSteps());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = ROADMAP_STEPS.length;
  const doneCount = completedSteps.length;
  const progressPercent = Math.min(100, Math.round((doneCount / totalSteps) * 100));

  const handleStepClick = (step: RoadmapStep) => {
    onClose();
    if (step.mode === "roleplay" && step.targetId) {
      const sc = getRoleplayScenario(step.targetId);
      if (sc && onLaunchRoleplay) onLaunchRoleplay(sc);
    } else if (step.mode === "lesson") {
      if (onLaunchLesson) onLaunchLesson(step.targetId);
    } else if (step.mode === "conversation") {
      if (onLaunchConversation) onLaunchConversation(step.title);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shrink-0">
              <CompassIcon size={20} />
            </div>
            <div>
              <h2 id="roadmap-title" className="text-sm font-bold text-brown-800">
                Parcours A1 → C1
              </h2>
              <p className="text-xs text-brown-400">
                {doneCount}/{totalSteps} étapes complétées
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 rounded-full hover:bg-cream-200 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Barre de progression globale */}
        <div className="px-6 py-3 bg-white border-b border-cream-200 flex items-center gap-4 shrink-0">
          <div className="flex-1">
            <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden border border-cream-200">
              <div
                className="h-full bg-gradient-to-r from-terracotta-400 to-terracotta-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-brown-400 font-medium shrink-0">
            {progressPercent}%
          </div>
        </div>

        {/* Liste des étapes façon Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {ROADMAP_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isNext = !isCompleted && (idx === 0 || completedSteps.includes(ROADMAP_STEPS[idx - 1].id));

            return (
              <div
                key={step.id}
                className={[
                  "p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4",
                  isCompleted
                    ? "bg-white border-emerald-200/90 shadow-subtle"
                    : isNext
                    ? "bg-white border-terracotta-300 shadow-sm ring-1 ring-terracotta-200"
                    : "bg-cream-100/40 border-cream-200 opacity-75",
                ].join(" ")}
              >
                {/* Icône de statut */}
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isNext
                      ? "bg-terracotta-500 text-white animate-pulse"
                      : "bg-cream-200 text-brown-400",
                  ].join(" ")}
                >
                  {isCompleted ? <CheckIcon size={14} /> : idx + 1}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-100 border border-cream-200 text-brown-600 uppercase tracking-wider">
                      {step.level}
                    </span>
                    <span className="text-[10px] text-brown-300">
                      ~{step.estimatedMinutes} min
                    </span>
                    {isNext && (
                      <span className="text-[10px] font-bold text-terracotta-600 bg-terracotta-50 border border-terracotta-100 px-2 py-0.5 rounded-full">
                        Prochaine étape !
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-brown-800">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-brown-400 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bouton d'action */}
                <div className="shrink-0 self-center">
                  <button
                    onClick={() => handleStepClick(step)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm",
                      isCompleted
                        ? "bg-cream-100 hover:bg-cream-200 text-brown-600"
                        : "bg-terracotta-500 hover:bg-terracotta-600 text-white",
                    ].join(" ")}
                  >
                    <span>{isCompleted ? "Rejouer" : "Lancer"}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
