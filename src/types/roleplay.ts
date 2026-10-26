import type { Level } from "./index";

export interface RoleplayObjective {
  id: string;
  label: string;
  description: string;
  hint: string;
  completed?: boolean;
}

export type RoleplayCategory = "career" | "daily" | "travel" | "social";

export interface RoleplayScenario {
  id: string;
  title: string;
  subtitle: string;
  category: RoleplayCategory;
  level: Level;
  avatarRole: string;
  avatarName: string;
  avatarMood: "neutral" | "happy" | "thinking";
  userRole: string;
  initialMessage: string;
  context: string;
  objectives: RoleplayObjective[];
}

export interface RoleplayEvaluation {
  scenarioId: string;
  scenarioTitle: string;
  score: number; // 0 - 100
  completedObjectivesCount: number;
  totalObjectivesCount: number;
  completedObjectives: string[];
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  keyPhrasesToRemember: string[];
}
