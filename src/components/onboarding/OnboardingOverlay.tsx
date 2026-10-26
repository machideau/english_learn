"use client";
import { useState, useEffect, useCallback } from "react";
import { MicIcon, PencilIcon, CardsIcon, XIcon } from "@/components/ui/Icons";

const STORAGE_KEY = "english_tutor_onboarded";

const SLIDES = [
  {
    Icon: MicIcon,
    iconBg: "bg-terracotta-50 border-terracotta-200 text-terracotta-600",
    title: "Parlez anglais avec votre tuteur",
    description:
      "Appuyez sur le bouton micro, parlez en anglais, et votre tuteur IA vous répond instantanément à l'oral.",
    hint: "Vous pouvez aussi écrire dans le champ texte si vous préférez.",
  },
  {
    Icon: PencilIcon,
    iconBg: "bg-blue-50 border-blue-200 text-blue-600",
    title: "Recevez des corrections détaillées",
    description:
      "Chaque erreur de grammaire, de vocabulaire ou de tournure est expliquée en français, sans interrompre la conversation.",
    hint: "Les corrections apparaissent dans l'onglet « Fautes » à droite.",
  },
  {
    Icon: CardsIcon,
    iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
    title: "Mémorisez avec les flashcards",
    description:
      "Vos erreurs deviennent des cartes de révision intelligentes. L'algorithme SM-2 vous les repose au bon moment.",
    hint: "Révisez depuis l'onglet « Bilans » ou depuis les raccourcis du dock.",
  },
];

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setVisible(true);
    } catch {
      // localStorage inaccessible
    }
  }, []);

  const close = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else {
      close();
    }
  }, [step, close]);

  if (!visible) return null;

  const slide = SLIDES[step];
  const Icon = slide.Icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenue sur English Tutor AI"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brown-900/65 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full sm:max-w-md bg-cream-50 sm:rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Barre de progression */}
        <div className="flex gap-1.5 px-5 pt-5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-terracotta-500" : "bg-cream-200"
              }`}
            />
          ))}
        </div>

        {/* Contenu */}
        <div className="p-6 pt-5 flex flex-col items-center text-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center ${slide.iconBg}`}
          >
            <Icon size={30} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-brown-700 leading-tight">{slide.title}</h2>
            <p className="text-sm text-brown-500 leading-relaxed max-w-xs mx-auto">
              {slide.description}
            </p>
          </div>

          {slide.hint && (
            <p className="text-xs text-brown-400 bg-cream-100 border border-cream-200 rounded-lg px-4 py-2.5 w-full">
              Conseil : {slide.hint}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={close}
            className="btn-ghost flex-shrink-0 text-xs"
            aria-label="Passer l'introduction"
          >
            Passer
          </button>
          <button onClick={next} className="btn-primary flex-1 py-2.5">
            {step < SLIDES.length - 1 ? "Suivant" : "C'est parti !"}
          </button>
        </div>
      </div>
    </div>
  );
}
