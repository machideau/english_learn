"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import type { Level } from "@/types";
import {
  HeadphonesIcon,
  CheckIcon,
  XIcon,
  VolumeIcon,
  SpinnerIcon,
} from "@/components/ui/Icons";
interface DictationSentence {
  text: string;
  difficulty: "easy" | "medium" | "hard";
  audioBase64?: string;
  mimeType?: string;
}

interface DictationResult {
  sentence: string;
  userInput: string;
  correct: boolean;
  diff: Array<{ word: string; ok: boolean }>;
}

interface DictationModeProps {
  level: Level;
  topic?: string;
  voiceId?: string;
  onClose?: () => void;
}

async function fetchSentences(level: Level, topic?: string): Promise<DictationSentence[]> {
  const res = await fetch("/api/dictation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, topic, count: 5 }),
  });
  if (!res.ok) throw new Error("Impossible de charger les phrases");
  const data = await res.json();
  return data.sentences as DictationSentence[];
}

async function fetchAudio(
  text: string,
  voiceId?: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceId ?? "" }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
    if (v) utt.voice = v;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    setTimeout(resolve, 20_000);
    window.speechSynthesis.speak(utt);
  });
}

function computeDiff(
  userInput: string,
  reference: string
): Array<{ word: string; ok: boolean }> {
  const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:'"]/g, "").trim();
  const refWords = reference.split(/\s+/).filter(Boolean);
  const userWords = userInput.split(/\s+/).filter(Boolean);

  return refWords.map((word, i) => ({
    word,
    ok: normalize(userWords[i] ?? "") === normalize(word),
  }));
}

export function DictationMode({ level, topic, voiceId, onClose }: DictationModeProps) {
  const [sentences, setSentences] = useState<DictationSentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<DictationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [currentResult, setCurrentResult] = useState<DictationResult | null>(null);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchSentences(level, topic)
      .then((s) => {
        setSentences(s);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [level, topic]);

  const currentSentence = sentences[currentIdx];

  const playAudio = useCallback(async () => {
    if (!currentSentence || isPlaying) return;
    setIsPlaying(true);
    setHasPlayed(true);

    if (currentSentence.audioBase64) {
      const audio = new Audio(
        `data:${currentSentence.mimeType};base64,${currentSentence.audioBase64}`
      );
      await new Promise<void>((r) => {
        audio.onended = () => r();
        audio.onerror = () => r();
        audio.play().catch(() => r());
      });
    } else {
      const audioData = await fetchAudio(currentSentence.text, voiceId);
      if (audioData) {
        setSentences((prev) =>
          prev.map((s, i) =>
            i === currentIdx
              ? { ...s, audioBase64: audioData.audioBase64, mimeType: audioData.mimeType }
              : s
          )
        );
        const audio = new Audio(`data:${audioData.mimeType};base64,${audioData.audioBase64}`);
        await new Promise<void>((r) => {
          audio.onended = () => r();
          audio.onerror = () => r();
          audio.play().catch(() => r());
        });
      } else {
        await speakWithBrowser(currentSentence.text);
      }
    }
    setIsPlaying(false);
    // Focus input after playback
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentSentence, currentIdx, isPlaying, voiceId]);

  const checkAnswer = useCallback(() => {
    if (!currentSentence || !userInput.trim()) return;
    setIsChecking(true);

    const diff = computeDiff(userInput.trim(), currentSentence.text);
    const correctWords = diff.filter((d) => d.ok).length;
    const correct = correctWords === diff.length;

    const result: DictationResult = {
      sentence: currentSentence.text,
      userInput: userInput.trim(),
      correct,
      diff,
    };
    setCurrentResult(result);
    setResults((prev) => [...prev, result]);
    setIsChecking(false);
  }, [currentSentence, userInput]);

  const nextSentence = useCallback(() => {
    if (currentIdx + 1 >= sentences.length) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setUserInput("");
    setCurrentResult(null);
    setHasPlayed(false);
  }, [currentIdx, sentences.length]);

  const restart = useCallback(() => {
    setCurrentIdx(0);
    setUserInput("");
    setResults([]);
    setCurrentResult(null);
    setHasPlayed(false);
    setFinished(false);
    setIsLoading(true);
    fetchSentences(level, topic)
      .then((s) => {
        setSentences(s);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [level, topic]);

  // Raccourcis clavier globaux
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      // Ne pas interférer si l'utilisateur est dans un input
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Espace → écouter
      if (e.key === " " && !hasPlayed && !isPlaying && !currentResult && currentSentence && !isLoading) {
        e.preventDefault();
        playAudio();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPlayed, isPlaying, currentResult, currentSentence, isLoading, playAudio]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <SpinnerIcon size={28} className="animate-spin text-terracotta-400" />
        <p className="text-sm text-brown-300">Préparation de la dictée…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-sm text-terracotta-600">{error}</p>
        <button onClick={restart} className="btn-primary text-xs py-2 px-4">
          Réessayer
        </button>
      </div>
    );
  }

  if (finished) {
    const score = results.filter((r) => r.correct).length;
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3">
            <CheckIcon size={28} />
          </div>
          <h3 className="text-base font-semibold text-brown-600">Dictée terminée !</h3>
          <p className="text-sm text-brown-300 mt-1">
            {score}/{results.length} phrases correctes
          </p>
        </div>

        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="card-inset text-xs space-y-1.5">
              <div className="flex items-center gap-1.5">
                {r.correct ? (
                  <CheckIcon size={12} className="text-emerald-500" />
                ) : (
                  <XIcon size={12} className="text-terracotta-500" />
                )}
                <span className="font-medium text-brown-500">Phrase {i + 1}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.diff.map((d, j) => (
                  <span
                    key={j}
                    className={
                      d.ok
                        ? "text-brown-600"
                        : "text-terracotta-600 font-semibold underline decoration-dotted"
                    }
                  >
                    {d.word}
                  </span>
                ))}
              </div>
              {!r.correct && (
                <p className="text-brown-300 italic">Votre réponse : "{r.userInput}"</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={restart} className="btn-primary text-xs py-2 px-4">
            Nouvelle dictée
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
              Fermer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progression */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cream-200 rounded-full h-1.5">
          <div
            className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentIdx / sentences.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-brown-300 shrink-0">
          {currentIdx + 1} / {sentences.length}
        </span>
      </div>

      {/* Zone d'écoute */}
      <div className="card text-center py-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs text-brown-300 uppercase tracking-widest font-medium">
          <HeadphonesIcon size={14} />
          <span>Écoutez et écrivez</span>
        </div>

        <button
          onClick={playAudio}
          disabled={isPlaying}
          className={[
            "inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm shadow-sm transition-all active:scale-95",
            isPlaying
              ? "bg-terracotta-100 text-terracotta-500 border border-terracotta-200 animate-pulse cursor-wait"
              : hasPlayed
              ? "bg-cream-100 hover:bg-cream-200 text-brown-600 border border-cream-300"
              : "bg-terracotta-500 hover:bg-terracotta-600 text-white border border-terracotta-600",
          ].join(" ")}
        >
          {isPlaying ? (
            <>
              <SpinnerIcon size={16} className="animate-spin" />
              Lecture…
            </>
          ) : (
            <>
              <VolumeIcon size={16} />
              {hasPlayed ? "Réécouter" : "Écouter la phrase"}
            </>
          )}
        </button>
        {!hasPlayed && !isPlaying && (
          <p className="text-[11px] text-brown-300">
            Cliquez ou appuyez sur <kbd className="bg-cream-200 border border-cream-300 px-1 py-0.5 rounded text-[10px]">Espace</kbd>
          </p>
        )}

        {hasPlayed && !currentResult && (
          <p className="text-xs text-brown-300">
            Tapez ce que vous avez entendu ci-dessous
          </p>
        )}
      </div>

      {/* Saisie */}
      {hasPlayed && !currentResult && (
        <div className="space-y-3 animate-slide-up">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && userInput.trim() && checkAnswer()}
            placeholder="Écrivez la phrase en anglais…"
            className="input-field"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            onClick={checkAnswer}
            disabled={!userInput.trim() || isChecking}
            className="btn-primary w-full py-2.5"
          >
            Vérifier (Entrée)
          </button>
        </div>
      )}

      {/* Résultat de la phrase courante */}
      {currentResult && (
        <div className="card-inset space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {currentResult.correct ? (
              <>
                <CheckIcon size={16} className="text-emerald-500" />
                <span className="text-emerald-600">Parfait !</span>
              </>
            ) : (
              <>
                <XIcon size={16} className="text-terracotta-500" />
                <span className="text-terracotta-600">Quelques erreurs</span>
              </>
            )}
          </div>

          <div>
            <p className="text-[11px] text-brown-300 uppercase tracking-widest mb-1">
              Correction mot par mot :
            </p>
            <div className="flex flex-wrap gap-1">
              {currentResult.diff.map((d, i) => (
                <span
                  key={i}
                  className={[
                    "px-1.5 py-0.5 rounded text-xs font-medium",
                    d.ok
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-terracotta-50 text-terracotta-700 border border-terracotta-200 line-through decoration-terracotta-400",
                  ].join(" ")}
                >
                  {d.word}
                </span>
              ))}
            </div>
          </div>

          <button onClick={nextSentence} className="btn-primary w-full text-sm py-2.5">
            {currentIdx + 1 < sentences.length ? "Phrase suivante" : "Voir le bilan"}
          </button>
        </div>
      )}
    </div>
  );
}
