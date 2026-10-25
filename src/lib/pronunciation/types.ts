import type { PronunciationScore } from "@/types";

export interface PronunciationScorer {
  /**
   * Analyse la prononciation de l'utilisateur.
   * @param audioBase64 Audio encodé en base64
   * @param referenceText Texte de référence attendu (transcrit)
   * @param mimeType Type MIME de l'audio
   */
  score(
    audioBase64: string,
    referenceText: string,
    mimeType: string
  ): Promise<PronunciationScore>;
}
