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

const RoleplayObjectiveSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const RoleplayContextSchema = z.object({
  scenarioId: z.string(),
  scenarioTitle: z.string(),
  avatarRole: z.string(),
  userRole: z.string(),
  context: z.string(),
  objectives: z.array(RoleplayObjectiveSchema),
});

const ChatResponseSchema = z.object({
  reply: z.string(),
  corrections: z.array(CorrectionSchema).max(2),
  niveau_estime: z.enum(["débutant", "intermédiaire", "avancé"]),
  completed_objective_ids: z.array(z.string()).optional(),
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
  roleplay: RoleplayContextSchema.optional(),
});

// ─── Prompt système ───────────────────────────────────────────────────────────

function buildSystemPrompt(
  level: string,
  topic?: string,
  roleplay?: z.infer<typeof RoleplayContextSchema>
): string {
  if (roleplay) {
    const objectivesList = roleplay.objectives
      .map((o) => `- ID "${o.id}": ${o.label}`)
      .join("\n");

    return `You are acting in an immersive English roleplay simulation for a French-speaking student.

YOUR CHARACTER:
- Role: ${roleplay.avatarRole} in the scenario "${roleplay.scenarioTitle}".
- User's Role: ${roleplay.userRole}.
- Situation & Context: ${roleplay.context}.

RULES:
- Stay 100% strictly in character. Do NOT break character.
- Speak natural conversational English, adapted to the student's level (${level}).
- Keep replies punchy, engaging, and realistic (2-4 sentences max). Ask a relevant question or prompt a reply.
- Never use emojis, emoticons, or icons.

SCENARIO OBJECTIVES TO TRACK:
${objectivesList}
Evaluate if the user's latest message (or conversation context) fulfills one or more of these objectives.
If an objective was completed in this turn, include its ID in the "completed_objective_ids" array. Only mark an objective completed if the user made a genuine attempt to fulfill it.

CORRECTIONS:
- Put minor corrections in the JSON "corrections" field (max 2). Never mention them in your character's spoken reply.
- Explain in simple French in "explication_fr".

OUTPUT FORMAT (strict JSON, no markdown wrapper):
{
  "reply": "Your character's natural spoken line (no emojis)",
  "corrections": [
    {
      "original": "incorrect user phrasing",
      "corrected": "natural version",
      "type": "grammaire|vocabulaire|tournure|prononciation",
      "explication_fr": "courte explication en français"
    }
  ],
  "niveau_estime": "débutant|intermédiaire|avancé",
  "completed_objective_ids": ["id-of-completed-objective"]
}`;
  }

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

NO EMOJIS:
- Absolutely NEVER use emojis, emoticons, or pictograms in your response, replies, or explanations. Use only plain text words and standard punctuation.

OUTPUT FORMAT (strict JSON, no markdown wrapper):
{
  "reply": "Your natural English response here (no emojis)",
  "corrections": [
    {
      "original": "what the student said (incorrectly)",
      "corrected": "the correct version (no emojis)",
      "type": "grammaire|vocabulaire|tournure|prononciation",
      "explication_fr": "explication courte en français (sans emoji)"
    }
  ],
  "niveau_estime": "débutant|intermédiaire|avancé"
}

If there are no corrections, return an empty array for "corrections".
Always return valid JSON. Do not add any text outside the JSON object.`;
}

function stripEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu,
      ""
    )
    .trim();
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

    const { history, userMessage, level, topic, roleplay } = parsed.data;
    const systemPrompt = buildSystemPrompt(level, topic, roleplay);

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
        completedObjectiveIds: [],
      });
    }

    const sanitizedReply = stripEmojis(validated.data.reply);
    const sanitizedCorrections = validated.data.corrections.map((c) => ({
      ...c,
      original: stripEmojis(c.original),
      corrected: stripEmojis(c.corrected),
      explication_fr: stripEmojis(c.explication_fr),
    }));

    return NextResponse.json({
      reply: sanitizedReply,
      corrections: sanitizedCorrections,
      niveau_estime: validated.data.niveau_estime,
      completedObjectiveIds: validated.data.completed_objective_ids ?? [],
    });
  });
}
