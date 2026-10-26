import type { AnalyzedWord, PronunciationIssue } from "@/types";

interface TrickyWordData {
  phonetic: string;
  tipFr: string;
  suggestion?: string;
}

const TRICKY_WORDS_DATABASE: Record<string, TrickyWordData> = {
  think: {
    phonetic: "/θɪŋk/",
    tipFr: "Placez la pointe de la langue entre les dents sans bloquer l'air. Ne prononcez ni 'sink' ni 'fink'.",
  },
  thought: {
    phonetic: "/θɔːt/",
    tipFr: "Le son 'th' se fait avec la langue entre les dents. Le groupe 'ough' se prononce 'ô' long.",
  },
  three: {
    phonetic: "/θriː/",
    tipFr: "Attention à ne pas dire 'tree' (arbre) ou 'free' (gratuit) : la langue doit effleurer les dents.",
  },
  thank: {
    phonetic: "/θæŋk/",
    tipFr: "Langue entre les dents pour le 'th', et 'a' ouvert comme dans 'chat'.",
  },
  the: {
    phonetic: "/ðə/ ou /ðiː/",
    tipFr: "Son 'th' voisé (qui vibre dans la gorge), pas de son 'z' !",
  },
  this: {
    phonetic: "/ðɪs/",
    tipFr: "Le 'th' vibre avec la langue entre les dents. Ne dites pas 'zis'.",
  },
  that: {
    phonetic: "/ðæt/",
    tipFr: "Son 'th' voisé, langue entre les incisives.",
  },
  these: {
    phonetic: "/ðiːz/",
    tipFr: "Son 'i' long et 's' final sonore qui vibre comme un 'z'.",
  },
  comfortable: {
    phonetic: "/ˈkʌmf.tə.bəl/",
    tipFr: "Se prononce en 3 syllabes ('comf-ter-ble') et non en 4 ! Ne prononcez pas 'table'.",
  },
  vegetable: {
    phonetic: "/ˈvedʒ.tə.bəl/",
    tipFr: "Seulement 3 syllabes ('vedge-te-ble'). La 2e voyelle est avalée.",
  },
  world: {
    phonetic: "/wɜːrld/",
    tipFr: "Attention à bien enchaîner le son 'er' et le 'l' sombre sans dire 'word' ou 'warld'.",
  },
  sheet: {
    phonetic: "/ʃiːt/",
    tipFr: "Attention au 'i' long /iː/. Ne le raccourcissez pas en 'i' bref pour éviter la vulgarité.",
  },
  beach: {
    phonetic: "/biːtʃ/",
    tipFr: "Bien allonger le son 'ee' pour ne pas le confondre avec 'bitch'.",
  },
  hotel: {
    phonetic: "/hoʊˈtel/",
    tipFr: "L'accent tonique est sur la 2e syllabe (ho-TEL) et le 'h' initial est expiré.",
  },
  island: {
    phonetic: "/ˈaɪ.lənd/",
    tipFr: "Le 's' est totalement muet ! Prononcez 'eye-land'.",
  },
  doubt: {
    phonetic: "/daʊt/",
    tipFr: "Le 'b' est totalement muet. Se prononce exactement comme 'out' précédé d'un d.",
  },
  recipe: {
    phonetic: "/ˈres.ə.pi/",
    tipFr: "Se prononce en 3 syllabes avec un 'i' final sonore : 'ré-ci-pi'.",
  },
  colleague: {
    phonetic: "/ˈkɒl.iːɡ/",
    tipFr: "Accent sur la 1ère syllabe ('col-eeg'). Le 'ue' final est muet.",
  },
  listen: {
    phonetic: "/ˈlɪs.ən/",
    tipFr: "Le 't' est muet ! Prononcez 'li-ssen'.",
  },
  clothes: {
    phonetic: "/kloʊðz/ ou /kloʊz/",
    tipFr: "Se prononce couramment comme le verbe 'close' (fermer).",
  },
  salmon: {
    phonetic: "/ˈsæm.ən/",
    tipFr: "Le 'l' est muet ! Prononcez 'sam-on'.",
  },
  iron: {
    phonetic: "/ˈaɪ.ərn/",
    tipFr: "Se prononce 'eye-ern' (le 'r' se prononce après la voyelle).",
  },
  schedule: {
    phonetic: "/ˈskedʒ.uːl/ (US) ou /ˈʃed.juːl/ (UK)",
    tipFr: "En américain : 'skè-djoul'. En britannique : 'shè-dioul'.",
  },
};

/**
 * Découpe une phrase et annote chaque mot avec son statut de prononciation
 * et son explication phonétique si pertinent.
 */
export function analyzeSpokenWords(
  text: string,
  knownIssues: PronunciationIssue[] = []
): AnalyzedWord[] {
  const rawWords = text.trim().split(/\s+/);

  return rawWords.map((raw) => {
    // Nettoyer la ponctuation pour la recherche
    const clean = raw.toLowerCase().replace(/[^a-z'-]/g, "");

    // Vérifier si rapporté par le scoreur audio (ex: Azure ou LLM)
    const issueMatch = knownIssues.find(
      (iss) => iss.word.toLowerCase() === clean
    );

    if (issueMatch) {
      return {
        word: raw,
        status: issueMatch.confidence === "high" ? "error" : "warning",
        phonetic: issueMatch.phonetic,
        suggestion: issueMatch.suggestion,
        tipFr: issueMatch.suggestion || "Attention à l'articulation de ce mot.",
      };
    }

    // Vérifier dans la base de phonétique piège
    const trickyMatch = TRICKY_WORDS_DATABASE[clean];
    if (trickyMatch) {
      return {
        word: raw,
        status: "warning",
        phonetic: trickyMatch.phonetic,
        tipFr: trickyMatch.tipFr,
        suggestion: trickyMatch.suggestion,
      };
    }

    return {
      word: raw,
      status: "good",
    };
  });
}
