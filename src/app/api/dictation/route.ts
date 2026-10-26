import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openrouter, MODELS } from "@/lib/openrouter";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

const RequestSchema = z.object({
  level: z.enum(["débutant", "intermédiaire", "avancé"]),
  topic: z.string().optional(),
  count: z.number().min(1).max(5).default(3),
});

const DictationResponseSchema = z.object({
  sentences: z.array(
    z.object({
      text: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    })
  ),
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

    const { level, topic, count } = parsed.data;
    const topicLine = topic
      ? `The sentences should relate to the topic: "${topic}".`
      : "Use everyday conversational topics.";

    const systemPrompt = `You generate dictation sentences for English learners.
Level: ${level}. ${topicLine}
Generate exactly ${count} sentences appropriate for dictation practice.
Rules:
- Sentences should be natural, complete English sentences
- Adapt complexity to the level: débutant = short simple sentences, intermédiaire = moderate complexity, avancé = longer nuanced sentences
- No emojis, no special characters

Return ONLY valid JSON:
{
  "sentences": [
    { "text": "The sentence for dictation.", "difficulty": "easy|medium|hard" }
  ]
}`;

    try {
      const response = await openrouter.chat.completions.create({
        model: MODELS.chat,
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const validated = DictationResponseSchema.safeParse(JSON.parse(raw));

      if (!validated.success) {
        return errorResponse("Format de réponse invalide.", 500);
      }

      return NextResponse.json(validated.data);
    } catch (err: unknown) {
      console.error("[dictation]", err);
      return errorResponse("Erreur lors de la génération de phrases.", 500);
    }
  });
}
