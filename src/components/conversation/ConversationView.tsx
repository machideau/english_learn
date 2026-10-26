"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface ConversationViewProps {
  messages: ChatMessage[];
  onReplay?: (audioUrl: string) => void;
  onAddToSRS?: (word: string, definition: string, phonetic?: string) => void;
  isTyping?: boolean;
}

export function ConversationView({
  messages,
  onReplay,
  onAddToSRS,
  isTyping,
}: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Historique de la conversation"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-terracotta-100 border border-terracotta-200 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c4512e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-brown-500">
              Appuyez sur le microphone pour commencer
            </p>
            <p className="text-xs text-brown-300 mt-1">ou tapez un message ci-dessous</p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={`${msg.role}-${msg.timestamp}`}
          message={msg}
          onReplay={onReplay}
          onAddToSRS={onAddToSRS}
        />
      ))}

      {/* Indicateur de frappe */}
      {isTyping && (
        <div className="flex items-end gap-2 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-terracotta-400 text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-sm">
            AI
          </div>
          <div
            className="bg-cream-50 border border-cream-200 rounded-2xl rounded-bl-sm px-4 py-3"
            style={{ boxShadow: "0 1px 3px rgba(44,26,14,0.05)" }}
          >
            <div className="flex gap-[4px] items-end h-5">
              {([0, 0.18, 0.36] as const).map((delay, i) => (
                <span
                  key={i}
                  className="wave-bar"
                  style={{
                    height: 10,
                    animationDelay: `${delay}s`,
                    background: "#a67c5b",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden />
    </div>
  );
}
