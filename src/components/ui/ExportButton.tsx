"use client";
import { useCallback } from "react";
import type { ConversationSession } from "@/types";
import { DownloadIcon } from "@/components/ui/Icons";

interface ExportButtonProps {
  session?: ConversationSession | null;
  sessions?: ConversationSession[];
  label?: string;
  compact?: boolean;
}

function formatSessionForExport(session: ConversationSession): string {
  const date = new Date(session.startedAt).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationMs =
    (session.endedAt ?? Date.now()) - session.startedAt;
  const durationMin = Math.round(durationMs / 60000);
  const userMessages = session.messages.filter((m) => m.role === "user").length;

  let output = `ENGLISH TUTOR — SESSION DU ${date.toUpperCase()}\n`;
  output += "═".repeat(60) + "\n\n";
  output += `Niveau   : ${session.level}\n`;
  if (session.topic) output += `Thème    : ${session.topic}\n`;
  output += `Durée    : ${durationMin} min\n`;
  output += `Messages : ${userMessages} interventions\n`;
  output += `Fautes   : ${session.allCorrections.length}\n\n`;

  // Conversation
  output += "─── CONVERSATION ───\n\n";
  for (const msg of session.messages) {
    const time = new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const role = msg.role === "user" ? "Vous" : "Tuteur";
    output += `[${time}] ${role}:\n${msg.content}\n\n`;
  }

  // Corrections
  if (session.allCorrections.length > 0) {
    output += "─── CORRECTIONS ───\n\n";
    for (let i = 0; i < session.allCorrections.length; i++) {
      const c = session.allCorrections[i];
      output += `${i + 1}. [${c.type.toUpperCase()}]\n`;
      output += `   Vous avez dit  : "${c.original}"\n`;
      output += `   Correct        : "${c.corrected}"\n`;
      output += `   Explication    : ${c.explication_fr}\n\n`;
    }
  }

  return output;
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatDateFilename(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function ExportButton({
  session,
  sessions,
  label,
  compact,
}: ExportButtonProps) {
  const handleExport = useCallback(() => {
    if (sessions && sessions.length > 0) {
      // Export de toutes les sessions
      let content = "ENGLISH TUTOR — EXPORT COMPLET\n";
      content += "═".repeat(60) + "\n";
      content += `Exporté le ${new Date().toLocaleDateString("fr-FR")}\n`;
      content += `${sessions.length} session(s)\n\n`;
      for (const s of [...sessions].reverse()) {
        content += formatSessionForExport(s);
        content += "\n" + "═".repeat(60) + "\n\n";
      }
      downloadText(content, `english-tutor-export-${formatDateFilename(Date.now())}.txt`);
      return;
    }

    if (session) {
      const content = formatSessionForExport(session);
      downloadText(
        content,
        `english-session-${formatDateFilename(session.startedAt)}.txt`
      );
    }
  }, [session, sessions]);

  if (!session && (!sessions || sessions.length === 0)) return null;

  if (compact) {
    return (
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brown-400 hover:text-brown-600 text-xs font-medium transition-colors"
        title="Exporter la session"
        aria-label="Exporter la session en fichier texte"
      >
        <DownloadIcon size={13} />
        {!compact && <span>{label ?? "Exporter"}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 btn-secondary text-xs py-1.5 px-3"
      title="Exporter en .txt"
      aria-label="Exporter la session en fichier texte"
    >
      <DownloadIcon size={13} />
      <span>{label ?? "Exporter (.txt)"}</span>
    </button>
  );
}
