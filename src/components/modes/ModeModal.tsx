"use client";
import type { AppMode, Level, Correction } from "@/types";
import type { VoiceConfig } from "@/lib/avatars-voices";
import {
  XIcon,
  RepeatIcon,
  HeadphonesIcon,
  FileEditIcon,
  GraduationIcon,
} from "@/components/ui/Icons";
import { RepeatAfterMeMode } from "./RepeatAfterMeMode";
import { DictationMode } from "./DictationMode";
import { TextCorrectionMode } from "./TextCorrectionMode";
import { LessonsMode } from "./LessonsMode";

interface ModeModalProps {
  mode: AppMode;
  isOpen: boolean;
  onClose: () => void;
  level: Level;
  topic?: string;
  voice?: VoiceConfig;
  onCorrectionsFound?: (corrections: Correction[]) => void;
  onStartConversation?: (prompt: string) => void;
}

const MODE_META: Record<
  Exclude<AppMode, "conversation">,
  { title: string; description: string; Icon: React.FC<{ size?: number; className?: string }> }
> = {
  "repeat-after-me": {
    title: "Répète après moi",
    description: "L'avatar dit une phrase — répétez-la à voix haute.",
    Icon: RepeatIcon,
  },
  dictation: {
    title: "Dictée",
    description: "Écoutez et tapez ce que vous entendez.",
    Icon: HeadphonesIcon,
  },
  "text-correction": {
    title: "Correction de texte",
    description: "Collez un texte pour obtenir des corrections détaillées.",
    Icon: FileEditIcon,
  },
  lesson: {
    title: "Leçons structurées",
    description: "Exercices guidés sur la grammaire et le vocabulaire.",
    Icon: GraduationIcon,
  },
};

export function ModeModal({
  mode,
  isOpen,
  onClose,
  level,
  topic,
  voice,
  onCorrectionsFound,
  onStartConversation,
}: ModeModalProps) {
  if (!isOpen || mode === "conversation") return null;

  const meta = MODE_META[mode];
  const Icon = meta.Icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brown-700/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-lg bg-cream-50 sm:rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-terracotta-50 border border-terracotta-200 text-terracotta-500 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
            <div>
              <h2 id="mode-modal-title" className="text-sm font-semibold text-brown-700">
                {meta.title}
              </h2>
              <p className="text-[11px] text-brown-300">{meta.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 hover:bg-cream-200 rounded-full transition-colors shrink-0"
            aria-label="Fermer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === "repeat-after-me" && (
            <RepeatAfterMeMode
              level={level}
              topic={topic}
              voiceId={voice?.id}
              onClose={onClose}
            />
          )}
          {mode === "dictation" && (
            <DictationMode
              level={level}
              topic={topic}
              voiceId={voice?.id}
              onClose={onClose}
            />
          )}
          {mode === "text-correction" && (
            <TextCorrectionMode
              level={level}
              onCorrectionsFound={onCorrectionsFound}
              onClose={onClose}
            />
          )}
          {mode === "lesson" && (
            <LessonsMode
              level={level}
              voiceId={voice?.id}
              onClose={onClose}
              onStartConversation={(prompt) => {
                onStartConversation?.(prompt);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
