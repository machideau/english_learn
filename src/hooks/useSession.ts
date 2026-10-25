"use client";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  ConversationSession,
  ChatMessage,
  Correction,
  Level,
} from "@/types";

const STORAGE_KEY = "english_tutor_sessions";

function loadSessions(): ConversationSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ConversationSession[]) {
  if (typeof window === "undefined") return;
  try {
    // Garde les 20 dernières sessions
    const toSave = sessions.slice(-20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Espace insuffisant ou mode privé
    console.warn("Impossible de sauvegarder la session en localStorage.");
  }
}

export function useSession() {
  const [currentSession, setCurrentSession] =
    useState<ConversationSession | null>(null);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);

  // Charger les sessions au montage
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const startSession = useCallback(
    (level: Level, topic?: string): ConversationSession => {
      const session: ConversationSession = {
        id: uuidv4(),
        startedAt: Date.now(),
        level,
        topic,
        messages: [],
        allCorrections: [],
      };
      setCurrentSession(session);
      return session;
    },
    []
  );

  const addMessage = useCallback(
    (
      message: Omit<ChatMessage, "timestamp">
    ) => {
      setCurrentSession((prev) => {
        if (!prev) return prev;
        const msg: ChatMessage = { ...message, timestamp: Date.now() };
        const allCorrections = message.corrections
          ? [...prev.allCorrections, ...message.corrections]
          : prev.allCorrections;
        return { ...prev, messages: [...prev.messages, msg], allCorrections };
      });
    },
    []
  );

  const endSession = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const ended = { ...prev, endedAt: Date.now() };
      setSessions((all) => {
        const updated = [...all, ended];
        saveSessions(updated);
        return updated;
      });
      return ended;
    });
  }, []);

  const clearSessions = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSessions([]);
  }, []);

  return {
    currentSession,
    sessions,
    startSession,
    addMessage,
    endSession,
    clearSessions,
  };
}
