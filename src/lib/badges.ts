"use client";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "fluency" | "vocabulary" | "experience";
  unlocked: boolean;
  unlockedAt?: string;
  currentValue: number;
  targetValue: number;
}

const BADGES_KEY = "english_tutor_badges";

export const INITIAL_BADGES: Omit<Badge, "unlocked" | "currentValue" | "unlockedAt">[] = [
  {
    id: "first-step",
    title: "Premier Échange",
    description: "Avoir terminé sa toute première session avec le tuteur.",
    icon: "🌱",
    category: "experience",
    targetValue: 1,
  },
  {
    id: "streak-3",
    title: "Sur sa Lancée",
    description: "Maintenir une série de 3 jours consécutifs de pratique.",
    icon: "🔥",
    category: "streak",
    targetValue: 3,
  },
  {
    id: "streak-7",
    title: "Discipline de Fer",
    description: "Maintenir une série de 7 jours consécutifs de pratique.",
    icon: "⚡",
    category: "streak",
    targetValue: 7,
  },
  {
    id: "talkative-25",
    title: "Bavard(e) Assumé(e)",
    description: "Échanger au moins 25 messages oraux ou écrits.",
    icon: "💬",
    category: "experience",
    targetValue: 25,
  },
  {
    id: "word-collector-10",
    title: "Chasseur de Mots",
    description: "Enregistrer 10 mots ou expressions dans ses cartes mémoires SRS.",
    icon: "📚",
    category: "vocabulary",
    targetValue: 10,
  },
  {
    id: "roleplay-master",
    title: "Acteur Né",
    description: "Compléter avec succès un scénario de mise en situation (Roleplay).",
    icon: "🎭",
    category: "fluency",
    targetValue: 1,
  },
  {
    id: "dictation-ace",
    title: "Oreille Absolue",
    description: "Réussir un exercice de dictée avec un sans-faute.",
    icon: "🎧",
    category: "fluency",
    targetValue: 1,
  },
  {
    id: "daily-goal-champion",
    title: "Objectif du Jour",
    description: "Atteindre son quota de 5 messages en une journée.",
    icon: "🎯",
    category: "experience",
    targetValue: 1,
  },
];

export function loadBadges(stats: {
  totalSessions: number;
  totalMessages: number;
  currentStreak: number;
  totalSRSCards: number;
  roleplaysDone: number;
  dictationsPerfect: number;
  todayMessages: number;
}): Badge[] {
  let savedUnlocked: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(BADGES_KEY);
      if (raw) savedUnlocked = JSON.parse(raw);
    } catch {}
  }

  const badges = INITIAL_BADGES.map((b) => {
    let current = 0;
    switch (b.id) {
      case "first-step":
        current = stats.totalSessions;
        break;
      case "streak-3":
      case "streak-7":
        current = stats.currentStreak;
        break;
      case "talkative-25":
        current = stats.totalMessages;
        break;
      case "word-collector-10":
        current = stats.totalSRSCards;
        break;
      case "roleplay-master":
        current = stats.roleplaysDone;
        break;
      case "dictation-ace":
        current = stats.dictationsPerfect;
        break;
      case "daily-goal-champion":
        current = stats.todayMessages >= 5 ? 1 : 0;
        break;
    }

    const wasUnlocked = !!savedUnlocked[b.id];
    const isNowUnlocked = wasUnlocked || current >= b.targetValue;
    const unlockedAt = savedUnlocked[b.id] || (current >= b.targetValue ? new Date().toISOString() : undefined);

    if (isNowUnlocked && !savedUnlocked[b.id] && unlockedAt) {
      savedUnlocked[b.id] = unlockedAt;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(BADGES_KEY, JSON.stringify(savedUnlocked));
        } catch {}
      }
    }

    return {
      ...b,
      currentValue: Math.min(current, b.targetValue),
      unlocked: isNowUnlocked,
      unlockedAt,
    };
  });

  return badges;
}
