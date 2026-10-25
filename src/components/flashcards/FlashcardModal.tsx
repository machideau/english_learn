"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Correction, CorrectionType } from "@/types";
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

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  corrections: Correction[];
  title?: string;
}

const TYPE_CONFIG: Record<
  CorrectionType,
  {
    label: string;
    badgeClass: string;
    Icon: React.FC<{ size?: number; className?: string }>;
  }
> = {
  grammaire: {
    label: "Grammaire",
    badgeClass: "bg-blue-50 border-blue-100 text-blue-600",
    Icon: GrammarIcon,
  },
  vocabulaire: {
    label: "Vocabulaire",
    badgeClass: "bg-violet-50 border-violet-100 text-violet-600",
    Icon: BookIcon,
  },
  tournure: {
    label: "Tournure",
    badgeClass: "bg-emerald-50 border-emerald-100 text-emerald-600",
    Icon: RefreshIcon,
  },
  prononciation: {
    label: "Prononciation",
    badgeClass: "bg-terracotta-50 border-terracotta-100 text-terracotta-600",
    Icon: WaveIcon,
  },
};

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

export function FlashcardModal({
  isOpen,
  onClose,
  corrections,
  title = "Révision des erreurs",
}: FlashcardModalProps) {
  // Dédupliquer les corrections identiques
  const uniqueCards = useMemo(() => {
    const seen = new Set<string>();
    const res: Correction[] = [];
    for (const c of corrections) {
      const key = `${c.original.trim().toLowerCase()}->${c.corrected.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        res.push(c);
      }
    }
    return res;
  }, [corrections]);

  const [activeCards, setActiveCards] = useState<Correction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Correction[]>([]);
  const [toReview, setToReview] = useState<Correction[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setActiveCards(uniqueCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMastered([]);
      setToReview([]);
      setIsFinished(false);
    }
  }, [isOpen, uniqueCards]);

  const currentCard = activeCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && currentCard) {
        // Prononcer automatiquement la correction au verso pour stimuler l'écoute
        speakEnglish(currentCard.corrected);
      }
      return next;
    });
  }, [currentCard]);

  const handlePlayAudio = (slow = false) => {
    if (!currentCard) return;
    setIsPlayingAudio(true);
    speakEnglish(currentCard.corrected, slow ? 0.75 : 0.95);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleAnswer = useCallback(
    (success: boolean) => {
      if (!currentCard) return;

      if (success) {
        setMastered((prev) => [...prev, currentCard]);
      } else {
        setToReview((prev) => [...prev, currentCard]);
      }

      if (currentIndex + 1 < activeCards.length) {
        setIsFlipped(false);
        setCurrentIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    },
    [currentCard, currentIndex, activeCards.length]
  );

  const handleRestartFailed = () => {
    if (toReview.length === 0) return;
    setActiveCards(toReview);
    setCurrentIndex(0);
    setIsFlipped(false);
    setToReview([]);
    setIsFinished(false);
  };

  const handleRestartAll = () => {
    setActiveCards(uniqueCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMastered([]);
    setToReview([]);
    setIsFinished(false);
  };

  // Raccourcis clavier (Espace pour retourner, 1 pour revoir, 2 pour maîtrisé, Echap pour fermer)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && !isFinished) {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && !isFinished) {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAnswer(false);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFlipped, isFinished, handleFlip, handleAnswer, onClose]);

  if (!isOpen) return null;

  const totalCards = activeCards.length;
  const progressPercent = totalCards > 0 ? Math.round(((currentIndex) / totalCards) * 100) : 0;
  const config = currentCard ? TYPE_CONFIG[currentCard.type] : null;
  const IconComponent = config?.Icon ?? GrammarIcon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-700/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header de la modale */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-500 flex items-center justify-center">
              <CardsIcon size={16} />
            </div>
            <div>
              <h2 id="flashcard-title" className="text-sm font-semibold text-brown-600">
                {title}
              </h2>
              {!isFinished && totalCards > 0 && (
                <p className="text-xs text-brown-300">
                  Carte {currentIndex + 1} sur {totalCards}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-200 hover:text-brown-600 hover:bg-cream-200 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Barre de progression */}
        {!isFinished && totalCards > 0 && (
          <div className="w-full bg-cream-200 h-1.5">
            <div
              className="bg-terracotta-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Corps principal */}
        <div className="p-6 flex-1 overflow-y-auto">
          {totalCards === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-brown-300">
                Aucune erreur enregistrée à réviser. Vous pouvez continuer à vous entraîner !
              </p>
              <button onClick={onClose} className="btn-primary mt-4">
                Fermer
              </button>
            </div>
          ) : isFinished ? (
            /* Écran de résultats / Bilan */
            <div className="text-center py-6 space-y-6 animate-slide-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                <SparklesIcon size={32} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brown-600">
                  Session de révision terminée !
                </h3>
                <p className="text-sm text-brown-300 mt-1">
                  Voici le bilan de votre pratique de mémorisation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="card-inset text-center py-3 bg-emerald-50/60 border-emerald-200">
                  <span className="block text-2xl font-bold text-emerald-600">
                    {mastered.length}
                  </span>
                  <span className="text-xs text-emerald-700">Maîtrisées</span>
                </div>
                <div className="card-inset text-center py-3 bg-terracotta-50/60 border-terracotta-200">
                  <span className="block text-2xl font-bold text-terracotta-600">
                    {toReview.length}
                  </span>
                  <span className="text-xs text-terracotta-700">À retravailler</span>
                </div>
              </div>

              {toReview.length > 0 && (
                <div className="text-left bg-cream-100 rounded-lg p-4 border border-cream-200 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-brown-400 uppercase tracking-wider mb-2">
                    Points encore hésitants :
                  </p>
                  <ul className="space-y-2 text-xs">
                    {toReview.map((c, i) => (
                      <li key={i} className="border-b border-cream-200 pb-1.5 last:border-none">
                        <span className="line-through text-brown-200 mr-2">{c.original}</span>
                        <span className="font-medium text-brown-600">{c.corrected}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {toReview.length > 0 && (
                  <button
                    onClick={handleRestartFailed}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <RotateCcwIcon size={14} />
                    Revoir les {toReview.length} hésitantes
                  </button>
                )}
                <button
                  onClick={handleRestartAll}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  <RotateCcwIcon size={14} />
                  Recommencer tout
                </button>
                <button
                  onClick={onClose}
                  className="btn-ghost text-xs py-2 px-4"
                >
                  Terminer
                </button>
              </div>
            </div>
          ) : (
            /* Carte de révision interactive */
            <div className="space-y-5">
              {/* Carte Flashcard */}
              <div
                onClick={handleFlip}
                role="button"
                tabIndex={0}
                aria-label="Cliquer pour retourner la carte"
                className={`relative min-h-[220px] rounded-xl border-2 cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between select-none
                  ${
                    isFlipped
                      ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-50"
                      : "bg-cream-100/70 hover:bg-cream-100 border-dashed border-brown-200 hover:border-brown-300 shadow-sm"
                  }
                `}
              >
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between">
                  {config && (
                    <span className={`type-badge ${config.badgeClass}`}>
                      <IconComponent size={12} />
                      {config.label}
                    </span>
                  )}
                  <span className="text-[11px] text-brown-200 italic">
                    {isFlipped ? "Verso : Solution & Explication" : "Recto : Cliquez pour révéler"}
                  </span>
                </div>

                {/* Contenu de la carte */}
                <div className="py-4 text-center my-auto">
                  {!isFlipped ? (
                    <div>
                      <p className="text-xs text-brown-300 uppercase tracking-widest mb-2 font-medium">
                        Votre formulation :
                      </p>
                      <p className="text-lg font-serif text-brown-600 italic bg-terracotta-50/60 inline-block px-3 py-1.5 rounded-md border border-terracotta-100">
                        "{currentCard.original}"
                      </p>
                      <p className="text-xs text-brown-400 mt-4 inline-flex items-center justify-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                          <path d="M9 18h6" />
                          <path d="M10 22h4" />
                        </svg>
                        <span>Comment diriez-vous cela correctement en anglais ?</span>
                      </p>
                    </div>
                  ) : (
                    <div className="animate-fade-in space-y-3">
                      <p className="text-xs text-emerald-700 font-semibold uppercase tracking-widest">
                        Formulation correcte :
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-xl font-semibold text-brown-700">
                          {currentCard.corrected}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAudio(false);
                          }}
                          className={`p-2 rounded-full border transition-all ${
                            isPlayingAudio
                              ? "bg-terracotta-500 text-white border-terracotta-600 scale-110"
                              : "bg-cream-100 text-brown-500 hover:bg-cream-200 border-cream-300"
                          }`}
                          aria-label="Écouter la prononciation"
                          title="Écouter la prononciation"
                        >
                          <VolumeIcon size={16} />
                        </button>
                      </div>

                      {/* Explication pédagogique */}
                      <div className="bg-cream-50 rounded-lg p-3 border border-cream-200 text-left text-xs text-brown-400 mt-3">
                        <span className="font-semibold text-brown-500 block mb-1">
                          Pourquoi cette correction ?
                        </span>
                        {currentCard.explication_fr}
                      </div>
                    </div>
                  )}
                </div>

                {/* Indication basse */}
                <div className="text-center pt-2 border-t border-cream-200/60">
                  <p className="text-[11px] text-brown-200">
                    {isFlipped
                      ? "Écoutez l'audio ou choisissez votre niveau de maîtrise ci-dessous"
                      : "Espace ou clic pour vérifier"}
                  </p>
                </div>
              </div>

              {/* Boutons d'action en bas */}
              {isFlipped ? (
                <div className="flex items-center gap-3 animate-slide-up">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-600 border border-terracotta-200 text-xs font-semibold transition-all active:scale-[0.98]"
                  >
                    <XIcon size={14} />
                    À retravailler (1)
                  </button>

                  <button
                    onClick={() => handlePlayAudio(true)}
                    className="p-2.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-brown-400 border border-cream-300 text-xs transition-colors shrink-0"
                    title="Écouter lentement (0.75x)"
                    aria-label="Écouter au ralenti"
                  >
                    <VolumeIcon size={14} />
                    <span className="text-[10px] ml-1 font-mono">0.75x</span>
                  </button>

                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
                  >
                    <CheckIcon size={14} />
                    Bien compris ! (2)
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFlip}
                  className="btn-primary w-full py-2.5 text-xs font-medium"
                >
                  Révéler la correction (Espace)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer avec compteurs */}
        {!isFinished && totalCards > 0 && (
          <div className="px-5 py-3 bg-cream-100 border-t border-cream-200 flex items-center justify-between text-xs text-brown-300">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckIcon size={12} /> {mastered.length} maîtrisé{mastered.length > 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 text-terracotta-600 font-medium">
                <XIcon size={12} /> {toReview.length} à revoir
              </span>
            </div>
            <span className="text-[11px] text-brown-200">
              Raccourcis : [Espace] [1] [2]
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
