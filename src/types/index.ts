// ─── Types métier ────────────────────────────────────────────────────────────

// ─── Types de base ───────────────────────────────────────────────────────────
export type Level = "débutant" | "intermédiaire" | "avancé";
export type InterfaceLanguage = "fr" | "en";
export type CorrectionType = "grammaire" | "vocabulaire" | "tournure" | "prononciation";

export interface Correction {
  original: string;
  corrected: string;
  type: CorrectionType;
  explication_fr: string;
}

// ─── Mode applicatif ─────────────────────────────────────────────────────────
export type AppMode =
  | "conversation"      // mode par défaut
  | "repeat-after-me"   // l'avatar dit une phrase, l'user répète
  | "dictation"         // l'avatar dit une phrase, l'user la tape
  | "text-correction"   // l'user colle un texte, l'IA corrige
  | "lesson";           // module de leçon structurée

// ─── Leçons structurées ──────────────────────────────────────────────────────
export type LessonCategory =
  | "grammaire"
  | "vocabulaire"
  | "prononciation"
  | "conversation";

export interface LessonExercise {
  id: string;
  type: "fill-blank" | "translate" | "repeat" | "conversation";
  instruction: string;
  prompt: string;          // phrase / texte à compléter / traduire
  answer?: string;         // réponse attendue (optionnelle pour les exercices libres)
  hint?: string;
  audioText?: string;      // texte à prononcer par l'avatar (pour type "repeat")
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  level: Level;
  durationMin: number;
  exercises: LessonExercise[];
}

// ─── Répétition espacée SRS (SM-2 simplifié) ─────────────────────────────────
export interface SRSCard {
  key: string;             // clé unique : `${original}->${corrected}`
  correction: Correction;
  interval: number;        // jours avant prochaine révision
  easeFactor: number;      // facteur d'aisance (1.3–2.5)
  dueDate: number;         // timestamp Unix (ms) de la prochaine révision
  reviewCount: number;
}

export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5; // 0-2 = fail, 3-5 = success

// ─── Streak ──────────────────────────────────────────────────────────────────
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;  // ISO date "YYYY-MM-DD"
  totalSessions: number;
  totalMessages: number;
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
