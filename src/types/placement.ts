import type { Level } from "./index";

export type CEFRCode = "A1" | "A2" | "B1" | "B2" | "C1";

export interface PlacementQuestion {
  id: string;
  targetLevel: CEFRCode;
  title: string;
  promptFr: string;
  promptEn: string;
  expectedKeywords: string[];
  minDurationSeconds: number;
}

export interface PlacementTestResult {
  cefrLevel: CEFRCode;
  matchedLevel: Level;
  overallScore: number; // 0 - 100
  vocabularyScore: number;
  grammarScore: number;
  fluencyScore: number;
  summaryFeedbackFr: string;
  recommendations: string[];
  completedAt: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  level: CEFRCode;
  iconName: string;
  mode: "lesson" | "roleplay" | "conversation" | "dictation";
  targetId?: string; // e.g. scenarioId or lessonId
  estimatedMinutes: number;
  completed?: boolean;
}
