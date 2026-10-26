"use client";
import { useState, useCallback } from "react";
import type { Level, Lesson, LessonExercise } from "@/types";
import { LESSONS } from "@/lib/lessons";
import {
  GraduationIcon,
  CheckIcon,
  XIcon,
  VolumeIcon,
  SpinnerIcon,
  ClockIcon,
  RepeatIcon,
} from "@/components/ui/Icons";

interface LessonsModeProps {
  level: Level;
  voiceId?: string;
  onClose?: () => void;
  onStartConversation?: (prompt: string) => void;
}

// ─── Sous-composant : liste des leçons ────────────────────────────────────────
function LessonList({
  level,
  onSelect,
  onClose,
}: {
  level: Level;
  onSelect: (lesson: Lesson) => void;
  onClose?: () => void;
}) {
  const filtered = LESSONS.filter((l) => l.level === level);
  const all = LESSONS;

  const CATEGORY_LABELS: Record<string, string> = {
    grammaire: "Grammaire",
    vocabulaire: "Vocabulaire",
    prononciation: "Prononciation",
    conversation: "Conversation",
  };
  const CATEGORY_COLORS: Record<string, string> = {
    grammaire: "bg-blue-50 text-blue-600 border-blue-100",
    vocabulaire: "bg-violet-50 text-violet-600 border-violet-100",
    prononciation: "bg-terracotta-50 text-terracotta-600 border-terracotta-100",
    conversation: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-brown-300 uppercase tracking-widest font-medium mb-3">
          Leçons pour votre niveau ({level})
        </p>
        <div className="space-y-2">
          {filtered.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson)}
              className="w-full text-left card hover:border-terracotta-200 hover:bg-terracotta-50/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brown-600 group-hover:text-terracotta-600 transition-colors">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-brown-300 mt-0.5 leading-relaxed">
                    {lesson.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${CATEGORY_COLORS[lesson.category]}`}
                    >
                      {CATEGORY_LABELS[lesson.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-brown-200">
                      <ClockIcon size={10} />
                      {lesson.durationMin} min
                    </span>
                    <span className="text-[10px] text-brown-200">
                      {lesson.exercises.length} exercices
                    </span>
                  </div>
                </div>
                <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-cream-200 group-hover:bg-terracotta-100 flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M2 6h8M6 2l4 4-4 4"/>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Autres leçons disponibles */}
      {all.length > filtered.length && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-brown-300 hover:text-brown-500 flex items-center gap-1.5 select-none list-none">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden className="group-open:rotate-90 transition-transform">
              <path d="M4 2l4 4-4 4"/>
            </svg>
            Voir toutes les leçons ({all.length})
          </summary>
          <div className="mt-2 space-y-2">
            {all
              .filter((l) => l.level !== level)
              .map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelect(lesson)}
                  className="w-full text-left card hover:border-terracotta-200 hover:bg-terracotta-50/30 transition-all opacity-70 hover:opacity-100 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-brown-500 group-hover:text-terracotta-600 transition-colors">
                        {lesson.title}
                      </p>
                      <span className="text-[10px] text-brown-200 capitalize">{lesson.level}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${CATEGORY_COLORS[lesson.category]}`}
                    >
                      {CATEGORY_LABELS[lesson.category]}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </details>
      )}

      {onClose && (
        <button onClick={onClose} className="btn-ghost text-xs w-full">
          Fermer
        </button>
      )}
    </div>
  );
}

// ─── Sous-composant : exercice individuel ─────────────────────────────────────
function ExerciseView({
  exercise,
  voiceId,
  onAnswer,
}: {
  exercise: LessonExercise;
  voiceId?: string;
  onAnswer: (correct: boolean) => void;
}) {
  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const playAudio = async (text: string) => {
    setIsPlaying(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceId ?? "" }),
      });
      if (res.ok) {
        const data = await res.json();
        const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
        await new Promise<void>((r) => {
          audio.onended = () => r();
          audio.onerror = () => r();
          audio.play().catch(() => r());
        });
      } else {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          await new Promise<void>((r) => {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = "en-US";
            utt.onend = () => r();
            utt.onerror = () => r();
            window.speechSynthesis.speak(utt);
          });
        }
      }
    } catch {
      // silent fail
    }
    setIsPlaying(false);
  };

  const checkAnswer = () => {
    if (!exercise.answer) {
      onAnswer(true); // conversation exercises - always proceed
      return;
    }
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").trim();
    const correct =
      normalize(userInput).includes(normalize(exercise.answer)) ||
      normalize(exercise.answer).includes(normalize(userInput)) ||
      // close enough (>80% word overlap)
      wordOverlap(normalize(userInput), normalize(exercise.answer)) >= 0.8;
    setIsCorrect(correct);
    setIsChecked(true);
  };

  return (
    <div className="space-y-4">
      <div className="card py-5 space-y-3">
        <p className="text-[11px] text-brown-300 uppercase tracking-widest font-medium">
          {exercise.instruction}
        </p>

        <div className="bg-cream-100/80 rounded-lg px-4 py-3 text-sm font-medium text-brown-700 border border-cream-200 leading-relaxed">
          {exercise.prompt}
        </div>

        {(exercise.type === "repeat" || exercise.audioText) && (
          <button
            onClick={() => playAudio(exercise.audioText ?? exercise.prompt)}
            disabled={isPlaying}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brown-500 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <SpinnerIcon size={13} className="animate-spin" />
            ) : (
              <VolumeIcon size={13} />
            )}
            Écouter
          </button>
        )}
      </div>

      {/* Zone de réponse (pas pour type conversation) */}
      {exercise.type !== "conversation" && exercise.type !== "repeat" && (
        <div className="space-y-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isChecked && userInput.trim() && checkAnswer()}
            placeholder="Votre réponse en anglais…"
            disabled={isChecked}
            className="input-field"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />

          {exercise.hint && !isChecked && (
            <button
              onClick={() => setShowHint((v) => !v)}
              className="text-xs text-brown-300 hover:text-brown-500 transition-colors"
            >
              {showHint ? "Masquer l'indice" : "Voir un indice"}
            </button>
          )}
          {showHint && exercise.hint && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2.5 py-1.5">
              Indice : {exercise.hint}
            </p>
          )}
        </div>
      )}

      {/* Résultat */}
      {isChecked && exercise.answer && (
        <div
          className={[
            "card-inset text-sm animate-fade-in",
            isCorrect ? "border-emerald-200 bg-emerald-50/60" : "border-terracotta-200 bg-terracotta-50/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 font-semibold mb-1.5">
            {isCorrect ? (
              <CheckIcon size={15} className="text-emerald-600" />
            ) : (
              <XIcon size={15} className="text-terracotta-500" />
            )}
            <span className={isCorrect ? "text-emerald-700" : "text-terracotta-700"}>
              {isCorrect ? "Bonne réponse !" : "Pas tout à fait"}
            </span>
          </div>
          {!isCorrect && (
            <p className="text-xs text-brown-500">
              Réponse attendue :{" "}
              <span className="font-semibold text-brown-700">{exercise.answer}</span>
            </p>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        {!isChecked && exercise.type !== "conversation" && exercise.type !== "repeat" && (
          <button
            onClick={checkAnswer}
            disabled={!userInput.trim()}
            className="btn-primary text-xs py-2 px-5 flex-1"
          >
            Vérifier
          </button>
        )}
        {(isChecked || exercise.type === "conversation" || exercise.type === "repeat") && (
          <button
            onClick={() => onAnswer(isCorrect || exercise.type === "conversation" || exercise.type === "repeat")}
            className="btn-primary text-xs py-2 px-5 flex-1"
          >
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function LessonsMode({ level, voiceId, onClose, onStartConversation }: LessonsModeProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setExerciseIdx(0);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!selectedLesson) return;
      const newAnswers = [...answers, correct];
      setAnswers(newAnswers);
      if (correct) setScore((s) => s + 1);

      const currentExercise = selectedLesson.exercises[exerciseIdx];

      // Si c'est un exercice de conversation, on propose de l'ouvrir dans le chat
      if (currentExercise.type === "conversation" && onStartConversation) {
        onStartConversation(currentExercise.prompt);
        return;
      }

      if (exerciseIdx + 1 >= selectedLesson.exercises.length) {
        setFinished(true);
        return;
      }
      setExerciseIdx((i) => i + 1);
    },
    [selectedLesson, answers, exerciseIdx, onStartConversation]
  );

  const handleRestart = () => {
    setExerciseIdx(0);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  // ─ Liste des leçons ─
  if (!selectedLesson) {
    return (
      <LessonList
        level={level}
        onSelect={handleSelectLesson}
        onClose={onClose}
      />
    );
  }

  // ─ Bilan leçon ─
  if (finished) {
    const total = selectedLesson.exercises.filter(
      (e) => e.type !== "conversation"
    ).length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 100;

    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3">
            <GraduationIcon size={26} />
          </div>
          <h3 className="text-base font-semibold text-brown-600">Leçon terminée !</h3>
          <p className="text-sm text-brown-300 mt-1">
            {selectedLesson.title}
          </p>
        </div>

        <div className="card-inset text-center">
          <span className="text-3xl font-bold text-terracotta-500">{pct}%</span>
          <p className="text-xs text-brown-300 mt-1">de bonnes réponses</p>
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={handleRestart} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5">
            <RepeatIcon size={13} />
            Recommencer
          </button>
          <button
            onClick={() => {
              setSelectedLesson(null);
              setFinished(false);
            }}
            className="btn-primary text-xs py-2 px-4"
          >
            Autres leçons
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-ghost text-xs">
              Fermer
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentExercise = selectedLesson.exercises[exerciseIdx];

  return (
    <div className="space-y-4">
      {/* En-tête leçon */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-1.5 text-xs text-brown-300 hover:text-brown-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <path d="M9 11L5 7l4-4"/>
          </svg>
          Toutes les leçons
        </button>
        <span className="text-xs text-brown-300">
          {exerciseIdx + 1} / {selectedLesson.exercises.length}
        </span>
      </div>

      {/* Barre de progression */}
      <div>
        <p className="text-sm font-semibold text-brown-600 mb-1">{selectedLesson.title}</p>
        <div className="bg-cream-200 rounded-full h-1.5">
          <div
            className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(exerciseIdx / selectedLesson.exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercice */}
      <ExerciseView
        key={currentExercise.id}
        exercise={currentExercise}
        voiceId={voiceId}
        onAnswer={handleAnswer}
      />
    </div>
  );
}

function wordOverlap(a: string, b: string): number {
  const wa = a.split(/\s+/).filter(Boolean);
  const wb = b.split(/\s+/).filter(Boolean);
  if (wb.length === 0) return 0;
  const setB = new Set(wb);
  return wa.filter((w) => setB.has(w)).length / wb.length;
}
