"use client";
import { useEffect } from "react";
import type { PronunciationScore } from "@/types";
import { WaveIcon, XIcon } from "@/components/ui/Icons";

interface PronunciationToastProps {
  score: PronunciationScore;
  onDismiss: () => void;
  /** Durée en ms avant fermeture automatique (0 = pas de fermeture auto) */
  autoDismissMs?: number;
}

const CONFIDENCE_COLORS = {
  high:   "text-red-600 bg-red-50 border-red-100",
  medium: "text-terracotta-600 bg-terracotta-50 border-terracotta-100",
  low:    "text-brown-400 bg-cream-100 border-cream-200",
};

export function PronunciationToast({
  score,
  onDismiss,
  autoDismissMs = 8000,
}: PronunciationToastProps) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onDismiss, score]);

  if (score.issues.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in rounded-xl border border-terracotta-100 bg-cream-50 shadow-sm p-3 space-y-2"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-terracotta-600">
          <WaveIcon size={13} />
          Prononciation à travailler
        </div>
        <button
          onClick={onDismiss}
          className="text-brown-200 hover:text-brown-400 transition-colors"
          aria-label="Fermer"
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Warning fiabilité (mode LLM) */}
      {score.warning && (
        <p className="text-[11px] text-brown-200 leading-relaxed border-t border-cream-200 pt-2">
          {score.warning}
        </p>
      )}

      {/* Scores numériques Azure (si disponibles) */}
      {(score.accuracyScore !== undefined ||
        score.fluencyScore !== undefined) && (
        <div className="flex gap-3 text-xs text-brown-400 border-t border-cream-200 pt-2">
          {score.accuracyScore !== undefined && (
            <span>Précision : <strong className="text-brown-600">{score.accuracyScore}%</strong></span>
          )}
          {score.fluencyScore !== undefined && (
            <span>Fluidité : <strong className="text-brown-600">{score.fluencyScore}%</strong></span>
          )}
          {score.completenessScore !== undefined && (
            <span>Complétude : <strong className="text-brown-600">{score.completenessScore}%</strong></span>
          )}
        </div>
      )}

      {/* Mots problématiques */}
      <ul className="space-y-1.5 pt-1">
        {score.issues.map((issue, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span
              className={`inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${CONFIDENCE_COLORS[issue.confidence]}`}
            >
              {issue.word}
            </span>
            <span className="text-brown-300 leading-relaxed inline-flex items-center gap-1">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brown-200 shrink-0"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span>{issue.suggestion}</span>
              {issue.phonetic && (
                <span className="ml-1 text-brown-200 font-mono">
                  [{issue.phonetic}]
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
