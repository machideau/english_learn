"use client";
import { useState, useRef, useCallback } from "react";

export interface UseAudioPlayerResult {
  isPlaying: boolean;
  currentText: string;
  play: (audioBase64: string, mimeType: string, text?: string) => Promise<void>;
  stop: () => void;
}

export function useAudioPlayer(): UseAudioPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    resolveRef.current?.();
    resolveRef.current = null;
    setIsPlaying(false);
    setCurrentText("");
  }, []);

  const play = useCallback(
    async (audioBase64: string, mimeType: string, text = "") => {
      // Arrêter l'audio en cours
      stop();

      return new Promise<void>((resolve) => {
        resolveRef.current = resolve;

        const dataUrl = `data:${mimeType};base64,${audioBase64}`;
        const audio = new Audio(dataUrl);
        audioRef.current = audio;

        setCurrentText(text);
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentText("");
          resolveRef.current?.();
          resolveRef.current = null;
        };

        audio.onerror = () => {
          console.error("Erreur lecture audio");
          setIsPlaying(false);
          setCurrentText("");
          resolveRef.current?.();
          resolveRef.current = null;
        };

        audio.play().catch((err) => {
          console.error("Lecture audio refusée :", err);
          setIsPlaying(false);
          setCurrentText("");
          resolve();
        });
      });
    },
    [stop]
  );

  return { isPlaying, currentText, play, stop };
}
