import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openrouter, MODELS } from "@/lib/openrouter";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

// ─── Schémas Zod ──────────────────────────────────────────────────────────────

const CorrectionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  type: z.enum(["grammaire", "vocabulaire", "tournure", "prononciation"]),
  explication_fr: z.string(),
});

const ChatResponseSchema = z.object({
  reply: z.string(),
  corrections: z.array(CorrectionSchema).max(2),
  niveau_estime: z.enum(["débutant", "intermédiaire", "avancé"]),
});

const RequestSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  userMessage: z.string().min(1).max(2000),
  level: z.enum(["débutant", "intermédiaire", "avancé"]),
  interfaceLanguage: z.enum(["fr", "en"]).default("fr"),
  topic: z.string().optional(),
});

// ─── Prompt système ───────────────────────────────────────────────────────────

function buildSystemPrompt(level: string, topic?: string): string {
  const topicLine = topic
    ? `The conversation topic is: "${topic}". Keep the discussion on this theme.`
    : "You can choose any everyday topic.";

  return `You are a warm and encouraging English tutor helping a French speaker practice conversational English.

ROLE:
- Respond naturally in English, as a friendly conversation partner would.
- Keep your replies short and conversational (2-4 sentences maximum).
- Adapt your vocabulary and complexity to the student's level: ${level}.
- ${topicLine}

CORRECTIONS:
- Only correct significant errors (maximum 2 per turn). Ignore minor slips.
- Never interrupt the conversation flow to correct; put corrections in the JSON field only.
- Explain corrections in French so the student understands clearly.
- Focus on errors that hinder communication or are frequently repeated.

OUTPUT FORMAT (strict JSON, no markdown wrapper):
{
  "reply": "Your natural English response here",
  "corrections": [
    {
      "original": "what the student said (incorrectly)",
      "corrected": "the correct version",
      "type": "grammaire|vocabulaire|tournure|prononciation",
      "explication_fr": "explication courte en français"
    }
  ],
  "niveau_estime": "débutant|intermédiaire|avancé"
}

If there are no corrections, return an empty array for "corrections".
Always return valid JSON. Do not add any text outside the JSON object.`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

async function callLLM(
  systemPrompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<string> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10), // Garde les 10 derniers messages pour le contexte
    { role: "user", content: userMessage },
  ];

  const response = await openrouter.chat.completions.create({
    model: MODELS.chat,
    messages,
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "";
}

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

    const { history, userMessage, level, topic } = parsed.data;
    const systemPrompt = buildSystemPrompt(level, topic);

    let rawContent: string;
    try {
      rawContent = await callLLM(systemPrompt, history, userMessage);
    } catch (err: unknown) {
      console.error("[chat] LLM error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("quota") || msg.includes("429")) {
        return errorResponse("Quota OpenRouter dépassé.", 429);
      }
      if (msg.includes("model") || msg.includes("404")) {
        return errorResponse(`Modèle ${MODELS.chat} indisponible.`, 503);
      }
      return errorResponse("Erreur de communication avec l'IA.", 500);
    }

    // Validation Zod + une tentative de retry
    let validated = ChatResponseSchema.safeParse(JSON.parse(rawContent || "{}"));

    if (!validated.success) {
      console.warn("[chat] JSON invalide, tentative de retry...", rawContent);
      try {
        // Retry avec un hint explicite
        const retryContent = await callLLM(
          systemPrompt +
            "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object.",
          history,
          userMessage
        );
        validated = ChatResponseSchema.safeParse(
          JSON.parse(retryContent || "{}")
        );
      } catch {
        // ignore retry error
      }
    }

    if (!validated.success) {
      // Fallback gracieux : réponse partielle sans corrections
      console.error("[chat] JSON toujours invalide après retry");
      return NextResponse.json({
        reply: "I understand! Let's keep practicing.",
        corrections: [],
        niveau_estime: level,
      });
    }

    return NextResponse.json(validated.data);
  });
}
