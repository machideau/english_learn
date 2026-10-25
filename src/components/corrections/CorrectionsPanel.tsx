"use client";
import type { Correction } from "@/types";
import { CorrectionCard } from "./CorrectionCard";
import { ChevronDownIcon } from "@/components/ui/Icons";

interface CorrectionsPanelProps {
  corrections: Correction[];
  isOpen: boolean;
  onToggle: () => void;
}

export function CorrectionsPanel({
  corrections,
  isOpen,
  onToggle,
}: CorrectionsPanelProps) {
  const count = corrections.length;

  return (
    <aside
      aria-label="Panneau de corrections"
      className="flex flex-col border-l border-cream-200 bg-cream-50 w-full"
    >
      {/* En-tête */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 border-b border-cream-200 hover:bg-cream-100 transition-colors shrink-0"
        aria-expanded={isOpen}
        aria-controls="corrections-list"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-brown-500 uppercase tracking-widest">
            Corrections
          </span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-terracotta-500 text-cream-50 text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        <ChevronDownIcon
          size={16}
          className={[
            "text-brown-200 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90",
          ].join(" ")}
        />
      </button>

      {/* Liste */}
      {isOpen && (
        <div
          id="corrections-list"
          className="flex-1 overflow-y-auto p-3 space-y-2.5"
        >
          {corrections.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-brown-200 leading-relaxed">
                Aucune correction pour l'instant.
                <br />
                Continuez à parler.
              </p>
            </div>
          ) : (
            corrections
              .slice()
              .reverse()
              .map((c, i) => (
                <CorrectionCard
                  key={`${c.original}-${i}`}
                  correction={c}
                  index={corrections.length - 1 - i}
                />
              ))
          )}
        </div>
      )}
    </aside>
  );
}
