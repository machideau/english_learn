"use client";
import type { RoleplayScenario, Correction } from "@/types";
import { CheckIcon, TrophyIcon, XIcon, ShareIcon, SparkleIcon } from "@/components/ui/Icons";

interface RoleplayDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: RoleplayScenario;
  completedObjectives: string[];
  totalMessages: number;
  corrections: Correction[];
  onOpenShareCard: () => void;
}

export function RoleplayDebriefModal({
  isOpen,
  onClose,
  scenario,
  completedObjectives,
  totalMessages,
  corrections,
  onOpenShareCard,
}: RoleplayDebriefModalProps) {
  if (!isOpen) return null;

  const totalObjectives = scenario.objectives.length;
  const completedCount = scenario.objectives.filter((o) =>
    completedObjectives.includes(o.id)
  ).length;

  const objectiveScore = Math.round((completedCount / totalObjectives) * 70);
  const flowBonus = Math.min(20, totalMessages * 4);
  const errorPenalty = Math.min(20, corrections.length * 3);
  const finalScore = Math.max(30, Math.min(100, 20 + objectiveScore + flowBonus - errorPenalty));

  const isSuccess = completedCount === totalObjectives;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="debrief-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* En-tête festive */}
        <div className="relative px-6 py-6 border-b border-cream-200 bg-gradient-to-br from-terracotta-500 to-terracotta-700 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md mb-2 shadow-inner">
            <TrophyIcon size={30} />
          </div>

          <h2 id="debrief-title" className="text-xl font-bold tracking-tight">
            {isSuccess ? "Mission Accomplie !" : "Débriefing du Scénario"}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {scenario.title} - {scenario.avatarName}
          </p>

          {/* Score Cercle / Pill */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25">
            <SparkleIcon size={16} />
            <span className="text-xs uppercase tracking-wider font-semibold">Score Global :</span>
            <span className="text-base font-extrabold">{finalScore}/100</span>
          </div>
        </div>

        {/* Corps du débrief */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Objectifs vérifiés */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brown-400 mb-2">
              Objectifs validés ({completedCount}/{totalObjectives}) :
            </h3>
            <div className="space-y-2">
              {scenario.objectives.map((obj) => {
                const done = completedObjectives.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={[
                      "p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors",
                      done
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-white border-cream-200 text-brown-400",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        done ? "bg-emerald-600 text-white" : "border border-cream-300 text-transparent",
                      ].join(" ")}
                    >
                      <CheckIcon size={12} />
                    </div>
                    <div>
                      <div className="font-semibold text-xs">{obj.label}</div>
                      <div className="text-[11px] opacity-80">{obj.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistiques de la session */}
          <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-cream-200 text-center">
            <div>
              <div className="text-base font-extrabold text-brown-700">{totalMessages}</div>
              <div className="text-[11px] text-brown-400">Échanges parlés</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-terracotta-600">{corrections.length}</div>
              <div className="text-[11px] text-brown-400">Corrections notées</div>
            </div>
          </div>

          {/* Points clés retenus */}
          <div className="bg-cream-100/70 border border-cream-200 p-3.5 rounded-xl text-xs space-y-1.5">
            <span className="font-bold text-brown-700 block">Conseil du tuteur :</span>
            <p className="text-brown-500 leading-relaxed text-[11px]">
              {isSuccess
                ? "Excellente réactivité ! Vous avez su rester dans votre rôle tout en répondant avec clarté et naturel."
                : "Bon début ! N'hésitez pas à relancer l'interlocuteur et à utiliser les tournures suggérées dans les indices pour valider tous les points."}
            </p>
          </div>
        </div>

        {/* Actions du bas */}
        <div className="p-4 border-t border-cream-200 bg-white flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenShareCard}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShareIcon size={16} />
            <span>Partager ma réussite</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 hover:bg-cream-100 text-brown-600 text-xs font-semibold transition-colors"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}
