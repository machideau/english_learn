"use client";
import { XIcon } from "./Icons";

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-terracotta-50 border border-terracotta-100 rounded-lg px-4 py-3 animate-fade-in"
    >
      {/* Trait accent */}
      <div className="shrink-0 mt-0.5 w-0.5 self-stretch rounded-full bg-terracotta-400" />
      <p className="flex-1 text-sm text-terracotta-600 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Fermer le message d'erreur"
          className="shrink-0 text-terracotta-300 hover:text-terracotta-500 transition-colors mt-0.5"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}
