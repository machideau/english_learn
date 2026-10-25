import OpenAI from "openai";

/**
 * Client OpenAI configuré pour pointer vers OpenRouter.
 * NE JAMAIS importer ce module côté client (browser).
 *
 * Modèles disponibles sur OpenRouter (juillet 2025) :
 *
 * CHAT / CORRECTION :
 *   openai/gpt-4o-mini            → rapide, économique (recommandé)
 *   openai/gpt-4o                 → qualité supérieure
 *   anthropic/claude-3-haiku      → alternative
 *
 * TRANSCRIPTION (endpoint /audio/transcriptions) :
 *   Requiert 0,50 $ de solde minimum sur OpenRouter.
 *   openai/whisper-large-v3       → précis
 *   L'application utilise la Web Speech API du navigateur en priorité.
 *
 * TTS (modèles avec output audio via chat/completions) :
 *   openai/gpt-audio-mini         → disponible, économique
 *   openai/gpt-audio              → qualité supérieure
 *   L'application utilise window.speechSynthesis en fallback.
 */
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://english-avatar.local",
    "X-Title": "English Avatar Tutor",
  },
});

export const MODELS = {
  chat:          process.env.OPENROUTER_CHAT_MODEL          ?? "openai/gpt-4o-mini",
  transcription: process.env.OPENROUTER_TRANSCRIPTION_MODEL ?? "openai/whisper-large-v3",
  // TTS : endpoint /audio/speech (binaire MP3, pas chat/completions)
  // fish-audio/s2.1-pro-free:free → gratuit, sans solde minimum
  // Pour une voix plus naturelle avec solde : openai/gpt-4o-mini-tts-2025-12-15
  tts:           process.env.OPENROUTER_TTS_MODEL           ?? "fish-audio/s2.1-pro-free:free",
} as const;
