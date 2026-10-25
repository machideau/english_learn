"use client";
import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "error";

export interface UseMicrophoneResult {
  state: RecordingState;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ audioBase64: string; mimeType: string } | null>;
  cancelRecording: () => void;
}

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMimeType(): string {
  for (const type of PREFERRED_MIME_TYPES) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

export function useMicrophone(): UseMicrophoneResult {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveRef = useRef<((data: { audioBase64: string; mimeType: string } | null) => void) | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = getSupportedMimeType();

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (chunksRef.current.length === 0) {
          resolveRef.current?.(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const audioBase64 = btoa(binary);
        resolveRef.current?.({ audioBase64, mimeType });
      };

      recorder.start(100); // chunks toutes les 100ms
      setState("recording");
    } catch (err) {
      const msg =
        (err as Error).name === "NotAllowedError"
          ? "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur."
          : (err as Error).name === "NotFoundError"
          ? "Aucun microphone détecté sur cet appareil."
          : "Impossible d'accéder au microphone. Vérifiez votre appareil.";
      setError(msg);
      setState("error");
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ audioBase64: string; mimeType: string } | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        setState("idle");
      } else {
        resolve(null);
      }
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
    resolveRef.current?.(null);
    resolveRef.current = null;
    setState("idle");
    setError(null);
  }, []);

  return { state, error, startRecording, stopRecording, cancelRecording };
}
