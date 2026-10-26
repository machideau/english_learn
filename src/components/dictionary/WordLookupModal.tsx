"use client";
import { useState, useEffect } from "react";
import { SpeakerIcon, BookIcon, XIcon, SpinnerIcon, CheckIcon } from "@/components/ui/Icons";
import { playSuccessChime, playSubtleClick } from "@/lib/sound-effects";

interface WordLookupModalProps {
  word: string;
  onClose: () => void;
  onAddToSRS?: (word: string, definition: string, phonetic?: string) => void;
  alreadyInSRS?: boolean;
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export function WordLookupModal({
  word,
  onClose,
  onAddToSRS,
  alreadyInSRS = false,
}: WordLookupModalProps) {
  const cleanWord = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(alreadyInSRS);

  useEffect(() => {
    if (!cleanWord) return;
    setLoading(true);
    setError(null);

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`)
      .then((res) => {
        if (!res.ok) throw new Error("Définition introuvable");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEntry(data[0]);
        } else {
          setError("Aucune entrée trouvée.");
        }
      })
      .catch(() => {
        setError("Définition locale indisponible.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cleanWord]);

  const speak = (rate = 1.0) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(cleanWord);
    utt.lang = "en-US";
    utt.rate = rate;
    window.speechSynthesis.speak(utt);
  };

  const handleSaveToSRS = () => {
    if (added) return;
    playSuccessChime();
    const firstDef = entry?.meanings?.[0]?.definitions?.[0]?.definition || "Vocabulaire anglais";
    onAddToSRS?.(cleanWord, firstDef, entry?.phonetic);
    setAdded(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-lookup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/45 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-cream-50 rounded-2xl border border-cream-200/90 shadow-2xl p-6 flex flex-col gap-4 text-brown-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 id="word-lookup-title" className="text-xl font-extrabold capitalize text-brown-800">
                {cleanWord}
              </h2>
              {entry?.phonetic && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-brown-600 font-mono font-medium">
                  {entry.phonetic}
                </span>
              )}
            </div>
            <p className="text-xs text-brown-400 mt-0.5">Dictionnaire contextuel & Prononciation</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brown-400 hover:text-brown-700 hover:bg-cream-200/60 transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Écoute audio (normal + ralenti) */}
        <div className="flex items-center gap-2 pt-1 border-t border-cream-200/70">
          <button
            onClick={() => speak(1.0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-terracotta-100/70 text-terracotta-700 hover:bg-terracotta-200/80 transition-all active:scale-95"
          >
            <SpeakerIcon size={14} />
            <span>Prononciation</span>
          </button>
          <button
            onClick={() => speak(0.6)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cream-200/70 text-brown-600 hover:bg-cream-300/80 transition-all active:scale-95"
            title="Prononcer lentement à 60% de la vitesse"
          >
            <span>Ralenti (0.6×)</span>
          </button>
        </div>

        {/* Corps des définitions */}
        <div className="min-h-[100px] max-h-[220px] overflow-y-auto space-y-3 pr-1 text-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-brown-400 text-xs">
              <SpinnerIcon size={20} className="animate-spin text-terracotta-400" />
              <span>Chargement de la définition…</span>
            </div>
          ) : error || !entry ? (
            <div className="py-4 text-xs text-brown-500 bg-cream-100/60 p-3 rounded-xl border border-cream-200">
              <p className="font-semibold text-brown-700">Mot sélectionné : {cleanWord}</p>
              <p className="mt-1">Écoutez la prononciation avec les boutons audio ci-dessus et ajoutez-le à vos révisions quotidiennes.</p>
            </div>
          ) : (
            entry.meanings.slice(0, 2).map((m, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-xl border border-cream-200/70 shadow-xs">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-terracotta-50 text-terracotta-600 mb-1">
                  {m.partOfSpeech}
                </span>
                <p className="text-xs text-brown-700 leading-relaxed font-medium">
                  {m.definitions[0]?.definition}
                </p>
                {m.definitions[0]?.example && (
                  <p className="text-[11px] text-brown-400 italic mt-1.5 border-l-2 border-terracotta-300 pl-2">
                    &ldquo;{m.definitions[0].example}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action SRS */}
        <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between gap-3">
          <p className="text-[11px] text-brown-400">
            {added ? "Carte enregistrée dans vos révisions SM-2" : "Mémorisez ce mot avec l'algorithme SRS"}
          </p>
          <button
            onClick={handleSaveToSRS}
            disabled={added}
            className={[
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0",
              added
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                : "bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-sm",
            ].join(" ")}
          >
            {added ? (
              <>
                <CheckIcon size={14} />
                <span>Ajouté</span>
              </>
            ) : (
              <>
                <BookIcon size={14} />
                <span>Mémoriser (SRS)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
