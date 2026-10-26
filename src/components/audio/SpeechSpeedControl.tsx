"use client";
import { playSubtleClick } from "@/lib/sound-effects";

export type SpeechSpeed = 0.75 | 1.0 | 1.25;

interface SpeechSpeedControlProps {
  speed: SpeechSpeed;
  onChange: (newSpeed: SpeechSpeed) => void;
  className?: string;
}

const SPEEDS: Array<{ value: SpeechSpeed; label: string; tooltip: string }> = [
  { value: 0.75, label: "0.75×", tooltip: "Ralenti pour bien décomposer" },
  { value: 1.0, label: "1×", tooltip: "Vitesse naturelle" },
  { value: 1.25, label: "1.25×", tooltip: "Rythme natif rapide" },
];

export function SpeechSpeedControl({
  speed,
  onChange,
  className = "",
}: SpeechSpeedControlProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 bg-cream-100/90 border border-cream-200/90 p-1 rounded-xl shadow-xs text-xs font-medium text-brown-600 ${className}`}
      role="group"
      aria-label="Vitesse d'élocution du tuteur"
    >
      <span className="px-1.5 text-[10px] text-brown-400 font-semibold uppercase tracking-wider select-none">
        Débit
      </span>
      {SPEEDS.map((s) => {
        const isActive = speed === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              playSubtleClick();
              onChange(s.value);
            }}
            title={s.tooltip}
            aria-pressed={isActive}
            className={[
              "px-2 py-0.5 rounded-lg text-xs font-semibold transition-all duration-150",
              isActive
                ? "bg-terracotta-500 text-white shadow-xs scale-102"
                : "text-brown-500 hover:text-brown-800 hover:bg-cream-200/70",
            ].join(" ")}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
