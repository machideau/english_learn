"use client";
import { useState, useRef } from "react";

interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TextInput({
  onSend,
  disabled,
  placeholder = "Ou tapez en anglais…",
}: TextInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-white rounded-full border border-cream-300 shadow-sm px-3 py-1.5 focus-within:border-terracotta-400 focus-within:ring-2 focus-within:ring-terracotta-100 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent text-brown-700 text-sm placeholder-brown-300 resize-none leading-relaxed focus:outline-none px-2 py-1"
          aria-label="Saisie texte en anglais"
          style={{ minHeight: "28px", maxHeight: "100px" }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-8 h-8 rounded-full bg-terracotta-500 hover:bg-terracotta-600 active:scale-95 text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          aria-label="Envoyer le message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

