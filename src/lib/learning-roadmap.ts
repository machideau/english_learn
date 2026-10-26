import type { RoadmapStep, CEFRCode } from "@/types";

export const ROADMAP_STEPS: RoadmapStep[] = [
  // Niveau A1 - A2 : Fondations indispensables
  {
    id: "step-1",
    title: "1. Briser la glace & Présentation",
    description: "Apprenez à vous présenter, donner votre âge et parler de vos loisirs sans hésiter.",
    level: "A1",
    iconName: "chat",
    mode: "conversation",
    estimatedMinutes: 5,
  },
  {
    id: "step-2",
    title: "2. Commander au café à Londres",
    description: "Mise en situation pratique : commandez boisson et en-cas face au barista Oliver.",
    level: "A1",
    iconName: "mask",
    mode: "roleplay",
    targetId: "coffee-shop-london",
    estimatedMinutes: 7,
  },
  {
    id: "step-3",
    title: "3. Les verbes au présent & prononciation",
    description: "Leçon guidée pour maîtriser le présent simple et la terminaison -s à la 3e personne.",
    level: "A2",
    iconName: "graduation",
    mode: "lesson",
    targetId: "grammar-present-simple",
    estimatedMinutes: 8,
  },
  {
    id: "step-4",
    title: "4. Pharmacie & Petits bobos en voyage",
    description: "Décrivez des symptômes et achetez le bon traitement en anglais avec le Dr. Watson.",
    level: "A2",
    iconName: "mask",
    mode: "roleplay",
    targetId: "medical-pharmacy",
    estimatedMinutes: 6,
  },

  // Niveau B1 : Aisance au quotidien
  {
    id: "step-5",
    title: "5. Douane & Contrôle à l'aéroport JFK",
    description: "Passez l'immigration américaine en répondant avec calme et précision à l'officier Martinez.",
    level: "B1",
    iconName: "mask",
    mode: "roleplay",
    targetId: "airport-customs",
    estimatedMinutes: 8,
  },
  {
    id: "step-6",
    title: "6. Raconter une anecdote au passé",
    description: "Entraînez-vous à manier le Past Simple et le Past Continuous pour raconter vos histoires.",
    level: "B1",
    iconName: "chat",
    mode: "conversation",
    estimatedMinutes: 10,
  },
  {
    id: "step-7",
    title: "7. Réclamation & Surclassement à l'hôtel",
    description: "Négociez poliment avec la réceptionniste Elena pour changer de chambre et obtenir le petit-déjeuner.",
    level: "B1",
    iconName: "mask",
    mode: "roleplay",
    targetId: "hotel-complaint",
    estimatedMinutes: 9,
  },

  // Niveau B2 : Anglais professionnel & Débats
  {
    id: "step-8",
    title: "8. Entretien d'embauche Tech / Startup",
    description: "Réussissez votre entretien avec Sarah Miller en appliquant la méthode STAR.",
    level: "B2",
    iconName: "mask",
    mode: "roleplay",
    targetId: "job-interview",
    estimatedMinutes: 12,
  },
  {
    id: "step-9",
    title: "9. Négociation salariale stratégique",
    description: "Défendez votre valeur ajoutée et obtenez une revalorisation auprès de David Vance.",
    level: "B2",
    iconName: "mask",
    mode: "roleplay",
    targetId: "salary-negotiation",
    estimatedMinutes: 10,
  },
  {
    id: "step-10",
    title: "10. Débat d'actualité & Pensée critique",
    description: "Exprimez des opinions nuancées et réfutez des arguments avec élégance.",
    level: "C1",
    iconName: "chat",
    mode: "conversation",
    estimatedMinutes: 15,
  },
];

const STORAGE_KEY_ROADMAP = "english_tutor_completed_steps";

export function loadCompletedSteps(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROADMAP);
    return raw ? JSON.parse(raw) : ["step-1"]; // premier débloqué par défaut
  } catch {
    return ["step-1"];
  }
}

export function saveCompletedStep(stepId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadCompletedSteps();
    if (!current.includes(stepId)) {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify([...current, stepId]));
    }
  } catch (err) {
    console.warn("Impossible de sauvegarder l'étape terminée", err);
  }
}
