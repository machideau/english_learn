import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

const MAX_TEXT_LENGTH = 1000;

const RequestSchema = z.object({
  text:  z.string().min(1).max(MAX_TEXT_LENGTH),
  voice: z.string().optional(), // ex: "aura-2-thalia-en" pour deepgram/aura-2
});

/**
 * Génère de l'audio TTS via l'endpoint OpenRouter /api/v1/audio/speech.
 * Retourne le binaire MP3 encodé en base64 pour le client.
 *
 * Modèle par défaut : deepgram/aura-2
 * Fallback si la voix demandée n'est pas disponible : fish-audio/s2.1-pro-free:free
 */
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
      return errorResponse("Texte manquant ou trop long (max 1000 caractères).", 400);
    }

    const { text, voice } = parsed.data;

    // Si une voix Deepgram est demandée, on utilise deepgram/aura-2
    // Sinon on utilise le modèle configuré dans l'env (fallback fish-audio gratuit)
    const isDeepgramVoice = voice && voice.startsWith("aura-");
    const model = isDeepgramVoice
      ? "deepgram/aura-2"
      : (process.env.OPENROUTER_TTS_MODEL ?? "fish-audio/s2.1-pro-free:free");

    const requestBody: Record<string, unknown> = {
      model,
      input: text,
      response_format: "mp3",
    };

    // Deepgram Aura-2 requiert une voix explicite
    if (isDeepgramVoice && voice) {
      requestBody.voice = voice;
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://english-avatar.local",
          "X-Title": "English Avatar Tutor",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("[speak] TTS error:", res.status, errText);

        // Si Deepgram échoue, on retry avec fish-audio gratuit
        if (isDeepgramVoice) {
          const fallbackRes = await fetch("https://openrouter.ai/api/v1/audio/speech", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://english-avatar.local",
              "X-Title": "English Avatar Tutor",
            },
            body: JSON.stringify({
              model: "fish-audio/s2.1-pro-free:free",
              input: text,
              response_format: "mp3",
            }),
          });

          if (fallbackRes.ok) {
            const audioArrayBuffer = await fallbackRes.arrayBuffer();
            return NextResponse.json({
              audioBase64: Buffer.from(audioArrayBuffer).toString("base64"),
              mimeType: "audio/mpeg",
            });
          }
        }

        if (res.status === 402) {
          return errorResponse(
            "Synthèse vocale indisponible (solde insuffisant). L'audio du navigateur sera utilisé.",
            402
          );
        }
        if (res.status === 429) {
          return errorResponse("Quota TTS dépassé. Réessayez dans quelques instants.", 429);
        }
        return errorResponse(`Modèle TTS indisponible (${model}).`, 503);
      }

      const audioArrayBuffer = await res.arrayBuffer();
      const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");

      return NextResponse.json({
        audioBase64,
        mimeType: "audio/mpeg",
      });
    } catch (err: unknown) {
      console.error("[speak]", err);
      return errorResponse("Erreur lors de la synthèse vocale.", 500);
    }
  });
}
