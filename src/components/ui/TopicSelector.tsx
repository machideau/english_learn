"use client";

const TOPICS = [
  "Libre",
  "Voyages",
  "Travail",
  "Gastronomie",
  "Films & Séries",
  "Sport",
  "Technologie",
  "Santé",
  "Culture",
  "Actualités",
];

interface TopicSelectorProps {
  value: string;
  onChange: (topic: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function TopicSelector({ value, onChange, disabled, compact }: TopicSelectorProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-cream-100/90 px-3 py-1 rounded-full border border-cream-200">
        <span className="text-[11px] font-medium text-brown-300 uppercase tracking-wider">
          Thème
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="bg-transparent text-xs text-brown-600 font-medium focus:outline-none cursor-pointer"
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic === "Libre" ? "" : topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-brown-300 uppercase tracking-widest">
        Thème
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input-field text-xs py-1.5 rounded-lg border-cream-200 bg-white"
      >
        {TOPICS.map((topic) => (
          <option key={topic} value={topic === "Libre" ? "" : topic}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  );
}

