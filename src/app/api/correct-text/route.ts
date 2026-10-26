import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openrouter, MODELS } from "@/lib/openrouter";
import { withRateLimit, errorResponse } from "@/lib/api-helpers";

const RequestSchema = z.object({
  text: z.string().min(1).max(3000),
  level: z.enum(["débutant", "intermédiaire", "avancé"]),
});

const CorrectionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  type: z.enum(["grammaire", "vocabulaire", "tournure", "prononciation"]),
  explication_fr: z.string(),
  position: z.number().optional(), // position approximative dans le texte original
});

const ResponseSchema = z.object({
  correctedText: z.string(),
  corrections: z.array(CorrectionSchema),
  overallComment: z.string(),
  score: z.number().min(0).max(100), // score global de qualité 0-100
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

    const { text, level } = parsed.data;

    const systemPrompt = `You are an expert English teacher correcting written text from a French speaker.
The student's level is: ${level}.

Analyze the text and:
1. Provide a fully corrected version of the entire text
2. List all significant errors (focus on errors that impact communication or are common mistakes)
3. Explain each correction in French
4. Give an overall comment in French (2-3 sentences, encouraging but honest)
5. Assign a quality score from 0 to 100

Return ONLY valid JSON (no markdown):
{
  "correctedText": "The fully corrected version of the text",
  "corrections": [
    {
      "original": "the wrong phrase/word",
      "corrected": "the correct version",
      "type": "grammaire|vocabulaire|tournure|prononciation",
      "explication_fr": "short explanation in French"
    }
  ],
  "overallComment": "Commentaire global en français sur le niveau général du texte",
  "score": 75
}

If the text is correct, return an empty corrections array and a high score.`;

    try {
      const response = await openrouter.chat.completions.create({
        model: MODELS.chat,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const validated = ResponseSchema.safeParse(JSON.parse(raw));

      if (!validated.success) {
        console.error("[correct-text] schema mismatch:", validated.error.message);
        return errorResponse("Format de réponse invalide.", 500);
      }

      return NextResponse.json(validated.data);
    } catch (err: unknown) {
      console.error("[correct-text]", err);
      return errorResponse("Erreur lors de la correction du texte.", 500);
    }
  });
}
