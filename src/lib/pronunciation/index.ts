import type { PronunciationScorer } from "./types";
import { llmPronunciationScorer } from "./llm-scorer";
import { azurePronunciationScorer } from "./azure-scorer";

/**
 * Factory : retourne le scorer approprié selon la variable d'environnement.
 */
export function getPronunciationScorer(): PronunciationScorer {
  const scorerType = process.env.PRONUNCIATION_SCORER ?? "llm";
  if (scorerType === "azure") return azurePronunciationScorer;
  return llmPronunciationScorer;
}

export type { PronunciationScorer };
