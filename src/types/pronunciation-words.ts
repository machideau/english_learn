export type WordPronunciationStatus = "good" | "warning" | "error";

export interface AnalyzedWord {
  word: string;
  status: WordPronunciationStatus;
  phonetic?: string;
  tipFr?: string;
  suggestion?: string;
}

export interface ShareCardData {
  userName?: string;
  levelTitle: string;
  fluencyScore: number;
  accuracyScore: number;
  messagesCount: number;
  streakDays: number;
  roleplayCompletedTitle?: string;
  dateStr: string;
}
