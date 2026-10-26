"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface UseHandsFreeOptions {
  enabled: boolean;
  isAvatarSpeaking: boolean;
  isProcessing: boolean;
  onSpeechFinal: (text: string) => void;
  lang?: string;
  silenceDelayMs?: number;
}

export function useHandsFree({
  enabled,
  isAvatarSpeaking,
  isProcessing,
  onSpeechFinal,
  lang = "en-US",
  silenceDelayMs = 1600,
}: UseHandsFreeOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTextRef = useRef("");

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
    latestTextRef.current = "";
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    // Arrêter toute instance précédente
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        const clean = transcript.trim();
        latestTextRef.current = clean;
        setInterimText(clean);

        // Réinitialiser le timer de silence
        clearSilenceTimer();
        if (clean.length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            const finalText = latestTextRef.current.trim();
            if (finalText.length > 0) {
              latestTextRef.current = "";
              setInterimText("");
              try {
                recognition.stop();
              } catch {}
              onSpeechFinal(finalText);
            }
          }, silenceDelayMs);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsListening(false);
    }
  }, [lang, silenceDelayMs, clearSilenceTimer, onSpeechFinal]);

  // Gestion des transitions
  useEffect(() => {
    if (!enabled) {
      stopListening();
      return;
    }

    if (isAvatarSpeaking || isProcessing) {
      // Pendant que l'avatar parle ou que l'IA réfléchit, couper le micro
      stopListening();
    } else {
      // Dès que l'avatar se tait et que l'IA a fini, reprendre l'écoute avec un délai de courtoisie
      const t = setTimeout(() => {
        startListening();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [enabled, isAvatarSpeaking, isProcessing, startListening, stopListening]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    interimText,
    stopListening,
    startListening,
  };
}
