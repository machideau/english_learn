import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://english-tutor-ai.app";
const SITE_NAME = "English Tutor AI";
const SITE_DESCRIPTION =
  "Pratiquez l'anglais oral gratuitement avec un tuteur IA et un avatar 3D. Corrections en temps réel, prononciation, flashcards intelligentes et leçons structurées. Adapté à tous les niveaux.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} : Pratiquez l'anglais à l'oral avec un avatar 3D`,
    template: `%s : ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Apprentissage & Pratique orale
    "apprendre anglais",
    "apprendre anglais oral",
    "pratiquer anglais oral",
    "parler anglais couramment",
    "cours anglais oral gratuit",
    "cours anglais en ligne",
    "conversation anglais",
    "conversation anglais en ligne",
    "dialogue en anglais",
    "exercices anglais oral",
    "améliorer son anglais oral",
    "parler anglais sans accent",
    "perdre son accent anglais",
    "débloquer son anglais",
    "anglais oral facile",
    "anglais pour francophones",
    "bilingue anglais",

    // Tuteur IA, Avatar 3D & Reconnaissance vocale
    "tuteur anglais IA",
    "professeur anglais IA",
    "intelligence artificielle anglais",
    "apprendre anglais avec IA",
    "avatar 3D anglais",
    "avatar lip sync anglais",
    "parler avec une IA en anglais",
    "conversation avec tuteur IA",
    "AI english tutor",
    "AI language tutor",
    "chatgpt pour apprendre anglais",
    "tuteur virtuel anglais",
    "compagnon virtuel anglais",
    "reconnaissance vocale anglais",
    "synthèse vocale anglais",

    // Niveaux & Cadre Européen CEFR
    "test de niveau anglais",
    "test niveau anglais gratuit",
    "test CEFR anglais",
    "anglais niveau A1",
    "anglais niveau A2",
    "anglais niveau B1",
    "anglais niveau B2",
    "anglais niveau C1",
    "évaluation niveau anglais oral",
    "test de positionnement anglais",
    "anglais débutant",
    "anglais intermédiaire",
    "anglais avancé",
    "parcours apprentissage anglais",

    // Mises en situation & Anglais Professionnel
    "simulation entretien anglais",
    "préparer entretien embauche anglais",
    "job interview practice english",
    "anglais professionnel",
    "anglais des affaires",
    "business english practice",
    "négociation en anglais",
    "anglais pour voyager",
    "anglais aéroport",
    "commander au restaurant en anglais",
    "anglais hôtel et vacances",
    "roleplay anglais",
    "jeux de rôle anglais oral",

    // Prononciation & Phonétique
    "prononciation anglais",
    "correction prononciation anglais",
    "phonétique anglais",
    "alphabet phonétique anglais IPA",
    "comment prononcer en anglais",
    "accent tonique anglais",
    "prononcer le th en anglais",
    "prononcer comme un natif",
    "analyse phonétique anglais",
    "elsa speak alternative",

    // Outils pédagogiques & Révision
    "flashcards anglais",
    "répétition espacée anglais",
    "algorithme SM-2",
    "mémoriser vocabulaire anglais",
    "dictée anglais en ligne",
    "leçons grammaire anglaise",
    "répète après moi anglais",
    "shadowing english",

    // Mobile & Applications
    "application apprendre anglais",
    "meilleure application pour parler anglais",
    "app anglais oral gratuite",
    "application anglais sans abonnement",
    "alternative duolingo oral",
    "alternative babbel",
    "mode mains libres anglais",
    "walk and talk english",

    // Mots-clés en Anglais (International & Expatriés)
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

    // Auteurs
    "machideau",
    "SAMIE Lefaure",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Parlez anglais avec un avatar 3D`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "English Tutor AI - Tuteur IA avec avatar 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Parlez anglais avec un avatar 3D`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr-FR": SITE_URL,
    },
  },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf2e8" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1a0f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Préconnexion aux domaines tiers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon SVG (navigateurs modernes) */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />

        {/* Favicon PNG fallback (navigateurs anciens) */}
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              url: SITE_URL,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              inLanguage: "fr",
              featureList: [
                "Conversation IA en anglais avec avatar 3D et lip-sync",
                "Mises en situation et roleplay immersif avec objectifs secrets",
                "Test de niveau CEFR (A1, A2, B1, B2, C1) avec analyse personnalisée",
                "Parcours et roadmap d'apprentissage guidée en 10 étapes",
                "Mode mains libres Walk & Talk avec détection vocale automatique (VAD)",
                "Visualisation phonétique mot-à-mot style Elsa Speak avec écoute au ralenti",
                "Cartes de réussite partageables (PNG & réseaux sociaux)",
                "Corrections grammaticales, lexicales et tournures en temps réel",
                "Flashcards intelligentes avec algorithme de répétition espacée SM-2",
                "Dictée audio et mode Répète après moi",
                "Leçons structurées de grammaire et vocabulaire",
              ],
              educationalUse: [
                "Pratique de l'anglais oral au quotidien",
                "Préparation aux entretiens d'embauche en anglais",
                "Perfectionnement de la prononciation et phonétique",
                "Mémorisation de vocabulaire à long terme",
                "Évaluation et certification du niveau CEFR",
              ],
              audience: {
                "@type": "EducationalAudience",
                educationalRole: "student",
                geographicArea: "France",
              },
            }),
          }}
        />

        {/* PWA & Mobile Web App Meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="English AI" />
        <link rel="apple-touch-icon" href="/icon.svg" />

        {/* Enregistrement Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className="min-h-dvh font-sans bg-cream-100 text-brown-600 antialiased selection:bg-terracotta-200 selection:text-brown-700"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
