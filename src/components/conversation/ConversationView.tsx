"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface ConversationViewProps {
  messages: ChatMessage[];
  onReplay?: (audioUrl: string) => void;
  isTyping?: boolean;
}

export function ConversationView({
  messages,
  onReplay,
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
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-10 h-px bg-cream-200" />
          <p className="text-sm text-brown-200 text-center leading-relaxed">
            Appuyez sur le microphone pour commencer
            <br />
            <span className="text-xs text-brown-100">ou tapez ci-dessous</span>
          </p>
          <div className="w-10 h-px bg-cream-200" />
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={`${msg.role}-${msg.timestamp}`}
          message={msg}
          onReplay={onReplay}
        />
      ))}

      {/* Indicateur de frappe */}
      {isTyping && (
        <div className="flex items-start animate-fade-in">
          <div
            className="bg-cream-50 border border-cream-200 rounded-2xl rounded-bl-sm px-4 py-3"
            style={{ boxShadow: "0 1px 3px rgba(44,26,14,0.05)" }}
          >
            <div className="flex gap-1.5 items-center h-4">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-brown-200 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
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
