import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio - Conversation avec votre tuteur",
  description:
    "Pratiquez l'anglais à l'oral avec votre avatar 3D. Micro, corrections en temps réel, dictée et leçons structurées.",
  robots: {
    index: false, // page applicative - pas de valeur SEO directe
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
