"use client";
import { useState, useRef, useCallback } from "react";
import type { ChatMessage } from "@/types";
import { CorrectionCard } from "@/components/corrections/CorrectionCard";
import { SpeakerIcon, SpinnerIcon } from "@/components/ui/Icons";

interface MessageBubbleProps {
  message: ChatMessage;
  onReplay?: (audioUrl: string) => void;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, onReplay }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isReplaying, setIsReplaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReplay = useCallback(async () => {
    if (!message.audioUrl) return;

    // Si déjà en lecture, on arrête
    if (isReplaying) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsReplaying(false);
      return;
    }

    setIsReplaying(true);
    const audio = new Audio(message.audioUrl);
    audioRef.current = audio;

    audio.onended = () => setIsReplaying(false);
    audio.onerror = () => setIsReplaying(false);

    try {
      await audio.play();
    } catch {
      setIsReplaying(false);
    }

    // Notifier le parent (optionnel, pour stopper l'avatar si besoin)
    onReplay?.(message.audioUrl);
  }, [message.audioUrl, isReplaying, onReplay]);

  return (
    <div
      className={[
        "flex flex-col gap-1.5 w-full",
        isUser ? "items-end" : "items-start",
        "animate-fade-in",
      ].join(" ")}
    >
      <div className="flex items-end gap-2 max-w-[85%]">
        {!isUser && (
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1 shadow-sm"
            aria-hidden="true"
          >
            AI
          </div>
        )}

        {/* Bulle principale */}
        <div
          className={[
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white rounded-2xl rounded-br-sm shadow-sm"
              : "bg-white border border-cream-200/90 text-brown-700 rounded-2xl rounded-bl-sm shadow-subtle",
          ].join(" ")}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Réécouter l'assistant */}
          {!isUser && message.audioUrl && (
            <div className="mt-2.5 pt-2 border-t border-cream-100 flex items-center justify-between">
              <button
                onClick={handleReplay}
                className={[
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150",
                  isReplaying
                    ? "bg-terracotta-50 text-terracotta-600 border border-terracotta-200"
                    : "bg-cream-100/70 text-brown-400 hover:text-brown-600 hover:bg-cream-200 border border-cream-200",
                ].join(" ")}
                aria-label={isReplaying ? "Arrêter la lecture" : "Réécouter la réponse"}
                aria-pressed={isReplaying}
              >
                {isReplaying ? (
                  <>
                    <SpinnerIcon size={12} className="animate-spin text-terracotta-500" />
                    <span>Lecture en cours…</span>
                  </>
                ) : (
                  <>
                    <SpeakerIcon size={12} />
                    <span>Réécouter</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horodatage */}
      <time
        className="msg-time px-2"
        dateTime={new Date(message.timestamp).toISOString()}
      >
        {formatTime(message.timestamp)}
      </time>

      {/* Corrections inline pour le message utilisateur */}
      {isUser && message.corrections && message.corrections.length > 0 && (
        <div className="w-full max-w-[85%] space-y-2 mt-1">
          {message.corrections.map((c, i) => (
            <CorrectionCard key={i} correction={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

