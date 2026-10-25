"use client";
import type { Correction, CorrectionType } from "@/types";
import { PencilIcon, BookIcon, RefreshIcon, WaveIcon } from "@/components/ui/Icons";

const TYPE_CONFIG: Record<
  CorrectionType,
  {
    label: string;
    badgeClass: string;
    Icon: React.FC<{ size?: number; className?: string }>;
  }
> = {
  grammaire: {
    label: "Grammaire",
    badgeClass: "bg-blue-50 border-blue-100 text-blue-600",
    Icon: PencilIcon,
  },
  vocabulaire: {
    label: "Vocabulaire",
    badgeClass: "bg-violet-50 border-violet-100 text-violet-600",
    Icon: BookIcon,
  },
  tournure: {
    label: "Tournure",
    badgeClass: "bg-emerald-50 border-emerald-100 text-emerald-600",
    Icon: RefreshIcon,
  },
  prononciation: {
    label: "Prononciation",
    badgeClass: "bg-terracotta-50 border-terracotta-100 text-terracotta-600",
    Icon: WaveIcon,
  },
};

interface CorrectionCardProps {
  correction: Correction;
  index?: number;
}

export function CorrectionCard({ correction, index }: CorrectionCardProps) {
  const config = TYPE_CONFIG[correction.type];
  const { Icon } = config;

  return (
    <article
      className="correction-card"
      aria-label={`Correction ${index !== undefined ? index + 1 : ""} : ${correction.type}`}
    >
      {/* Badge type */}
      <div className="mb-2.5">
        <span className={`type-badge ${config.badgeClass}`}>
          <Icon size={12} />
          {config.label}
        </span>
      </div>

      {/* Original barré → Corrigé */}
      <div className="flex flex-wrap items-baseline gap-2 mb-2 text-sm">
        <span
          className="line-through text-brown-200 italic"
          aria-label="Votre formulation"
        >
          {correction.original}
        </span>
        <span className="text-brown-100 select-none" aria-hidden>&#8594;</span>
        <span
          className="font-medium text-brown-600"
          aria-label="Version correcte"
        >
          {correction.corrected}
        </span>
      </div>

      {/* Explication */}
      <p className="text-xs text-brown-300 leading-relaxed border-t border-cream-200 pt-2 mt-2">
        {correction.explication_fr}
      </p>
    </article>
  );
}
