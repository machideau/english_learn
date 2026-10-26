"use client";
import { useState, useRef, useCallback } from "react";
import {
  PLACEMENT_QUESTIONS,
  evaluatePlacementAnswers,
  savePlacementResult,
} from "@/lib/placement-test";
import type { Level, PlacementTestResult } from "@/types";
import {
  TrophyIcon,
  XIcon,
  MicIcon,
  StopIcon,
  CheckIcon,
  SparkleIcon,
  ShareIcon,
} from "@/components/ui/Icons";

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelAssigned: (level: Level) => void;
  onOpenShareCard?: (data: { levelTitle: string; fluencyScore: number; accuracyScore: number }) => void;
}

export function PlacementTestModal({
  isOpen,
  onClose,
  onLevelAssigned,
  onOpenShareCard,
}: PlacementTestModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<PlacementTestResult | null>(null);

  const recognitionRef = useRef<any>(null);

  const currentQ = PLACEMENT_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === PLACEMENT_QUESTIONS.length - 1;

  // Speech Recognition pour le test
  const startRecording = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas disponible sur ce navigateur. Vous pouvez taper votre réponse.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setCurrentText(transcript.trim());
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleNextQuestion = () => {
    if (!currentText.trim()) return;

    const newAnswers = { ...answers, [currentQ.id]: currentText.trim() };
    setAnswers(newAnswers);
    setCurrentText("");

    if (isLastQuestion) {
      // Évaluation finale
      setEvaluating(true);
      setTimeout(() => {
        const payload = Object.entries(newAnswers).map(([questionId, text]) => ({
          questionId,
          text,
        }));
        const res = evaluatePlacementAnswers(payload);
        setResult(res);
        savePlacementResult(res);
        setEvaluating(false);
      }, 1000);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleApplyResult = () => {
    if (result) {
      onLevelAssigned(result.matchedLevel);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-100/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shrink-0">
              <TrophyIcon size={18} />
            </div>
            <div>
              <h2 id="placement-modal-title" className="text-sm font-bold text-brown-800">
                Test de Niveau CEFR (A1 - C1)
              </h2>
              <p className="text-[11px] text-brown-400">
                {result
                  ? "Votre résultat officiel et recommandations"
                  : `Question ${currentIndex + 1} sur ${PLACEMENT_QUESTIONS.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 rounded-full hover:bg-cream-200 transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-5">
          {evaluating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-terracotta-200 border-t-terracotta-600 animate-spin" />
              <div className="font-bold text-sm text-brown-700">
                Analyse de votre expression en cours…
              </div>
              <p className="text-xs text-brown-400 max-w-xs">
                Calcul de la richesse lexicale, de la structure grammaticale et de l'aisance orale.
              </p>
            </div>
          ) : result ? (
            /* Écran de résultat */
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-4 bg-gradient-to-br from-terracotta-500 to-terracotta-700 rounded-2xl text-white p-5 shadow-sm">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-white/80">
                  Votre Niveau Officiel Estimé
                </span>
                <div className="text-4xl font-black my-1 tracking-tight">
                  {result.cefrLevel}
                </div>
                <div className="text-xs font-medium text-white/90 capitalize">
                  Niveau {result.matchedLevel} - Score global : {result.overallScore}%
                </div>
              </div>

              {/* 3 Métriques */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-cream-200">
                  <div className="text-base font-bold text-brown-700">{result.vocabularyScore}%</div>
                  <div className="text-[10px] text-brown-400">Vocabulaire</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cream-200">
                  <div className="text-base font-bold text-brown-700">{result.grammarScore}%</div>
                  <div className="text-[10px] text-brown-400">Grammaire</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cream-200">
                  <div className="text-base font-bold text-terracotta-600">{result.fluencyScore}%</div>
                  <div className="text-[10px] text-brown-400">Aisance</div>
                </div>
              </div>

              {/* Feedback personnalisé */}
              <div className="bg-white p-3.5 rounded-xl border border-cream-200 text-xs">
                <span className="font-bold text-brown-700 block mb-1">Diagnostique :</span>
                <p className="text-brown-500 leading-relaxed text-[11px]">
                  {result.summaryFeedbackFr}
                </p>
              </div>

              {/* Recommandations */}
              <div className="bg-cream-100/70 p-3.5 rounded-xl border border-cream-200 text-xs space-y-1.5">
                <span className="font-bold text-brown-700 block">Prochaines étapes recommandées :</span>
                <ul className="space-y-1 text-[11px] text-brown-500">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-terracotta-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Écran de questions */
            <div className="space-y-4">
              {/* Jauge de progression */}
              <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-cream-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-100">
                    Palier ciblé : {currentQ.targetLevel}
                  </span>
                  <span className="text-[10px] text-brown-300">
                    {currentIndex + 1} / {PLACEMENT_QUESTIONS.length}
                  </span>
                </div>

                <div className="text-xs font-semibold text-brown-800">
                  {currentQ.promptEn}
                </div>
                <div className="text-[11px] text-brown-400 italic">
                  🇫🇷 {currentQ.promptFr}
                </div>
              </div>

              {/* Zone de saisie / dictée vocale */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="Parlez dans le micro ou tapez votre réponse en anglais ici…"
                    rows={4}
                    className="w-full text-xs p-3 rounded-xl border border-cream-200 focus:outline-none focus:border-terracotta-400 bg-white resize-none text-brown-700 placeholder-brown-300"
                  />
                  {isRecording && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Écoute en cours…
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={[
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors shadow-sm",
                      isRecording
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-700 border border-terracotta-200",
                    ].join(" ")}
                  >
                    {isRecording ? <StopIcon size={14} /> : <MicIcon size={14} />}
                    <span>{isRecording ? "Arrêter l'enregistrement" : "Répondre à la voix"}</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={!currentText.trim()}
                    className="px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>{isLastQuestion ? "Terminer & Évaluer" : "Question suivante"}</span>
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
            </div>
          )}
        </div>

        {/* Footer si résultat */}
        {result && (
          <div className="p-4 border-t border-cream-200 bg-white flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplyResult}
              className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckIcon size={14} />
              <span>Adopter le niveau {result.matchedLevel}</span>
            </button>
            {onOpenShareCard && (
              <button
                onClick={() => {
                  onOpenShareCard({
                    levelTitle: `Niveau ${result.cefrLevel} (${result.matchedLevel})`,
                    fluencyScore: result.fluencyScore,
                    accuracyScore: result.grammarScore,
                  });
                }}
                className="p-2.5 rounded-xl border border-cream-200 bg-cream-50 hover:bg-cream-100 text-brown-600 transition-colors"
                title="Partager mon certificat"
              >
                <ShareIcon size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
