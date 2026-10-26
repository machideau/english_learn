"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { ConversationSession, Correction, CorrectionType } from "@/types";
import {
  ArrowLeftIcon,
  ClockIcon,
  MessageIcon,
  PencilIcon,
  PlayIcon,
  XIcon,
  CheckIcon,
  PencilIcon as GrammarIcon,
  BookIcon,
  RefreshIcon,
  WaveIcon,
  CardsIcon,
} from "@/components/ui/Icons";
import { FlashcardModal } from "@/components/flashcards/FlashcardModal";
import { SRSFlashcardModal } from "@/components/flashcards/SRSFlashcardModal";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { ExportButton } from "@/components/ui/ExportButton";
import { useSRS } from "@/hooks/useSRS";
import { useStreak } from "@/hooks/useStreak";

const STORAGE_KEY = "english_tutor_sessions";
const PAGE_SIZE = 10;

type SessionFilter = "all" | "with-corrections" | "roleplay";

// ── Modal de confirmation ────────────────────────────────────────────────────
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl p-6 flex flex-col gap-4">
        <p className="text-sm font-medium text-brown-700">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary text-xs py-2 px-4">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white border border-red-600 transition-all active:scale-95"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function loadSessions(): ConversationSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RecurringError {
  type: CorrectionType;
  count: number;
  examples: Correction[];
}

function analyzeSession(session: ConversationSession) {
  const typeCount = new Map<CorrectionType, Correction[]>();
  for (const c of session.allCorrections) {
    typeCount.set(c.type, [...(typeCount.get(c.type) ?? []), c]);
  }
  const recurringErrors: RecurringError[] = Array.from(typeCount.entries())
    .map(([type, examples]) => ({ type, count: examples.length, examples }))
    .sort((a, b) => b.count - a.count);
  const wordsToReview = Array.from(
    new Set(
      session.allCorrections
        .filter((c) => c.type === "vocabulaire" || c.type === "prononciation")
        .map((c) => c.original)
    )
  ).slice(0, 10);
  return {
    recurringErrors,
    wordsToReview,
    messageCount: session.messages.filter((m) => m.role === "user").length,
  };
}

const TYPE_LABELS: Record<CorrectionType, string> = {
  grammaire: "Grammaire",
  vocabulaire: "Vocabulaire",
  tournure: "Tournure",
  prononciation: "Prononciation",
};

const TYPE_STYLES: Record<CorrectionType, { badge: string; Icon: React.FC<{ size?: number }> }> = {
  grammaire:     { badge: "bg-blue-50 border-blue-100 text-blue-600",        Icon: GrammarIcon },
  vocabulaire:   { badge: "bg-violet-50 border-violet-100 text-violet-600",  Icon: BookIcon },
  tournure:      { badge: "bg-emerald-50 border-emerald-100 text-emerald-600", Icon: RefreshIcon },
  prononciation: { badge: "bg-terracotta-50 border-terracotta-100 text-terracotta-600", Icon: WaveIcon },
};

function StatPill({
  Icon,
  value,
  label,
}: {
  Icon: React.FC<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-brown-300">
      <Icon size={12} className="shrink-0" />
      <span className="font-medium text-brown-500">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  onReview,
}: {
  session: ConversationSession;
  onDelete: (id: string) => void;
  onReview: (corrections: Correction[], title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { recurringErrors, wordsToReview, messageCount } = analyzeSession(session);

  return (
    <article className="card animate-fade-in">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-brown-200 capitalize truncate">
            {formatDate(session.startedAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-sm font-medium text-brown-600 capitalize">
              {session.level}
            </span>
            {session.topic && (
              <span className="text-xs px-2 py-0.5 bg-cream-200 rounded-full text-brown-300 border border-cream-300">
                {session.topic}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
          {session.allCorrections.length > 0 && (
            <button
              onClick={() =>
                onReview(
                  session.allCorrections,
                  `Session du ${new Date(session.startedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}`
                )
              }
              className="btn-secondary text-xs py-1.5 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 bg-terracotta-50/70 border-terracotta-200 text-terracotta-600 hover:bg-terracotta-100 transition-colors"
              title="Réviser les erreurs de cette session en flashcards"
            >
              <CardsIcon size={13} />
              <span>Réviser ({session.allCorrections.length})</span>
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-secondary text-xs py-1.5 px-2.5 sm:px-3"
          >
            {open ? "Réduire" : "Bilan"}
          </button>
          <ExportButton session={session} compact />
          <button
            onClick={() => onDelete(session.id)}
            className="p-1.5 text-brown-100 hover:text-terracotta-500 transition-colors rounded hover:bg-terracotta-50"
            aria-label="Supprimer cette session"
          >
            <XIcon size={14} />
          </button>        </div>

      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-cream-200">
        <StatPill
          Icon={ClockIcon}
          value={formatDuration(session.startedAt, session.endedAt)}
          label="durée"
        />
        <StatPill
          Icon={MessageIcon}
          value={messageCount}
          label={messageCount > 1 ? "interventions" : "intervention"}
        />
        <StatPill
          Icon={PencilIcon}
          value={session.allCorrections.length}
          label={session.allCorrections.length > 1 ? "corrections" : "correction"}
        />
      </div>

      {/* Bilan détaillé */}
      {open && (
        <div className="mt-4 space-y-5 border-t border-cream-200 pt-4 animate-slide-up">

          {/* Erreurs fréquentes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-brown-300 uppercase tracking-widest">
                Erreurs fréquentes
              </h3>
              {session.allCorrections.length > 0 && (
                <button
                  onClick={() =>
                    onReview(
                      session.allCorrections,
                      `Session du ${new Date(session.startedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}`
                    )
                  }
                  className="text-xs text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <CardsIcon size={12} />
                  S'entraîner sur ces erreurs
                </button>
              )}
            </div>
            {recurringErrors.length > 0 ? (
              <div className="space-y-3">
                {recurringErrors.map((err) => {
                  const { badge, Icon } = TYPE_STYLES[err.type];
                  return (
                    <div key={err.type}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${badge}`}>
                          <Icon size={11} />
                          {TYPE_LABELS[err.type]}
                          <span className="font-semibold">&times;{err.count}</span>
                        </span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {err.examples.slice(0, 3).map((c, i) => (
                          <li key={i} className="card-inset text-xs">
                            <div className="flex flex-wrap items-baseline gap-1.5">
                              <span className="line-through text-brown-200 italic">{c.original}</span>
                              <svg
                                width="11"
                                height="11"
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
                              <span className="font-medium text-brown-600">{c.corrected}</span>
                            </div>
                            <p className="mt-1 text-brown-300">{c.explication_fr}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-brown-300">
                <CheckIcon size={14} className="text-emerald-500" />
                Aucune erreur récurrente. Excellent travail !
              </div>
            )}
          </section>

          {/* Mots à retravailler */}
          {wordsToReview.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-brown-300 uppercase tracking-widest mb-3">
                Mots à retravailler
              </h3>
              <div className="flex flex-wrap gap-2">
                {wordsToReview.map((word) => (
                  <a
                    key={word}
                    href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.toLowerCase().trim())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-cream-100 hover:bg-terracotta-50 rounded border border-cream-200 hover:border-terracotta-200 text-xs text-brown-500 hover:text-terracotta-600 transition-colors flex items-center gap-1"
                    title={`Voir « ${word} » dans le dictionnaire Cambridge`}
                  >
                    {word}
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                      aria-hidden="true"
                    >
                      <path d="M1 9L9 1M9 1H4M9 1v5" />
                    </svg>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-brown-200 mt-2">
                Cliquez sur un mot pour l'ouvrir dans le dictionnaire Cambridge.
              </p>
            </section>
          )}

          {/* Réponses réécoutables */}
          {session.messages.filter((m) => m.role === "assistant" && m.audioUrl).length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-brown-300 uppercase tracking-widest mb-3">
                Réponses de l'avatar
              </h3>
              <ul className="space-y-2">
                {session.messages
                  .filter((m) => m.role === "assistant" && m.audioUrl)
                  .slice(0, 4)
                  .map((m, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <button
                        onClick={() => new Audio(m.audioUrl!).play().catch(() => {})}
                        className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center
                                   bg-cream-200 hover:bg-terracotta-500 hover:text-cream-50
                                   text-brown-400 border border-cream-300 hover:border-terracotta-600
                                   transition-all duration-150"
                        aria-label="Réécouter"
                      >
                        <PlayIcon size={10} />
                      </button>
                      <p className="text-xs text-brown-400 leading-relaxed pt-0.5">{m.content}</p>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
}

export default function SessionPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSRSOpen, setIsSRSOpen] = useState(false);
  const [reviewCorrections, setReviewCorrections] = useState<Correction[]>([]);
  const [reviewTitle, setReviewTitle] = useState("Révision des erreurs");
  const { cards: srsCards, dueCards, reviewCard } = useSRS();
  const { streak } = useStreak();
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // session id à supprimer
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    setSessions(loadSessions().reverse());
  }, []);

  const filteredSessions = useMemo(() => {
    switch (filter) {
      case "with-corrections":
        return sessions.filter((s) => s.allCorrections.length > 0);
      case "roleplay":
        return sessions.filter((s) => s.topic && s.topic.length > 0);
      default:
        return sessions;
    }
  }, [sessions, filter]);

  const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);
  const pagedSessions = filteredSessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allCorrections = useMemo(() => {
    return sessions.flatMap((s) => s.allCorrections);
  }, [sessions]);

  const uniqueAllCount = useMemo(() => {
    const keys = new Set(
      allCorrections.map(
        (c) => `${c.original.trim().toLowerCase()}->${c.corrected.trim().toLowerCase()}`
      )
    );
    return keys.size;
  }, [allCorrections]);

  const handleOpenReview = (corrections: Correction[], title = "Révision des erreurs") => {
    setReviewCorrections(corrections);
    setReviewTitle(title);
    setIsReviewOpen(true);
  };

  const handleDelete = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice().reverse()));
      } catch {}
      return updated;
    });
    setConfirmDelete(null);
  }, []);

  const handleClearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessions([]);
    setConfirmClearAll(false);
  }, []);

  return (
    <div className="min-h-dvh bg-cream-100">
      {/* Modal de confirmation de suppression unique */}
      {confirmDelete && (
        <ConfirmModal
          message="Supprimer cette session ? Cette action est irréversible."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {/* Modal de confirmation de suppression globale */}
      {confirmClearAll && (
        <ConfirmModal
          message="Supprimer toutes les sessions ? Vos flashcards SRS ne seront pas affectées."
          onConfirm={handleClearAll}
          onCancel={() => setConfirmClearAll(false)}
        />
      )}

      {/* Header */}
      <header className="glass-header sticky top-0 z-10 px-4 sm:px-6 py-3 shadow-subtle">
        <div className="max-w-xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 text-brown-200 hover:text-brown-600 hover:bg-cream-200 rounded transition-colors"
              aria-label="Retour à l'accueil"
            >
              <ArrowLeftIcon size={18} />
            </Link>
            <h1 className="text-base font-semibold text-brown-600 tracking-tight">
              Bilans de séance
            </h1>
          </div>
          {sessions.length > 0 && (
            <div className="flex items-center gap-2">
              <ExportButton sessions={[...sessions].reverse()} label="Tout exporter" />
              <button
                onClick={() => setConfirmClearAll(true)}
                className="btn-ghost text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-xl mx-auto px-5 py-6">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-12 h-12 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center">
              <MessageIcon size={20} className="text-brown-200" />
            </div>
            <div className="text-center">
              <p className="text-sm text-brown-300">Aucune session enregistrée.</p>
              <Link
                href="/"
                className="text-sm text-terracotta-500 hover:text-terracotta-600 transition-colors mt-1 inline-block"
              >
                Commencer une conversation
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Streak */}
            <StreakBadge streak={streak} />

            {/* Bannière SRS si cartes dues */}
            {dueCards.length > 0 && (
              <div className="card bg-gradient-to-br from-terracotta-50 to-cream-100 border-terracotta-200 p-4 flex items-center justify-between gap-3 animate-fade-in">
                <div>
                  <p className="text-sm font-semibold text-terracotta-700">
                    {dueCards.length} carte{dueCards.length > 1 ? "s" : ""} à réviser aujourd'hui
                  </p>
                  <p className="text-xs text-brown-300 mt-0.5">
                    Répétition espacée - vos erreurs passées
                  </p>
                </div>
                <button
                  onClick={() => setIsSRSOpen(true)}
                  className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                >
                  <CardsIcon size={13} />
                  Réviser
                </button>
              </div>
            )}

            {/* Bannière Mode Flashcards Global */}
            {allCorrections.length > 0 && (
              <div className="card bg-gradient-to-br from-cream-50 via-cream-100 to-terracotta-50/40 border-terracotta-200/80 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-terracotta-500 text-cream-50 inline-flex items-center justify-center shadow-sm">
                      <CardsIcon size={16} />
                    </span>
                    <h2 className="text-sm font-semibold text-brown-600">
                      Entraînement Flashcards
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 font-medium">
                      {uniqueAllCount} carte{uniqueAllCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-brown-300 leading-relaxed max-w-sm">
                    Révisez avec l'écoute audio et la répétition espacée pour transformer vos erreurs passées en automatismes.
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleOpenReview(allCorrections, "Révision globale de toutes les sessions")
                  }
                  className="btn-primary text-xs py-2 px-4 shadow-sm shrink-0 flex items-center gap-2 w-full sm:w-auto"
                >
                  <CardsIcon size={14} />
                  <span>Lancer la révision ({uniqueAllCount})</span>
                </button>
              </div>
            )}

            {/* Filtres rapides */}
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { value: "all", label: "Toutes" },
                  { value: "with-corrections", label: "Avec erreurs" },
                  { value: "roleplay", label: "Avec sujet" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setFilter(value); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filter === value
                      ? "bg-terracotta-500 text-white border-terracotta-600"
                      : "bg-cream-50 text-brown-500 border-cream-300 hover:bg-cream-100"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="text-xs text-brown-300 ml-auto">
                {filteredSessions.length} session{filteredSessions.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Liste paginée */}
            {pagedSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-brown-300">Aucune session ne correspond à ce filtre.</p>
              </div>
            ) : (
              pagedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={(id) => setConfirmDelete(id)}
                  onReview={handleOpenReview}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-cream-300 bg-cream-50 text-brown-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Précédent
                </button>
                <span className="text-xs text-brown-400 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-cream-300 bg-cream-50 text-brown-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modale interactive de Flashcards */}
      <FlashcardModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        corrections={reviewCorrections}
        title={reviewTitle}
      />

      {/* Modale SRS */}
      <SRSFlashcardModal
        isOpen={isSRSOpen}
        onClose={() => setIsSRSOpen(false)}
        cards={srsCards}
        dueCards={dueCards}
        onGrade={reviewCard}
        title="Répétition espacée"
      />
    </div>
  );
}

