// ─── Types métier ────────────────────────────────────────────────────────────

export type Level = "débutant" | "intermédiaire" | "avancé";
export type InterfaceLanguage = "fr" | "en";
export type CorrectionType = "grammaire" | "vocabulaire" | "tournure" | "prononciation";

export interface Correction {
  original: string;
  corrected: string;
  type: CorrectionType;
  explication_fr: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  corrections?: Correction[];
  audioUrl?: string;
}

export interface ChatApiRequest {
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  level: Level;
  interfaceLanguage: InterfaceLanguage;
  topic?: string;
}

export interface ChatApiResponse {
  reply: string;
  corrections: Correction[];
  niveau_estime: Level;
}

export interface TranscribeApiRequest {
  audioBase64: string;
  mimeType: string;
}

export interface TranscribeApiResponse {
  text: string;
}

export interface SpeakApiRequest {
  text: string;
  voice?: string;
}

// Réponse : audio base64 encodé en JSON (ou stream binaire)
export interface SpeakApiResponse {
  audioBase64: string;
  mimeType: string;
}

// ─── Scoring de prononciation ────────────────────────────────────────────────

export interface PronunciationIssue {
  word: string;
  suggestion: string;
  confidence: "low" | "medium" | "high";
  phonetic?: string;
}

export interface PronunciationScore {
  accuracyScore?: number;    // 0-100, Azure uniquement
  fluencyScore?: number;     // 0-100, Azure uniquement
  completenessScore?: number;// 0-100, Azure uniquement
  issues: PronunciationIssue[];
  warning?: string;          // Avertissement fiabilité limitée (mode LLM)
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface ConversationSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  level: Level;
  topic?: string;
  messages: ChatMessage[];
  allCorrections: Correction[];
}

// ─── États de l'interface ────────────────────────────────────────────────────

export type MicState = "idle" | "recording" | "processing" | "speaking";

export interface AppState {
  micState: MicState;
  currentSession: ConversationSession | null;
  level: Level;
  topic: string;
  showCorrections: boolean;
}

// ─── Bilan de séance ─────────────────────────────────────────────────────────

export interface SessionSummary {
  session: ConversationSession;
  recurringErrors: Array<{
    type: CorrectionType;
    count: number;
    examples: Correction[];
  }>;
  wordsToReview: string[];
  correctPhrases: Array<{
    text: string;
    timestamp: number;
  }>;
}
