import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPronunciationScorer } from "@/lib/pronunciation";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const RequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default("audio/webm"),
  referenceText: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Corps de requête JSON invalide.", 400);
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Paramètres invalides : " + parsed.error.message, 400);
    }

    const { audioBase64, mimeType, referenceText } = parsed.data;

    // Vérification de la taille
    const byteLength = Math.ceil((audioBase64.length * 3) / 4);
    if (byteLength > MAX_AUDIO_SIZE_BYTES) {
      return errorResponse("Fichier audio trop volumineux (maximum 10 Mo).", 413);
    }

    try {
      const scorer = getPronunciationScorer();
      const result = await scorer.score(audioBase64, referenceText, mimeType);
      return NextResponse.json(result);
    } catch (err: unknown) {
      console.error("[pronunciation]", err);
      return errorResponse(
        "Erreur lors de l'analyse de prononciation. Veuillez réessayer.",
        500
      );
    }
  });
}
