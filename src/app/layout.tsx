import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Tutor : Parlez avec votre tuteur IA",
  description:
    "Pratiquez l'anglais oral avec un avatar 3D interactif. Corrections en temps réel, bilans de séance, adapté à votre niveau.",
  keywords: ["anglais", "apprendre", "conversation", "avatar", "IA", "tutor"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className="min-h-dvh font-sans bg-cream-100 text-brown-600 antialiased selection:bg-terracotta-200 selection:text-brown-700"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}



