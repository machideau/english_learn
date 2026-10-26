"use client";
import { useState, useCallback, useEffect } from "react";
import type { StreakData } from "@/types";

const STREAK_KEY = "english_tutor_streak";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function loadStreak(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      totalSessions: 0,
      totalMessages: 0,
    };
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: "",
          totalSessions: 0,
          totalMessages: 0,
        };
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      totalSessions: 0,
      totalMessages: 0,
    };
  }
}

function saveStreak(data: StreakData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {}
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(loadStreak);

  useEffect(() => {
    setStreak(loadStreak());
  }, []);

  /**
   * À appeler quand l'utilisateur envoie un message (activité quotidienne).
   * Incrémente le streak si c'est un nouveau jour.
   */
  const recordActivity = useCallback((messagesDelta = 1) => {
    setStreak((prev) => {
      const today = todayISO();
      const yesterday = yesterdayISO();

      let newStreak = prev.currentStreak;

      if (prev.lastActiveDate === today) {
        // Déjà actif aujourd'hui - on ne change pas le streak
        newStreak = prev.currentStreak;
      } else if (prev.lastActiveDate === yesterday) {
        // Actif hier : on incrémente
        newStreak = prev.currentStreak + 1;
      } else if (prev.lastActiveDate === "") {
        // Premier jour
        newStreak = 1;
      } else {
        // Rupture de streak
        newStreak = 1;
      }

      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
        totalSessions: prev.totalSessions,
        totalMessages: prev.totalMessages + messagesDelta,
      };
      saveStreak(updated);
      return updated;
    });
  }, []);

  /** À appeler quand une session se termine */
  const recordSession = useCallback(() => {
    setStreak((prev) => {
      const updated = { ...prev, totalSessions: prev.totalSessions + 1 };
      saveStreak(updated);
      return updated;
    });
  }, []);

  return { streak, recordActivity, recordSession };
}
