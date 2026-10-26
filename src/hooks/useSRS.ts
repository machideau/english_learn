"use client";
import { useState, useCallback, useEffect } from "react";
import type { SRSCard, SRSGrade, Correction } from "@/types";

const SRS_KEY = "english_tutor_srs";

// ─── Algorithme SM-2 simplifié ────────────────────────────────────────────────
function sm2Update(
  card: SRSCard,
  grade: SRSGrade
): SRSCard {
  const now = Date.now();
  let { interval, easeFactor } = card;

  if (grade < 3) {
    // Echec : on reprend depuis le début
    interval = 1;
  } else {
    if (card.reviewCount === 0) interval = 1;
    else if (card.reviewCount === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    // Mise à jour du facteur d'aisance
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
    );
  }

  return {
    ...card,
    interval,
    easeFactor,
    dueDate: now + interval * 24 * 60 * 60 * 1000,
    reviewCount: card.reviewCount + 1,
  };
}

function makeKey(c: Correction): string {
  return `${c.original.trim().toLowerCase()}->${c.corrected.trim().toLowerCase()}`;
}

function loadCards(): SRSCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SRS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: SRSCard[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(cards));
  } catch {}
}

export function useSRS() {
  const [cards, setCards] = useState<SRSCard[]>([]);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  /** Ajoute des corrections comme nouvelles cartes SRS (sans doublon) */
  const addCorrections = useCallback((corrections: Correction[]) => {
    setCards((prev) => {
      const existingKeys = new Set(prev.map((c) => c.key));
      const newCards: SRSCard[] = corrections
        .filter((c) => !existingKeys.has(makeKey(c)))
        .map((c) => ({
          key: makeKey(c),
          correction: c,
          interval: 1,
          easeFactor: 2.5,
          dueDate: Date.now() + 24 * 60 * 60 * 1000, // demain
          reviewCount: 0,
        }));
      const updated = [...prev, ...newCards];
      saveCards(updated);
      return updated;
    });
  }, []);

  /** Met à jour une carte après révision */
  const reviewCard = useCallback((key: string, grade: SRSGrade) => {
    setCards((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? sm2Update(c, grade) : c
      );
      saveCards(updated);
      return updated;
    });
  }, []);

  /** Ajoute un mot de vocabulaire directement comme carte SRS */
  const addWordCard = useCallback(
    (word: string, definitionFr: string, phonetics?: string) => {
      const displayCorrected = phonetics ? `${definitionFr} (${phonetics})` : definitionFr;
      addCorrections([
        {
          original: word.trim(),
          corrected: displayCorrected,
          type: "vocabulaire",
          explication_fr: `Mot de vocabulaire : "${word.trim()}". Définition / traduction : ${definitionFr}`,
        },
      ]);
    },
    [addCorrections]
  );

  /** Cartes dues aujourd'hui (dueDate <= maintenant) */
  const dueCards = cards.filter((c) => c.dueDate <= Date.now());

  /** Toutes les cartes triées par date de révision */
  const allCards = [...cards].sort((a, b) => a.dueDate - b.dueDate);

  return { cards: allCards, dueCards, addCorrections, addWordCard, reviewCard };
}
