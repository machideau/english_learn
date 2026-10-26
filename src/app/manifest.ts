import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Tutor AI - Parlez anglais avec un avatar 3D",
    short_name: "English AI",
    description: "Pratiquez l'anglais oral avec un tuteur IA 3D, corrections en temps réel, scénarios immersifs et flashcards.",
    start_url: "/app",
    display: "standalone",
    background_color: "#fdfbf7",
    theme_color: "#1c1917",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
