import type { PlacementQuestion, PlacementTestResult, CEFRCode, Level } from "@/types";

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "q1-a1",
    targetLevel: "A1",
    title: "Question 1/4 — Présentation personnelle",
    promptFr: "Présentez-vous en anglais (votre prénom, votre ville, ce que vous aimez faire le week-end).",
    promptEn: "Hello! Could you introduce yourself? What is your name, where do you live, and what do you like to do on weekends?",
    expectedKeywords: ["name", "live", "like", "love", "work", "weekend"],
    minDurationSeconds: 6,
  },
  {
    id: "q2-b1",
    targetLevel: "B1",
    title: "Question 2/4 — Raconter une expérience",
    promptFr: "Racontez vos dernières vacances ou un voyage marquant que vous avez fait.",
    promptEn: "Tell me about your last vacation or a memorable trip you took. What did you do and what was special about it?",
    expectedKeywords: ["went", "travel", "because", "visited", "enjoyed", "food", "people", "hotel"],
    minDurationSeconds: 10,
  },
  {
    id: "q3-b2",
    targetLevel: "B2",
    title: "Question 3/4 — Exprimer une opinion argumentée",
    promptFr: "Que pensez-vous du télétravail par rapport au travail au bureau ? Donnez au moins un avantage et un inconvénient.",
    promptEn: "In your opinion, is working remotely better than working in an office? Could you share some pros and cons?",
    expectedKeywords: ["opinion", "advantage", "disadvantage", "however", "flexibility", "productivity", "colleagues"],
    minDurationSeconds: 12,
  },
  {
    id: "q4-c1",
    targetLevel: "C1",
    title: "Question 4/4 — Raisonnement abstrait & nuance",
    promptFr: "Si vous deviez réformer un aspect du système éducatif actuel avec l'avènement de l'IA, que changeriez-vous et pourquoi ?",
    promptEn: "With the rapid rise of Artificial Intelligence, how do you think education should evolve to prepare future generations?",
    expectedKeywords: ["critical", "thinking", "adapt", "curriculum", "creativity", "ethical", "furthermore", "perspective"],
    minDurationSeconds: 15,
  },
];

const STORAGE_KEY_PLACEMENT = "english_tutor_placement_result";

export function loadPlacementResult(): PlacementTestResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLACEMENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlacementResult(result: PlacementTestResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PLACEMENT, JSON.stringify(result));
  } catch (err) {
    console.warn("Impossible de sauvegarder le test de placement", err);
  }
}

/**
 * Analyse heuristique des 4 réponses fournies par l'utilisateur.
 * Calcule vocabulaire, longueur, connecteurs logiques, complexité.
 */
export function evaluatePlacementAnswers(
  answers: Array<{ questionId: string; text: string }>
): PlacementTestResult {
  let totalWords = 0;
  let totalChars = 0;
  let advancedVocabHits = 0;

  const complexWords = [
    "furthermore", "however", "although", "consequently", "nevertheless",
    "perspective", "significant", "substantial", "collaborate", "innovative",
    "opportunity", "challenge", "beneficial", "crucial", "specifically",
    "experienced", "particularly", "development", "recommend", "flexibility"
  ];

  for (const a of answers) {
    const words = a.text.trim().toLowerCase().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    totalChars += a.text.length;

    for (const w of words) {
      if (complexWords.some((cw) => w.includes(cw))) {
        advancedVocabHits++;
      }
    }
  }

  const avgWordsPerAnswer = totalWords / Math.max(1, answers.length);

  // Évaluation des paliers CEFR
  let cefrLevel: CEFRCode = "A1";
  let matchedLevel: Level = "débutant";
  let overallScore = 40;

  if (avgWordsPerAnswer > 35 && advancedVocabHits >= 4) {
    cefrLevel = "C1";
    matchedLevel = "avancé";
    overallScore = 92;
  } else if (avgWordsPerAnswer > 22 && advancedVocabHits >= 2) {
    cefrLevel = "B2";
    matchedLevel = "intermédiaire";
    overallScore = 82;
  } else if (avgWordsPerAnswer > 12) {
    cefrLevel = "B1";
    matchedLevel = "intermédiaire";
    overallScore = 68;
  } else if (avgWordsPerAnswer > 6) {
    cefrLevel = "A2";
    matchedLevel = "débutant";
    overallScore = 54;
  } else {
    cefrLevel = "A1";
    matchedLevel = "débutant";
    overallScore = 42;
  }

  const vocabularyScore = Math.min(100, Math.round(overallScore + advancedVocabHits * 3));
  const grammarScore = Math.max(30, Math.min(100, Math.round(overallScore - 5 + (avgWordsPerAnswer > 15 ? 8 : 0))));
  const fluencyScore = Math.max(30, Math.min(100, Math.round(overallScore + (totalWords > 60 ? 6 : -4))));

  const feedbackMap: Record<CEFRCode, string> = {
    A1: "Vous possédez les premières notions de base. Vous pouvez comprendre des mots isolés et formuler des phrases simples du quotidien.",
    A2: "Bonne compréhension de base ! Vous parvenez à vous décrire et à répondre à des questions simples sur votre environnement immédiat.",
    B1: "Niveau intermédiaire solide ! Vous êtes capable d'exprimer vos sentiments, de raconter un événement et de maintenir une conversation sur des thèmes familiers.",
    B2: "Très bonne aisance ! Vous argumentez avec clarté, comprenez les nuances et pouvez débattre sans difficulté majeure.",
    C1: "Niveau avancé et fluide ! Votre expression est riche, spontanée et précise, avec une belle maîtrise des idiomes et de la structure.",
  };

  const recMap: Record<CEFRCode, string[]> = {
    A1: [
      "Pratiquez le mode 'Répète après moi' pour ancrer la prononciation.",
      "Complétez les leçons de niveau Débutant (présent simple et verbes d'action).",
      "Faites des sessions de 5 minutes par jour.",
    ],
    A2: [
      "Entraînez-vous sur les scénarios 'Coffee shop' et 'Pharmacie'.",
      "Enrichissez votre vocabulaire avec les Flashcards SRS quotidiennes.",
      "Travaillez le passé simple pour mieux raconter vos journées.",
    ],
    B1: [
      "Lancez-vous dans le scénario 'Aéroport & Douane' et 'Hôtel'.",
      "Écoutez l'avatar parler à vitesse normale sans afficher les sous-titres.",
      "Pratiquez la dictée audio pour consolider l'orthographe.",
    ],
    B2: [
      "Simulez l'Entretien d'embauche Tech et la Négociation de salaire.",
      "Affinez votre prononciation sur les diphtongues et l'accent tonique.",
      "Entamez des conversations libres sur des sujets d'actualité.",
    ],
    C1: [
      "Relevez les défis d'argumentation et de débat avec l'avatar.",
      "Travaillez les tournures idiomatiques avancées et les phrasal verbs rares.",
      "Parlez quotidiennement en mode Hands-Free pour garder vos automatismes.",
    ],
  };

  return {
    cefrLevel,
    matchedLevel,
    overallScore,
    vocabularyScore,
    grammarScore,
    fluencyScore,
    summaryFeedbackFr: feedbackMap[cefrLevel],
    recommendations: recMap[cefrLevel],
    completedAt: Date.now(),
  };
}
