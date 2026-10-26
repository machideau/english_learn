import type { Lesson } from "@/types";

export const LESSONS: Lesson[] = [
  // ─── Débutant ──────────────────────────────────────────────────────────────
  {
    id: "greetings",
    title: "Greetings & Introductions",
    description: "Apprenez à vous présenter et saluer en anglais.",
    category: "conversation",
    level: "débutant",
    durationMin: 10,
    exercises: [
      {
        id: "g1",
        type: "repeat",
        instruction: "Répétez cette formule de salutation",
        prompt: "Hello! My name is Sarah. Nice to meet you.",
        audioText: "Hello! My name is Sarah. Nice to meet you.",
      },
      {
        id: "g2",
        type: "translate",
        instruction: "Traduisez en anglais",
        prompt: "Comment vous appelez-vous ?",
        answer: "What is your name?",
        hint: "Utilisez 'What is' ou 'What's'",
      },
      {
        id: "g3",
        type: "fill-blank",
        instruction: "Complétez la phrase",
        prompt: "Nice to ___ you! I'm from France.",
        answer: "meet",
        hint: "Verbe pour 'faire la connaissance'",
      },
      {
        id: "g4",
        type: "repeat",
        instruction: "Répétez cette phrase naturellement",
        prompt: "How are you? I'm fine, thank you. And you?",
        audioText: "How are you? I'm fine, thank you. And you?",
      },
      {
        id: "g5",
        type: "conversation",
        instruction: "Présentez-vous à l'avatar en anglais",
        prompt: "Introduce yourself: say your name, where you're from, and what you do.",
      },
    ],
  },
  {
    id: "present-simple",
    title: "Present Simple",
    description: "Le temps présent pour les habitudes et faits généraux.",
    category: "grammaire",
    level: "débutant",
    durationMin: 12,
    exercises: [
      {
        id: "ps1",
        type: "repeat",
        instruction: "Écoutez et répétez",
        prompt: "I work every day. She works at a hospital.",
        audioText: "I work every day. She works at a hospital.",
      },
      {
        id: "ps2",
        type: "fill-blank",
        instruction: "Conjuguez le verbe",
        prompt: "He ___ (go) to school every morning.",
        answer: "goes",
        hint: "Avec 'he/she/it', on ajoute -s ou -es",
      },
      {
        id: "ps3",
        type: "fill-blank",
        instruction: "Complétez à la négative",
        prompt: "I ___ like coffee. (not like)",
        answer: "don't",
        hint: "Utilisez 'don't' ou 'doesn't'",
      },
      {
        id: "ps4",
        type: "translate",
        instruction: "Traduisez",
        prompt: "Est-ce qu'elle parle anglais ?",
        answer: "Does she speak English?",
        hint: "Utilisez 'Does' pour she/he/it",
      },
      {
        id: "ps5",
        type: "conversation",
        instruction: "Parlez de votre routine quotidienne",
        prompt: "Tell me about your daily routine using present simple.",
      },
    ],
  },

  // ─── Intermédiaire ─────────────────────────────────────────────────────────
  {
    id: "past-tenses",
    title: "Past Simple vs Present Perfect",
    description: "La différence entre le prétérit et le present perfect.",
    category: "grammaire",
    level: "intermédiaire",
    durationMin: 15,
    exercises: [
      {
        id: "pt1",
        type: "repeat",
        instruction: "Écoutez la différence",
        prompt: "I lived in Paris. - I have lived in Paris.",
        audioText: "I lived in Paris. I have lived in Paris.",
      },
      {
        id: "pt2",
        type: "fill-blank",
        instruction: "Choisissez le bon temps",
        prompt: "I ___ (already see) this film. Let's watch another one.",
        answer: "have already seen",
        hint: "'already' avec une expérience → present perfect",
      },
      {
        id: "pt3",
        type: "fill-blank",
        instruction: "Complétez",
        prompt: "She ___ (move) to London three years ago.",
        answer: "moved",
        hint: "Un moment précis dans le passé → past simple",
      },
      {
        id: "pt4",
        type: "translate",
        instruction: "Traduisez",
        prompt: "Je n'ai jamais mangé de sushi.",
        answer: "I have never eaten sushi.",
        hint: "Experience + 'never' → present perfect",
      },
      {
        id: "pt5",
        type: "conversation",
        instruction: "Parlez d'une expérience passée",
        prompt: "Tell me about something interesting you've done recently.",
      },
    ],
  },
  {
    id: "phrasal-verbs",
    title: "Common Phrasal Verbs",
    description: "Les verbes à particule les plus utilisés en anglais courant.",
    category: "vocabulaire",
    level: "intermédiaire",
    durationMin: 15,
    exercises: [
      {
        id: "pv1",
        type: "repeat",
        instruction: "Répétez ces expressions",
        prompt: "Can you look after my cat this weekend? I need to look up this word.",
        audioText: "Can you look after my cat this weekend? I need to look up this word.",
      },
      {
        id: "pv2",
        type: "fill-blank",
        instruction: "Complétez avec le bon verbe",
        prompt: "The meeting was cancelled so we had to ___ up with a new plan. (come/think)",
        answer: "come",
        hint: "'come up with' = trouver/imaginer",
      },
      {
        id: "pv3",
        type: "translate",
        instruction: "Traduisez en utilisant un verbe à particule",
        prompt: "Je ne supporte pas la chaleur.",
        answer: "I can't put up with the heat.",
        hint: "'put up with' = tolérer/supporter",
      },
      {
        id: "pv4",
        type: "fill-blank",
        instruction: "Complétez",
        prompt: "Don't give ___! You're almost there.",
        answer: "up",
        hint: "'give up' = abandonner",
      },
      {
        id: "pv5",
        type: "conversation",
        instruction: "Utilisez 3 phrasal verbs dans une réponse",
        prompt: "Tell me about your plans for next week. Try to use phrasal verbs.",
      },
    ],
  },

  // ─── Avancé ────────────────────────────────────────────────────────────────
  {
    id: "conditionals",
    title: "Conditional Sentences",
    description: "Les 4 types de conditionnels et leurs nuances.",
    category: "grammaire",
    level: "avancé",
    durationMin: 18,
    exercises: [
      {
        id: "c1",
        type: "repeat",
        instruction: "Écoutez et répétez",
        prompt: "If I had known, I would have acted differently.",
        audioText: "If I had known, I would have acted differently.",
      },
      {
        id: "c2",
        type: "fill-blank",
        instruction: "3rd conditional - complétez",
        prompt: "If she ___ (study) harder, she ___ (pass) the exam.",
        answer: "had studied / would have passed",
        hint: "if + past perfect → would have + past participle",
      },
      {
        id: "c3",
        type: "translate",
        instruction: "Traduisez ce regret",
        prompt: "J'aurais dû lui parler avant qu'il parte.",
        answer: "I should have talked to him before he left.",
      },
      {
        id: "c4",
        type: "fill-blank",
        instruction: "Mixed conditional",
        prompt: "If I ___ (be) taller, I ___ (become) a basketball player.",
        answer: "were / would have become",
        hint: "Condition hypothétique présente + résultat passé",
      },
      {
        id: "c5",
        type: "conversation",
        instruction: "Discussion libre",
        prompt: "What would you have done differently in your life if you had the chance? Use conditionals.",
      },
    ],
  },
  {
    id: "idioms",
    title: "English Idioms in Context",
    description: "Expressions idiomatiques pour parler comme un natif.",
    category: "vocabulaire",
    level: "avancé",
    durationMin: 15,
    exercises: [
      {
        id: "i1",
        type: "repeat",
        instruction: "Écoutez et mémorisez",
        prompt: "It's raining cats and dogs outside. I'm under the weather today.",
        audioText: "It's raining cats and dogs outside. I'm under the weather today.",
      },
      {
        id: "i2",
        type: "fill-blank",
        instruction: "Complétez l'idiome",
        prompt: "She has a lot on her ___ right now - work, family, everything.",
        answer: "plate",
        hint: "'have a lot on one's plate' = être débordé",
      },
      {
        id: "i3",
        type: "translate",
        instruction: "Traduisez en utilisant un idiome",
        prompt: "Cette décision s'est retournée contre lui.",
        answer: "This decision backfired on him.",
      },
      {
        id: "i4",
        type: "fill-blank",
        instruction: "Complétez",
        prompt: "Let's not beat around the ___. Tell me what's wrong.",
        answer: "bush",
        hint: "'beat around the bush' = tourner autour du pot",
      },
      {
        id: "i5",
        type: "conversation",
        instruction: "Intégrez des idiomes naturellement",
        prompt: "Describe a challenging situation you've been in using as many idioms as possible.",
      },
    ],
  },
];

export function getLessonsByLevel(level: string): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
