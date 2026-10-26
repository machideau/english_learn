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
  /** Phrase complète d'origine pour contextualiser la correction */
  context?: string;
}

export function CorrectionCard({ correction, index, context }: CorrectionCardProps) {
  const config = TYPE_CONFIG[correction.type];
  const { Icon } = config;

  return (
    <article
      className="correction-card"
      aria-label={`Correction ${index !== undefined ? index + 1 : ""} : ${correction.type}`}
    >
      {/* Contexte optionnel : extrait de la phrase d'origine */}
      {context && (
        <p className="text-[11px] text-brown-300 italic mb-2 truncate" aria-label="Phrase d'origine">
          « {context.length > 80 ? context.slice(0, 80) + "…" : context} »
        </p>
      )}

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
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brown-200 shrink-0 self-center"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
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
