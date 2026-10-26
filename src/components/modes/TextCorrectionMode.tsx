"use client";
import { useState, useCallback } from "react";
import type { Level, Correction } from "@/types";
import { CorrectionCard } from "@/components/corrections/CorrectionCard";
import { FileEditIcon, CheckIcon, SpinnerIcon } from "@/components/ui/Icons";

interface TextCorrectionResult {
  correctedText: string;
  corrections: Correction[];
  overallComment: string;
  score: number;
}

interface TextCorrectionModeProps {
  level: Level;
  onCorrectionsFound?: (corrections: Correction[]) => void;
  onClose?: () => void;
}

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
      ? "bg-yellow-400"
      : "bg-terracotta-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-brown-400">
        <span>Score de qualité</span>
        <span className="font-semibold text-brown-600">{score}/100</span>
      </div>
      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function TextCorrectionMode({
  level,
  onCorrectionsFound,
  onClose,
}: TextCorrectionModeProps) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextCorrectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCorrect = useCallback(async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/correct-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), level }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la correction");
      }

      const data: TextCorrectionResult = await res.json();
      setResult(data);
      if (data.corrections.length > 0) {
        onCorrectionsFound?.(data.corrections);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [text, level, onCorrectionsFound]);

  const reset = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!result ? (
        /* Zone de saisie */
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-brown-300 font-medium uppercase tracking-widest">
            <FileEditIcon size={14} />
            <span>Coller votre texte en anglais</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your English text here and get detailed corrections and explanations…"
            className="input-field min-h-[160px] resize-y text-sm leading-relaxed"
            spellCheck={false}
            autoComplete="off"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-brown-200">
              {text.length}/3000 caractères
            </span>
            <div className="flex gap-2">
              {onClose && (
                <button onClick={onClose} className="btn-ghost text-xs">
                  Annuler
                </button>
              )}
              <button
                onClick={handleCorrect}
                disabled={!text.trim() || isLoading || text.length > 3000}
                className="btn-primary text-xs py-2 px-4"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon size={14} className="animate-spin" />
                    Correction en cours…
                  </>
                ) : (
                  <>
                    <CheckIcon size={14} />
                    Corriger le texte
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-terracotta-600 bg-terracotta-50 border border-terracotta-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Résultats */
        <div className="space-y-5 animate-fade-in">
          {/* Score */}
          <ScoreMeter score={result.score} />

          {/* Commentaire global */}
          <div className="card-inset bg-cream-50/80 text-sm text-brown-500 leading-relaxed">
            <p className="text-[11px] text-brown-300 uppercase tracking-widest font-medium mb-1.5">
              Commentaire général
            </p>
            <p>{result.overallComment}</p>
          </div>

          {/* Texte corrigé */}
          {result.correctedText !== text && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-brown-300 uppercase tracking-widest font-medium">
                Version corrigée
              </p>
              <div className="card-inset text-sm text-brown-600 leading-relaxed whitespace-pre-wrap bg-emerald-50/50 border-emerald-200">
                {result.correctedText}
              </div>
            </div>
          )}

          {result.correctedText === text && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckIcon size={16} />
              Votre texte est correct !
            </div>
          )}

          {/* Corrections détaillées */}
          {result.corrections.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-brown-300 uppercase tracking-widest font-medium">
                {result.corrections.length} correction{result.corrections.length > 1 ? "s" : ""}
              </p>
              {result.corrections.map((c, i) => (
                <CorrectionCard key={i} correction={c} index={i} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-cream-200">
            <button onClick={reset} className="btn-secondary text-xs py-2 px-4 flex-1">
              Nouveau texte
            </button>
            {onClose && (
              <button onClick={onClose} className="btn-ghost text-xs">
                Fermer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
