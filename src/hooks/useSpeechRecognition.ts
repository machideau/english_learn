"use client";
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Transcription via Web Speech API (navigateur natif, gratuit).
 * Fonctionne sur Chrome, Edge, Safari. Pas de Firefox.
 * Utilisé en fallback quand OpenRouter audio est indisponible.
 */

type SpeechRecognitionType = typeof globalThis extends { SpeechRecognition: infer T } ? T : never;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export type SpeechRecognitionState = "idle" | "listening" | "error" | "unsupported";

export interface UseSpeechRecognitionResult {
  state: SpeechRecognitionState;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => Promise<string>;
  cancelListening: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [state, setState] = useState<SpeechRecognitionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const resolveRef = useRef<((text: string) => void) | null>(null);
  const accumulatedRef = useRef<string>("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (!SR) setState("unsupported");
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setState("unsupported");
      return;
    }

    setError(null);
    setTranscript("");
    accumulatedRef.current = "";

    const recognizer = new SR();
    recognizer.lang = "en-US";
    recognizer.interimResults = true;
    recognizer.continuous = true;
    recognizer.maxAlternatives = 1;
    recognizerRef.current = recognizer;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognizer.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) accumulatedRef.current += " " + final;
      setTranscript((accumulatedRef.current + " " + interim).trim());
    };

    recognizer.onend = () => {
      const text = accumulatedRef.current.trim();
      setTranscript(text);
      setState("idle");
      resolveRef.current?.(text);
      resolveRef.current = null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognizer.onerror = (event: any) => {
      // no-speech ou aborted lors des silences ne doivent pas couper brutalement la capture
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      const messages: Record<string, string> = {
        "not-allowed": "Accès au microphone refusé.",
        "network": "Erreur réseau lors de la reconnaissance vocale.",
      };
      const msg = messages[event.error] ?? `Erreur : ${event.error}`;
      if (msg) setError(msg);
      setState("idle");
      resolveRef.current?.(accumulatedRef.current.trim());
      resolveRef.current = null;
    };

    recognizer.start();
    setState("listening");
  }, []);

  const stopListening = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          resolve(accumulatedRef.current.trim());
        }
        // Sécurité si onend ne se déclenche pas dans les 1.5s
        setTimeout(() => {
          if (resolveRef.current) {
            resolveRef.current(accumulatedRef.current.trim());
            resolveRef.current = null;
          }
        }, 1500);
      } else {
        resolve(accumulatedRef.current.trim());
      }
    });
  }, []);

  const cancelListening = useCallback(() => {
    if (recognizerRef.current) {
      try { recognizerRef.current.abort(); } catch { /* ignore */ }
    }
    resolveRef.current?.("");
    resolveRef.current = null;
    setState("idle");
    setTranscript("");
    setError(null);
  }, []);

  return { state, transcript, error, isSupported, startListening, stopListening, cancelListening };
}
