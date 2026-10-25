import { z } from "zod";
import { openrouter, MODELS } from "@/lib/openrouter";
import type { PronunciationScorer } from "./types";
import type { PronunciationScore } from "@/types";

const IssueSchema = z.object({
  word: z.string(),
  suggestion: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  phonetic: z.string().optional(),
});

const ResponseSchema = z.object({
  issues: z.array(IssueSchema),
});

/**
 * Implémentation LLM du scorer de prononciation.
 * Utilise le modèle audio via /chat/completions avec input_audio.
 *
 * Note : Fiabilité limitée : le LLM ne peut pas entendre l'audio directement.
 * Il se base sur la transcription et des indices contextuels.
 */
export const llmPronunciationScorer: PronunciationScorer = {
  async score(
    audioBase64: string,
    referenceText: string,
    mimeType: string
  ): Promise<PronunciationScore> {
    try {
      // Déterminer le format audio
      const format = mimeType.includes("mp4") || mimeType.includes("m4a")
        ? "mp4"
        : mimeType.includes("ogg") || mimeType.includes("opus")
        ? "ogg"
        : mimeType.includes("wav")
        ? "wav"
        : "webm";

      const response = await openrouter.chat.completions.create({
        model: MODELS.chat, // Utilise le même modèle chat
        messages: [
          {
            role: "system",
            content: `You are a pronunciation analysis assistant. 
Analyze the provided audio and identify words that are likely mispronounced by a French speaker learning English.
Return ONLY a valid JSON object: { "issues": [{ "word": "...", "suggestion": "...", "confidence": "low|medium|high", "phonetic": "optional IPA" }] }
Focus on non-native accent patterns typical for French speakers (e.g., th sounds, h sounds, vowel length, word stress).
Return an empty array if pronunciation sounds acceptable.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The student was trying to say: "${referenceText}"\nAnalyze their pronunciation:`,
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format,
                },
              },
            ] as any,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const parsed = ResponseSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        return {
          issues: [],
          warning:
            "Analyse de prononciation indisponible (réponse invalide du modèle).",
        };
      }

      return {
        issues: parsed.data.issues,
        warning:
          "Note : l'analyse de prononciation par IA a une fiabilité limitée. Pour un retour précis, activez Azure Speech dans la configuration.",
      };
    } catch (err) {
      console.error("[llm-scorer]", err);
      return {
        issues: [],
        warning: "Analyse de prononciation temporairement indisponible.",
      };
    }
  },
};
