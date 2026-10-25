"use client";
import type { Level } from "@/types";

const LEVELS: Array<{ value: Level; label: string; description: string }> = [
  { value: "débutant",      label: "Débutant",      description: "Vocabulaire simple, phrases courtes" },
  { value: "intermédiaire", label: "Intermédiaire", description: "Conversations quotidiennes" },
  { value: "avancé",        label: "Avancé",        description: "Nuances, idiomes" },
];

interface LevelSelectorProps {
  value: Level;
  onChange: (level: Level) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function LevelSelector({ value, onChange, disabled, compact }: LevelSelectorProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-0.5 bg-cream-100/90 p-0.5 rounded-full border border-cream-200">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            disabled={disabled}
            title={level.description}
            className={[
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150",
              value === level.value
                ? "bg-brown-600 text-cream-50 shadow-sm"
                : "text-brown-400 hover:text-brown-600 hover:bg-cream-200/60",
              disabled ? "opacity-40 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {level.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-brown-300 uppercase tracking-widest">
        Niveau
      </label>
      <div className="flex gap-1.5 bg-cream-100/60 p-1 rounded-lg border border-cream-200">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            disabled={disabled}
            title={level.description}
            className={[
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              value === level.value
                ? "bg-brown-600 text-cream-50 shadow-sm"
                : "text-brown-400 hover:text-brown-600 hover:bg-cream-200/70",
              disabled ? "opacity-40 cursor-not-allowed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

