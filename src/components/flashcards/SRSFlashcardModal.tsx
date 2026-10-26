"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { SRSCard, SRSGrade, CorrectionType } from "@/types";
import {
  XIcon,
  CheckIcon,
  PencilIcon as GrammarIcon,
  BookIcon,
  RefreshIcon,
  WaveIcon,
  CardsIcon,
  VolumeIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

interface SRSFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: SRSCard[];
  dueCards?: SRSCard[];
  onGrade: (key: string, grade: SRSGrade) => void;
  title?: string;
  /** Si true, affiche toutes les cartes (même pas dues) */
  forceAll?: boolean;
}

const TYPE_CONFIG: Record<
  CorrectionType,
  { label: string; badgeClass: string; Icon: React.FC<{ size?: number; className?: string }> }
> = {
  grammaire:     { label: "Grammaire",    badgeClass: "bg-blue-50 border-blue-100 text-blue-600",          Icon: GrammarIcon },
  vocabulaire:   { label: "Vocabulaire",  badgeClass: "bg-violet-50 border-violet-100 text-violet-600",    Icon: BookIcon },
  tournure:      { label: "Tournure",     badgeClass: "bg-emerald-50 border-emerald-100 text-emerald-600", Icon: RefreshIcon },
  prononciation: { label: "Prononciation",badgeClass: "bg-terracotta-50 border-terracotta-100 text-terracotta-600", Icon: WaveIcon },
};

const GRADE_LABELS: Array<{ grade: SRSGrade; label: string; key: string; colorClass: string }> = [
  { grade: 1, label: "Raté", key: "1", colorClass: "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" },
  { grade: 3, label: "Difficile", key: "3", colorClass: "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100" },
  { grade: 4, label: "Bien", key: "4", colorClass: "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" },
  { grade: 5, label: "Facile", key: "5", colorClass: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" },
];

function speakEnglish(text: string, rate = 0.92) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const enVoice =
    voices.find((v) => v.lang.startsWith("en") && !v.name.includes("Google")) ??
    voices.find((v) => v.lang.startsWith("en"));
  if (enVoice) utt.voice = enVoice;
  window.speechSynthesis.speak(utt);
}

function formatDue(dueDate: number): string {
  const now = Date.now();
  const diff = dueDate - now;
  if (diff <= 0) return "Due maintenant";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `Dans ${days} jour${days > 1 ? "s" : ""}`;
}

export function SRSFlashcardModal({
  isOpen,
  onClose,
  cards,
  dueCards: dueProp,
  onGrade,
  title = "Répétition espacée",
  forceAll = false,
}: SRSFlashcardModalProps) {
  const dueCards = useMemo(
    () =>
      dueProp
        ? dueProp
        : forceAll
        ? cards
        : cards.filter((c) => c.dueDate <= Date.now()),
    [dueProp, cards, forceAll]
  );

  const [queue, setQueue] = useState<SRSCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQueue(dueCards);
      setCurrentIdx(0);
      setIsFlipped(false);
      setIsFinished(false);
      setReviewed(0);
    }
  }, [isOpen, dueCards]);

  const currentCard = queue[currentIdx];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (!prev && currentCard) speakEnglish(currentCard.correction.corrected);
      return !prev;
    });
  }, [currentCard]);

  const handleGrade = useCallback(
    (grade: SRSGrade) => {
      if (!currentCard) return;
      onGrade(currentCard.key, grade);
      setReviewed((r) => r + 1);

      if (currentIdx + 1 < queue.length) {
        setIsFlipped(false);
        setCurrentIdx((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    },
    [currentCard, currentIdx, queue.length, onGrade]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === " " && !isFinished) { e.preventDefault(); handleFlip(); }
      else if (isFlipped && !isFinished) {
        if (e.key === "1") handleGrade(1);
        else if (e.key === "2") handleGrade(3);
        else if (e.key === "3") handleGrade(4);
        else if (e.key === "4") handleGrade(5);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isFlipped, isFinished, handleFlip, handleGrade, onClose]);

  if (!isOpen) return null;

  const config = currentCard ? TYPE_CONFIG[currentCard.correction.type] : null;
  const IconComponent = config?.Icon ?? GrammarIcon;
  const progressPct = queue.length > 0 ? Math.round((currentIdx / queue.length) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="srs-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-700/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-500 flex items-center justify-center">
              <CardsIcon size={16} />
            </div>
            <div>
              <h2 id="srs-title" className="text-sm font-semibold text-brown-600">{title}</h2>
              {!isFinished && queue.length > 0 && (
                <p className="text-xs text-brown-300">
                  {currentIdx + 1}/{queue.length} cartes dues
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-brown-200 hover:text-brown-600 hover:bg-cream-200 rounded-full transition-colors" aria-label="Fermer">
            <XIcon size={18} />
          </button>
        </div>

        {/* Progression */}
        {!isFinished && queue.length > 0 && (
          <div className="w-full bg-cream-200 h-1.5">
            <div className="bg-terracotta-500 h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        <div className="p-6 flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckIcon size={32} className="text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-brown-600">Aucune carte due aujourd'hui !</p>
              <p className="text-xs text-brown-300">
                {cards.length > 0
                  ? `Prochaine révision : ${formatDue(Math.min(...cards.map((c) => c.dueDate)))}`
                  : "Faites des conversations pour générer des cartes."}
              </p>
              {cards.length > 0 && (
                <button
                  onClick={() => {
                    setQueue(cards);
                    setCurrentIdx(0);
                    setIsFlipped(false);
                    setIsFinished(false);
                    setReviewed(0);
                  }}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Réviser toutes les cartes ({cards.length})
                </button>
              )}
              <button onClick={onClose} className="btn-ghost text-xs block mx-auto">Fermer</button>
            </div>
          ) : isFinished ? (
            <div className="text-center py-6 space-y-5 animate-slide-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                <SparklesIcon size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brown-600">Session terminée !</h3>
                <p className="text-sm text-brown-300 mt-1">{reviewed} carte{reviewed > 1 ? "s" : ""} révisée{reviewed > 1 ? "s" : ""}</p>
              </div>
              <p className="text-xs text-brown-300 bg-cream-100 border border-cream-200 rounded-lg px-4 py-2.5">
                Les cartes difficiles reviendront bientôt. Les faciles, dans plusieurs jours.
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="btn-primary text-xs py-2 px-4">Fermer</button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Carte */}
              <div
                onClick={handleFlip}
                role="button"
                tabIndex={0}
                aria-label="Cliquer pour retourner la carte"
                className={`relative min-h-[200px] rounded-xl border-2 cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between select-none
                  ${isFlipped
                    ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-50"
                    : "bg-cream-100/70 hover:bg-cream-100 border-dashed border-brown-200 hover:border-brown-300 shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between">
                  {config && (
                    <span className={`type-badge ${config.badgeClass}`}>
                      <IconComponent size={12} />
                      {config.label}
                    </span>
                  )}
                  <span className="text-[10px] text-brown-200">
                    {currentCard && formatDue(currentCard.dueDate)}
                  </span>
                </div>

                <div className="py-4 text-center my-auto">
                  {!isFlipped ? (
                    <div>
                      <p className="text-xs text-brown-300 uppercase tracking-widest mb-2">Votre formulation :</p>
                      <p className="text-lg font-serif text-brown-600 italic bg-terracotta-50/60 inline-block px-3 py-1.5 rounded-md border border-terracotta-100">
                        "{currentCard?.correction.original}"
                      </p>
                      <p className="text-xs text-brown-300 mt-4">Espace ou clic pour voir la correction</p>
                    </div>
                  ) : (
                    <div className="animate-fade-in space-y-3">
                      <p className="text-xs text-emerald-700 font-semibold uppercase tracking-widest">Formulation correcte :</p>
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-xl font-semibold text-brown-700">{currentCard?.correction.corrected}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); if (currentCard) speakEnglish(currentCard.correction.corrected); }}
                          className="p-2 rounded-full border bg-cream-100 text-brown-500 hover:bg-cream-200 border-cream-300"
                          aria-label="Écouter"
                        >
                          <VolumeIcon size={14} />
                        </button>
                      </div>
                      <div className="bg-cream-50 rounded-lg p-3 border border-cream-200 text-left text-xs text-brown-400">
                        <span className="font-semibold text-brown-500 block mb-1">Explication :</span>
                        {currentCard?.correction.explication_fr}
                      </div>
                      {currentCard && currentCard.reviewCount > 0 && (
                        <p className="text-[10px] text-brown-200">
                          Révision #{currentCard.reviewCount} — Intervalle actuel : {currentCard.interval} jour{currentCard.interval > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons de notation */}
              {isFlipped ? (
                <div className="space-y-2 animate-slide-up">
                  <p className="text-[11px] text-brown-300 text-center uppercase tracking-widest">
                    Comment avez-vous trouvé cette carte ?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADE_LABELS.map(({ grade, label, key, colorClass }) => (
                      <button
                        key={grade}
                        onClick={() => handleGrade(grade)}
                        className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all active:scale-[0.97] ${colorClass}`}
                      >
                        {label} ({key})
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-brown-200 text-center">Raccourcis : [1] Raté · [2] Difficile · [3] Bien · [4] Facile</p>
                </div>
              ) : (
                <button onClick={handleFlip} className="btn-primary w-full py-2.5 text-xs">
                  Voir la correction (Espace)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
