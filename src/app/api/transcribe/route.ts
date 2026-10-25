import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openrouter, MODELS } from "@/lib/openrouter";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const RequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default("audio/webm"),
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
      return errorResponse("Données audio manquantes ou invalides.", 400);
    }

    const { audioBase64, mimeType } = parsed.data;

    // Vérification de la taille
    const byteLength = Math.ceil((audioBase64.length * 3) / 4);
    if (byteLength > MAX_AUDIO_SIZE_BYTES) {
      return errorResponse(
        "Fichier audio trop volumineux (maximum 10 Mo).",
        413
      );
    }

    try {
      // Conversion base64 -> Blob pour l'API
      const audioBuffer = Buffer.from(audioBase64, "base64");
      const audioBlob = new Blob([audioBuffer], { type: mimeType });

      // L'API OpenRouter/Whisper accepte un File object
      const file = new File([audioBlob], "audio.webm", { type: mimeType });

      const transcription = await (openrouter.audio.transcriptions as any).create({
        model: MODELS.transcription,
        file,
        language: "en",
        response_format: "json",
      });

      return NextResponse.json({ text: transcription.text ?? "" });
    } catch (err: unknown) {
      console.error("[transcribe]", err);
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes("quota") || msg.includes("429")) {
        return errorResponse(
          "Quota OpenRouter dépassé. Veuillez réessayer plus tard.",
          429
        );
      }
      if (msg.includes("model") || msg.includes("404")) {
        return errorResponse(
          `Modèle de transcription indisponible (${MODELS.transcription}).`,
          503
        );
      }
      return errorResponse(
        "Erreur lors de la transcription audio. Veuillez réessayer.",
        500
      );
    }
  });
}
