"use client";
import { useState, useCallback, useRef } from "react";
import type { Level, PronunciationScore } from "@/types";
import { RepeatIcon, MicIcon, CheckIcon, XIcon, VolumeIcon, SpinnerIcon } from "@/components/ui/Icons";

interface RepeatSentence {
  text: string;
  audioBase64?: string;
  mimeType?: string;
}

interface RepeatAfterMeProps {
  level: Level;
  topic?: string;
  voiceId?: string;
  onClose?: () => void;
}

type StepState = "loading" | "listening" | "recording" | "comparing" | "result";

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
    if (v) utt.voice = v;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    setTimeout(resolve, 15_000);
    window.speechSynthesis.speak(utt);
  });
}

// Generate a set of sentences from the API
async function fetchSentences(level: Level, topic?: string): Promise<string[]> {
  const res = await fetch("/api/dictation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, topic, count: 5 }),
  });
  if (!res.ok) throw new Error("Impossible de charger les phrases");
  const data = await res.json();
  return (data.sentences as Array<{ text: string }>).map((s) => s.text);
}

async function fetchAudio(text: string, voiceId?: string): Promise<{ audioBase64: string; mimeType: string } | null> {
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

export function RepeatAfterMeMode({ level, topic, voiceId, onClose }: RepeatAfterMeProps) {
  const [sentences, setSentences] = useState<RepeatSentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stepState, setStepState] = useState<StepState>("loading");
  const [userText, setUserText] = useState("");
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ sentence: string; userText: string; ok: boolean }>>([]);
  const [finished, setFinished] = useState(false);

  // Load sentences on mount
  const loaded = useRef(false);
  if (!loaded.current) {
    loaded.current = true;
    fetchSentences(level, topic)
      .then(async (texts) => {
        const loaded: RepeatSentence[] = texts.map((text) => ({ text }));
        setSentences(loaded);
        setStepState("listening");
      })
      .catch((err) => {
        setError(err.message ?? "Erreur de chargement");
        setStepState("result");
      });
  }

  const currentSentence = sentences[currentIdx];

  const playCurrentSentence = useCallback(async () => {
    if (!currentSentence) return;
    setStepState("listening");

    if (currentSentence.audioBase64) {
      const audio = new Audio(`data:${currentSentence.mimeType};base64,${currentSentence.audioBase64}`);
      await new Promise<void>((r) => {
        audio.onended = () => r();
        audio.onerror = () => r();
        audio.play().catch(() => r());
      });
    } else {
      // Try fetching TTS then fallback to browser
      const audioData = await fetchAudio(currentSentence.text, voiceId);
      if (audioData) {
        setSentences((prev) =>
          prev.map((s, i) =>
            i === currentIdx ? { ...s, audioBase64: audioData.audioBase64, mimeType: audioData.mimeType } : s
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
  }, [currentSentence, currentIdx, voiceId]);

  const startRecording = useCallback(async () => {
    if (!currentSentence) return;
    setStepState("recording");
    setUserText("");
    setScore(null);

    // Use Web Speech API for transcription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Reconnaissance vocale non disponible dans ce navigateur.");
      setStepState("listening");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r) => (r as SpeechRecognitionResult)[0].transcript)
        .join(" ")
        .trim();
      setUserText(transcript);
      setStepState("comparing");

      // Score de prononciation via l'API si disponible
      // On compare juste textuellement pour l'instant
      const similarity = computeSimilarity(transcript, currentSentence.text);
      const ok = similarity >= 0.7;
      setResults((prev) => [...prev, { sentence: currentSentence.text, userText: transcript, ok }]);
      setStepState("result");
    };

    recognition.onerror = () => {
      setError("Erreur de reconnaissance vocale. Réessayez.");
      setStepState("listening");
    };

    recognition.onend = () => {
      if (stepState === "recording") setStepState("listening");
    };

    recognition.start();
    // Auto-stop after 10s
    setTimeout(() => {
      try { recognition.stop(); } catch {}
    }, 10_000);
  }, [currentSentence, stepState]);

  const nextSentence = useCallback(() => {
    if (currentIdx + 1 >= sentences.length) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setStepState("listening");
    setUserText("");
    setScore(null);
    setError(null);
  }, [currentIdx, sentences.length]);

  if (stepState === "loading" && sentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <SpinnerIcon size={28} className="animate-spin text-terracotta-400" />
        <p className="text-sm text-brown-300">Préparation des phrases…</p>
      </div>
    );
  }

  if (finished) {
    const goodCount = results.filter((r) => r.ok).length;
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3">
            <CheckIcon size={28} />
          </div>
          <h3 className="text-base font-semibold text-brown-600">Exercice terminé !</h3>
          <p className="text-sm text-brown-300 mt-1">
            {goodCount}/{results.length} phrases correctement répétées
          </p>
        </div>

        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={[
                "card-inset text-xs flex items-start gap-2",
                r.ok ? "border-emerald-200 bg-emerald-50/50" : "border-terracotta-200 bg-terracotta-50/30",
              ].join(" ")}
            >
              {r.ok ? (
                <CheckIcon size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XIcon size={14} className="text-terracotta-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-brown-600">{r.sentence}</p>
                <p className="text-brown-300 italic mt-0.5">Vous : "{r.userText || "(rien détecté)"}"</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              setCurrentIdx(0);
              setResults([]);
              setFinished(false);
              setStepState("loading");
              loaded.current = false;
              fetchSentences(level, topic)
                .then((texts) => {
                  setSentences(texts.map((text) => ({ text })));
                  setStepState("listening");
                })
                .catch(() => setError("Erreur de chargement"));
            }}
            className="btn-primary text-xs py-2 px-4"
          >
            Nouvelles phrases
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

  const lastResult = results[results.length - 1];
  const showResult = stepState === "result" && lastResult?.sentence === currentSentence?.text;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progression */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cream-200 rounded-full h-1.5">
          <div
            className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx) / sentences.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-brown-300 shrink-0">
          {currentIdx + 1} / {sentences.length}
        </span>
      </div>

      {/* Phrase à répéter */}
      {currentSentence && (
        <div className="card text-center py-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-brown-300 uppercase tracking-widest font-medium">
            <RepeatIcon size={14} />
            <span>Répétez cette phrase</span>
          </div>

          <p className="text-lg font-semibold text-brown-700 px-4 leading-relaxed">
            "{currentSentence.text}"
          </p>

          <button
            onClick={playCurrentSentence}
            disabled={stepState === "recording" || stepState === "comparing"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-brown-500 text-xs font-medium transition-colors disabled:opacity-40"
          >
            <VolumeIcon size={14} />
            Réécouter
          </button>
        </div>
      )}

      {/* Résultat de la tentative */}
      {showResult && (
        <div
          className={[
            "card-inset text-sm animate-fade-in",
            lastResult.ok ? "border-emerald-300 bg-emerald-50/60" : "border-terracotta-200 bg-terracotta-50/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 mb-1">
            {lastResult.ok ? (
              <CheckIcon size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <XIcon size={15} className="text-terracotta-500 shrink-0" />
            )}
            <span className={lastResult.ok ? "text-emerald-700 font-semibold" : "text-terracotta-700 font-semibold"}>
              {lastResult.ok ? "Bien dit !" : "À améliorer"}
            </span>
          </div>
          <p className="text-xs text-brown-400 mt-1">
            Vous avez dit : <span className="italic">"{lastResult.userText || "(rien détecté)"}"</span>
          </p>
          {error && <p className="text-xs text-terracotta-500 mt-1">{error}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {stepState === "listening" && (
          <button
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
          >
            <MicIcon size={18} />
            Je répète
          </button>
        )}

        {stepState === "recording" && (
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-600 text-sm font-medium animate-pulse">
            <MicIcon size={16} />
            Enregistrement…
          </div>
        )}

        {stepState === "comparing" && (
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-cream-100 border border-cream-200 text-brown-400 text-sm">
            <SpinnerIcon size={16} className="animate-spin" />
            Analyse…
          </div>
        )}

        {stepState === "result" && (
          <button
            onClick={nextSentence}
            className="btn-primary text-sm py-2.5 px-6"
          >
            {currentIdx + 1 < sentences.length ? "Phrase suivante" : "Terminer"}
          </button>
        )}
      </div>
    </div>
  );
}

// Simple word-overlap similarity (0-1)
function computeSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  const wordsA = normalize(a);
  const wordsB = normalize(b);
  if (wordsB.length === 0) return 0;
  const setB = new Set(wordsB);
  const matches = wordsA.filter((w) => setB.has(w)).length;
  return matches / wordsB.length;
}
