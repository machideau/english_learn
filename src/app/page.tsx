import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Logo } from "@/components/ui/Logo";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { HeroMotionDesign } from "@/components/landing/HeroMotionDesign";


export const metadata: Metadata = {
  title: "English Tutor AI - Pratiquez l'anglais à l'oral avec un avatar 3D",
  description:
    "Apprenez l'anglais oral gratuitement avec un tuteur IA et un avatar 3D. Corrections en temps réel, prononciation, flashcards et leçons structurées. Adapté à tous les niveaux.",
  keywords: [
    // Apprentissage oral - mots-clés principaux
    "apprendre anglais",
    "apprendre anglais oral",
    "apprendre l'anglais gratuitement",
    "pratiquer anglais oral",
    "parler anglais couramment",
    "parler anglais sans accent",
    "débloquer son anglais",
    "cours anglais oral gratuit",
    "cours anglais en ligne gratuit",
    "cours anglais en ligne",
    "conversation anglais",
    "conversation anglais en ligne",
    "conversation anglais gratuit",
    "dialogue anglais",
    "exercices anglais oral",
    "améliorer son anglais oral",
    "anglais oral facile",
    "anglais pour francophones",
    "méthode pour parler anglais",
    "s'entraîner à parler anglais",
    "anglais pratique quotidien",
    "pratiquer anglais tous les jours",

    // IA & Avatar
    "tuteur anglais IA",
    "professeur anglais IA",
    "intelligence artificielle pour apprendre l'anglais",
    "apprendre anglais avec IA",
    "avatar 3D anglais",
    "avatar lip sync anglais",
    "parler avec une IA en anglais",
    "conversation avec tuteur IA",
    "AI english tutor",
    "AI language tutor",
    "chatgpt apprendre anglais",
    "tuteur virtuel anglais",
    "compagnon virtuel anglais",
    "reconnaissance vocale anglais",
    "synthèse vocale anglais",
    "conversational AI english",
    "english AI conversation partner",
    "AI speaking practice english",

    // Niveaux CEFR
    "test de niveau anglais",
    "test niveau anglais gratuit",
    "test CEFR anglais",
    "test de positionnement anglais",
    "évaluation niveau anglais oral",
    "anglais niveau A1",
    "anglais niveau A2",
    "anglais niveau B1",
    "anglais niveau B2",
    "anglais niveau C1",
    "anglais A1 A2 B1 B2 C1",
    "anglais débutant",
    "anglais intermédiaire",
    "anglais avancé",
    "parcours apprentissage anglais",
    "roadmap apprentissage anglais",
    "objectifs apprentissage anglais",

    // Prononciation & phonétique
    "prononciation anglais",
    "correction prononciation anglais",
    "phonétique anglais",
    "alphabet phonétique anglais IPA",
    "comment prononcer en anglais",
    "accent tonique anglais",
    "prononcer le th en anglais",
    "prononcer comme un natif anglais",
    "analyse phonétique anglais mot à mot",
    "elsa speak alternative gratuite",
    "exercices prononciation anglais",
    "perdre l'accent français en anglais",

    // Grammaire & vocabulaire
    "grammaire anglaise en ligne",
    "leçons grammaire anglaise",
    "vocabulaire anglais courant",
    "mémoriser vocabulaire anglais",
    "expressions idiomatiques anglais",
    "correction grammaticale anglais en temps réel",
    "erreurs courantes anglais",

    // Outils pédagogiques
    "flashcards anglais",
    "répétition espacée anglais",
    "algorithme SM-2 anglais",
    "dictée anglais en ligne",
    "répète après moi anglais",
    "shadowing anglais",
    "dictée anglais exercice",
    "correction texte anglais en ligne",

    // Roleplay & Situations
    "simulation entretien anglais",
    "préparer entretien embauche anglais",
    "job interview practice english",
    "anglais professionnel",
    "anglais des affaires",
    "business english practice",
    "négociation en anglais",
    "anglais pour voyager",
    "anglais à l'aéroport",
    "commander au restaurant en anglais",
    "anglais hôtel",
    "roleplay anglais",
    "jeux de rôle anglais oral",
    "mise en situation anglais",
    "scénario pratique anglais",

    // Mobile & PWA
    "application apprendre anglais",
    "meilleure application pour parler anglais",
    "app anglais oral gratuite",
    "application anglais sans abonnement",
    "alternative duolingo oral",
    "alternative babbel anglais",
    "alternative elsa speak",
    "mode mains libres anglais",
    "walk and talk anglais",
    "anglais smartphone gratuit",
    "application PWA anglais",

    // Mots-clés anglais (international)
    "learn english speaking",
    "practice spoken english",
    "english speaking app",
    "spoken english practice online",
    "english conversation practice AI",
    "AI english conversation partner",
    "3D avatar english speaking",
    "real time english pronunciation correction",
    "english CEFR level test free",
    "english interview preparation AI",
    "free english learning app",
    "english tutor online free",
    "speaking english fluently",
    "english practice no account",

    // Auteurs
    "machideau",
    "Lefaure SAMIE",
  ],
  openGraph: {
    title: "English Tutor AI - Parlez anglais avec un avatar 3D",
    description:
      "Pratiquez l'anglais oral avec un tuteur IA intelligent. Corrections grammaticales, prononciation, flashcards SRS et leçons structurées. Gratuit.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "English Tutor AI - Parlez anglais avec un avatar 3D",
    description:
      "Pratiquez l'anglais oral avec un tuteur IA. Corrections en temps réel, prononciation et flashcards.",
  },
  alternates: {
    canonical: "/",
  },
};

// ─── Données statiques ────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
    title: "Conversation naturelle",
    description:
      "Parlez avec un tuteur IA qui s'adapte à votre niveau et corrige vos erreurs sans couper le fil de la conversation.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="5" />
        <path d="M3 21v-1a9 9 0 0 1 18 0v1" />
      </svg>
    ),
    title: "Avatar 3D avec lip-sync",
    description:
      "Un avatar 3D réaliste synchronise ses lèvres sur chaque réponse. 7 personnages au choix, 12 voix naturelles.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
    title: "Corrections pédagogiques",
    description:
      "Grammaire, vocabulaire, tournures, prononciation - chaque faute est expliquée en français, clairement et sans jugement.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="12" height="13" rx="2" />
        <path d="M6 2h10a2 2 0 0 1 2 2v11" />
      </svg>
    ),
    title: "Flashcards intelligentes",
    description:
      "Vos erreurs deviennent des cartes de révision avec l'algorithme SM-2. Les mots difficiles reviennent plus souvent jusqu'à être maîtrisés.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 10L10 6l8 4-8 4z" fill="currentColor" fillOpacity="0.15" />
        <path d="M2 10l8 4 8-4" />
        <path d="M16 12v5c-2 1-4 1.5-6 1.5S6 18 4 17v-5" />
      </svg>
    ),
    title: "Mises en situation & Roleplay",
    description:
      "Simulez des entretiens d'embauche, des commandes au café ou des contrôles d'aéroport avec missions et objectifs secrets.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M5 6H2a2 2 0 0 0 0 4h3" />
        <path d="M15 6h3a2 2 0 0 1 0 4h-3" />
        <path d="M10 14v3" />
        <path d="M7 17h6" />
      </svg>
    ),
    title: "Test CEFR & Roadmap A1-C1",
    description:
      "Évaluez votre niveau officiel en 3 minutes (A1 à C1) et suivez un parcours d'étapes déblocables étape par étape.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 14a7 7 0 1 1 14 0" />
        <rect x="2" y="14" width="4" height="5" rx="1" />
        <rect x="14" y="14" width="4" height="5" rx="1" />
      </svg>
    ),
    title: "Mode Mains Libres & PWA",
    description:
      "Installez l'app sur votre téléphone et pratiquez en marchant dans la rue sans toucher l'écran (détection auto de la parole).",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h-2" />
      </svg>
    ),
    title: "Analyse Phonétique Mot-à-Mot",
    description:
      "Style Elsa Speak : visualisez chaque son à améliorer, écoutez la prononciation au ralenti et accédez aux astuces articulatoires.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choisissez votre niveau",
    description: "Débutant, intermédiaire ou avancé. L'IA s'adapte automatiquement à vos réponses.",
  },
  {
    step: "02",
    title: "Parlez ou écrivez",
    description: "Utilisez le micro (Chrome/Edge) ou tapez votre message. L'avatar vous répond en moins de 2 secondes.",
  },
  {
    step: "03",
    title: "Progressez avec les corrections",
    description: "Chaque échange génère des corrections et des flashcards. Révisez-les entre deux sessions.",
  },
];

const LEVELS = [
  {
    label: "Débutant",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
    description: "Vocabulaire simple, phrases courtes, sujets du quotidien.",
    examples: ["Se présenter", "Commander au restaurant", "Demander son chemin"],
  },
  {
    label: "Intermédiaire",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
    description: "Conversations fluides, temps composés, expressions idiomatiques.",
    examples: ["Voyages & tourisme", "Travail & entretiens", "Opinions & débats"],
  },
  {
    label: "Avancé",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    dot: "bg-violet-500",
    description: "Nuances, conditionnels, idiomes, argumentation complexe.",
    examples: ["Présentations professionnelles", "Négociations", "Analyses critiques"],
  },
];

const FAQ = [
  {
    q: "Est-ce gratuit ?",
    a: "L'application est open source et auto-hébergeable. Elle utilise l'API OpenRouter - les coûts sont très faibles (quelques centimes par session avec les modèles gratuits disponibles).",
  },
  {
    q: "Ai-je besoin d'une clé API ?",
    a: "Pour la version complète oui - une clé OpenRouter suffit. Certaines fonctionnalités (dictée, répétition) fonctionnent sans clé via la Web Speech API du navigateur.",
  },
  {
    q: "Quels navigateurs sont supportés ?",
    a: "Chrome et Edge pour une expérience complète (micro natif, Web Speech API). Firefox et Safari fonctionnent mais avec le micro en fallback Whisper uniquement.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Toutes vos sessions, corrections et flashcards sont stockées localement dans votre navigateur. Aucune donnée n'est envoyée à un serveur tiers autre qu'OpenRouter pour les appels IA.",
  },
  {
    q: "Puis-je pratiquer d'autres langues ?",
    a: "L'architecture supporte d'autres langues cibles. Actuellement, l'interface est en français et l'apprentissage cible l'anglais. D'autres langues sont prévues.",
  },
];

// ─── Composants ───────────────────────────────────────────────────────────────
// NavBar est un Client Component importé depuis @/components/ui/NavBar


function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Fond radial décoratif + blobs flottants */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-terracotta-100/60 via-cream-100/20 to-transparent rounded-full blur-3xl" />
        <div className="blob-float-1 absolute -top-10 -left-10 w-72 h-72 rounded-full bg-terracotta-200/20 blur-3xl" />
        <div className="blob-float-2 absolute top-20 -right-10 w-64 h-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="blob-float-1 absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-emerald-200/15 blur-3xl" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <RevealOnScroll direction="up" blur>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-pulse" aria-hidden />
            Tuteur IA disponible 24h/24
          </div>
        </RevealOnScroll>

        {/* Titre principal - optimisé SEO H1 */}
        <RevealOnScroll direction="up" delay={100}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brown-700 tracking-tight leading-tight max-w-4xl mx-auto">
            Pratiquez l'anglais oral avec un{" "}
            <span className="shimmer-text">tuteur IA</span>{" "}
            et un avatar 3D
          </h1>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={200}>
          <p className="mt-6 text-lg sm:text-xl text-brown-400 max-w-2xl mx-auto leading-relaxed">
            Conversez en anglais, recevez des corrections instantanées, révisez avec des flashcards intelligentes.
            Gratuit, dans votre navigateur, sans inscription.
          </p>
        </RevealOnScroll>

        {/* CTA */}
        <RevealOnScroll direction="up" delay={300}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white text-base font-bold transition-all shadow-lift active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              Commencer maintenant - c'est gratuit
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-cream-300 bg-cream-50 hover:bg-cream-100 text-brown-600 text-base font-semibold transition-colors"
            >
              Voir comment ça marche
            </a>
          </div>
        </RevealOnScroll>

        {/* Proof points */}
        <RevealOnScroll direction="up" delay={400}>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-brown-300 font-medium">
            {[
              "Aucune inscription requise",
              "7 avatars 3D",
              "12 voix naturelles",
              "Corrections en français",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="2,7 5,10 12,3" />
                  </svg>
                </span>
                {item}
              </span>
            ))}
          </div>
        </RevealOnScroll>

        {/* ── Aperçu UI animé sous forme de Motion Design ── */}
        <RevealOnScroll direction="up" delay={500} blur>
          <div className="mt-14 max-w-4xl mx-auto">
            <HeroMotionDesign />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function StatsBar() {
  const STATS = [
    { value: "8", label: "Modes d'entraînement" },
    { value: "12", label: "Voix naturelles" },
    { value: "A1→C1", label: "Niveaux CEFR" },
    { value: "< 2s", label: "Latence IA" },
  ];
  return (
    <div className="bg-white/70 border-y border-cream-200 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {STATS.map(({ value, label }, i) => (
          <RevealOnScroll key={label} direction="up" delay={i * 100}>
            <div>
              <AnimatedCounter
                value={value}
                className="block text-2xl sm:text-3xl font-extrabold text-terracotta-500 tracking-tight"
              />
              <div className="mt-1 text-xs text-brown-400 font-medium">{label}</div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <RevealOnScroll direction="up" blur>
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-terracotta-500 mb-2">Fonctionnalités</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brown-700 tracking-tight">
              Tout ce qu'il faut pour progresser vraiment
            </h2>
            <p className="mt-4 text-brown-400 max-w-xl mx-auto text-lg">
              Une expérience d'apprentissage complète, pas juste un chatbot.
            </p>
          </div>
        </RevealOnScroll>

        {/* Hero feature card */}
        <RevealOnScroll direction="up" delay={100}>
          <div className="mb-6">
            <article className="bg-gradient-to-br from-terracotta-50 to-cream-100 border-2 border-terracotta-200 rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-terracotta-300 hover:shadow-lift transition-all group">
              <div className="w-14 h-14 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shrink-0 shadow-mic group-hover:scale-110 transition-transform">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <div>
                <span className="inline-block mb-1.5 text-[11px] font-bold uppercase tracking-widest text-terracotta-500 px-2 py-0.5 rounded-full bg-terracotta-100">Fonctionnalité principale</span>
                <h3 className="text-xl font-extrabold text-brown-700 mb-1.5">Conversation naturelle avec corrections</h3>
                <p className="text-brown-400 leading-relaxed">
                  Parlez avec un tuteur IA qui s'adapte à votre niveau et corrige vos erreurs <strong className="text-brown-600">sans couper le fil</strong> de la conversation. Grammaire, vocabulaire, prononciation — tout est analysé en temps réel.
                </p>
              </div>
            </article>
          </div>
        </RevealOnScroll>

        {/* Grille des autres features — stagger */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.slice(1).map((f, i) => (
            <RevealOnScroll key={f.title} direction="up" delay={i * 80}>
              <article
                className="bg-cream-50 border border-cream-200 rounded-2xl p-6 hover:border-terracotta-200 hover:shadow-card hover:-translate-y-1 transition-all group h-full"
              >
                <div className="w-11 h-11 rounded-xl bg-terracotta-50 border border-terracotta-100 text-terracotta-500 flex items-center justify-center mb-4 group-hover:bg-terracotta-100 group-hover:scale-110 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-bold text-brown-700 mb-2">{f.title}</h3>
                <p className="text-sm text-brown-400 leading-relaxed">{f.description}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <RevealOnScroll direction="up" blur>
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-terracotta-500 mb-2">En pratique</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brown-700 tracking-tight">
              En pratique, c'est simple
            </h2>
            <p className="mt-4 text-brown-400 text-lg">
              Pas de compte, pas d'installation. Juste de la pratique.
            </p>
          </div>
        </RevealOnScroll>

        <div className="relative">
          {/* Ligne verticale connectant les étapes */}
          <div className="absolute left-6 sm:left-1/2 top-10 bottom-10 w-px bg-cream-300 -translate-x-px hidden sm:block" aria-hidden />

          <div className="space-y-10">
            {HOW_IT_WORKS.map((step, i) => (
              <RevealOnScroll
                key={step.step}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 120}
                className={`relative flex flex-col sm:flex-row gap-6 items-start sm:items-center ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
              >
                {/* Numéro */}
                <div className="shrink-0 sm:w-1/2 flex justify-start sm:justify-end">
                  <div className={`flex items-center gap-4 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                    <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white font-extrabold text-lg flex items-center justify-center shadow-mic shrink-0 relative z-10 pulse-ring">
                      {step.step.slice(-1)}
                    </div>
                    <div className={`sm:hidden lg:block ${i % 2 === 1 ? "sm:text-right" : ""}`}>
                      <p className="text-[11px] text-terracotta-500 font-bold uppercase tracking-widest">
                        Étape {step.step}
                      </p>
                      <h3 className="font-bold text-brown-700 text-lg mt-0.5">{step.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="sm:w-1/2">
                  <div className="hidden sm:block lg:hidden mb-2">
                    <p className="text-[11px] text-terracotta-500 font-bold uppercase tracking-widest">
                      Étape {step.step}
                    </p>
                    <h3 className="font-bold text-brown-700 text-lg">{step.title}</h3>
                  </div>
                  <p className="text-brown-400 leading-relaxed">{step.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <RevealOnScroll direction="up" delay={300}>
          <div className="text-center mt-14">
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-base transition-all shadow-lift active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
            >
              Essayer maintenant
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M2 8h12M8 2l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Levels() {
  return (
    <section className="py-20 sm:py-24 bg-white/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <RevealOnScroll direction="up" blur>
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-terracotta-500 mb-2">Niveaux</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brown-700 tracking-tight">
              Adapté à votre niveau
            </h2>
            <p className="mt-4 text-brown-400 text-lg max-w-xl mx-auto">
              L'IA ajuste automatiquement sa complexité à chaque échange. Vous pouvez aussi choisir vous-même.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-3 gap-6">
          {LEVELS.map((lvl, i) => (
            <RevealOnScroll key={lvl.label} direction="up" delay={i * 120}>
              <div className={`rounded-2xl border-2 p-6 hover:-translate-y-1 hover:shadow-card transition-all h-full ${lvl.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${lvl.dot}`} aria-hidden />
                  <span className="font-extrabold text-lg">{lvl.label}</span>
                </div>
                <p className="text-sm leading-relaxed mb-4 opacity-80">{lvl.description}</p>
                <ul className="space-y-1.5">
                  {lvl.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-sm opacity-90 font-medium">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <polyline points="2,6 4.5,8.5 10,3" />
                      </svg>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <RevealOnScroll direction="up" blur>
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-terracotta-500 mb-2">FAQ</p>
            <h2 className="text-3xl font-extrabold text-brown-700 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
        </RevealOnScroll>
        <div className="space-y-3" role="list">
          {FAQ.map((item, i) => (
            <RevealOnScroll key={item.q} direction="up" delay={i * 60} as="div">
              <details
                className="group bg-cream-50 border border-cream-200 rounded-xl hover:border-terracotta-200 transition-colors"
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 font-bold text-brown-700 cursor-pointer list-none select-none hover:text-brown-900">
                  <span className="flex items-start gap-2">
                    <span className="text-terracotta-500 shrink-0 mt-0.5 font-extrabold">Q.</span>
                    {item.q}
                  </span>
                  <svg
                    className="faq-chevron shrink-0 text-brown-400"
                    width="16" height="16" viewBox="0 0 16 16"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M3 6l5 5 5-5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm text-brown-400 leading-relaxed pl-5">{item.a}</p>
                </div>
              </details>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <RevealOnScroll direction="up" blur>
          <div className="gradient-animated bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-lift relative overflow-hidden">
            {/* Fond décoratif animé */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="blob-float-1 absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
              <div className="blob-float-2 absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              <div className="blob-float-1 absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-amber-300/15 blur-2xl" style={{ animationDelay: "4s" }} />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Prêt à parler anglais
                <br />
                avec confiance ?
              </h2>
              <p className="mt-4 text-white/80 text-lg max-w-md mx-auto">
                Lancez votre première conversation maintenant. Aucun compte, aucune carte bancaire.
              </p>
              <Link
                href="/app"
                className="mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-terracotta-600 font-extrabold text-base hover:bg-cream-50 transition-all shadow-lg active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50/80 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-brown-300">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-brown-500">English Tutor AI</span>
        </div>

        <nav className="flex items-center gap-5">
          <Link href="/app" className="hover:text-brown-600 transition-colors">Application</Link>
          <Link href="/session" className="hover:text-brown-600 transition-colors">Bilans</Link>
          <a href="#faq" className="hover:text-brown-600 transition-colors">FAQ</a>
        </nav>

        <p className="text-brown-200 text-xs">
          Propulsé par OpenRouter · IA conversationnelle
        </p>
      </div>
    </footer>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-cream-100">
      <NavBar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <Levels />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
