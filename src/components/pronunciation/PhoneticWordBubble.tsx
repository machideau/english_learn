"use client";
import { useState, useRef, useEffect } from "react";
import type { AnalyzedWord } from "@/types";
import { SpeakerIcon, XIcon, WaveIcon } from "@/components/ui/Icons";

import { WordLookupModal } from "@/components/dictionary/WordLookupModal";

interface PhoneticWordBubbleProps {
  text: string;
  analyzedWords?: AnalyzedWord[];
  isUser?: boolean;
  onAddToSRS?: (word: string, definition: string, phonetic?: string) => void;
}

export function PhoneticWordBubble({
  text,
  analyzedWords,
  isUser = false,
  onAddToSRS,
}: PhoneticWordBubbleProps) {
  const [activeWord, setActiveWord] = useState<AnalyzedWord | null>(null);
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Fermer le popover au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveWord(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWordClick = (
    wordObj: AnalyzedWord,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    event.stopPropagation();
    if (activeWord?.word === wordObj.word) {
      setActiveWord(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setActiveWord(wordObj);
  };

  const playSlowAudio = (word: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = "en-US";
    utt.rate = 0.6; // Prononciation au ralenti
    utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  };

  // Si pas de mots analysés : découpage en mots cliquables pour dictionnaire instantané
  if (!analyzedWords || analyzedWords.length === 0) {
    const tokens = text.split(/(\s+|[.,!?;:()"]+)/);
    return (
      <div className="relative">
        <p className="whitespace-pre-wrap leading-relaxed inline">
          {tokens.map((token, idx) => {
            const isWord = /^[a-zA-Z'-]{2,}$/.test(token);
            if (!isWord) return <span key={idx}>{token}</span>;
            return (
              <span
                key={idx}
                onClick={() => setLookupWord(token)}
                className="cursor-pointer hover:underline hover:text-terracotta-500 rounded px-0.5 transition-colors"
                title="Cliquez pour traduire et écouter"
              >
                {token}
              </span>
            );
          })}
        </p>
        {lookupWord && (
          <WordLookupModal
            word={lookupWord}
            onClose={() => setLookupWord(null)}
            onAddToSRS={onAddToSRS}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <p className="whitespace-pre-wrap leading-relaxed inline">
        {analyzedWords.map((item, idx) => {
          const hasPhonetics = item.phonetic || item.tipFr;
          const isWarning = item.status === "warning";
          const isError = item.status === "error";

          let styleClass = "";
          if (isError) {
            styleClass =
              "underline decoration-wavy decoration-rose-400 font-medium cursor-pointer text-rose-100 hover:text-white";
          } else if (isWarning) {
            styleClass =
              "underline decoration-dotted decoration-amber-300 font-medium cursor-pointer text-amber-100 hover:text-white";
          }

          return (
            <span key={idx} className="inline">
              <span
                onClick={hasPhonetics ? (e) => handleWordClick(item, e) : undefined}
                className={styleClass}
                title={hasPhonetics ? "Cliquez pour voir la prononciation" : undefined}
              >
                {item.word}
              </span>
              {" "}
            </span>
          );
        })}
      </p>

      {/* Popover phonétique flottant */}
      {activeWord && popoverPos && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            left: `${popoverPos.x}px`,
            top: `${popoverPos.y - 8}px`,
            transform: "translate(-50%, -100%)",
          }}
          role="tooltip"
          aria-live="polite"
          className="z-50 w-64 bg-cream-50 text-brown-800 rounded-2xl border border-cream-200 shadow-xl p-3 text-xs animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream-200 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-brown-900">{activeWord.word}</span>
              {activeWord.phonetic && (
                <span className="text-[11px] font-mono text-terracotta-600 bg-terracotta-50 px-1.5 py-0.5 rounded border border-terracotta-100">
                  {activeWord.phonetic}
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveWord(null)}
              className="text-brown-300 hover:text-brown-600 p-0.5 rounded-full"
            >
              <XIcon size={14} />
            </button>
          </div>

          {/* Explication phonétique */}
          {activeWord.tipFr && (
            <p className="text-[11px] text-brown-600 leading-relaxed mb-2.5">
              💡 {activeWord.tipFr}
            </p>
          )}

          {/* Bouton écouter ralenti */}
          <button
            onClick={() => playSlowAudio(activeWord.word)}
            className="w-full py-1.5 px-2 rounded-xl bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-700 font-semibold text-[11px] border border-terracotta-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <SpeakerIcon size={12} />
            <span>Écouter au ralenti (0.6x)</span>
          </button>
        </div>
      )}
    </div>
  );
}
