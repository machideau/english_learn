import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bilans de séance",
  description: "Consultez vos sessions passées, révisez vos erreurs avec les flashcards et suivez votre progression en anglais.",
  robots: {
    index: false,
  },
};

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
