"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { AVATARS, DEEPGRAM_VOICES } from "@/lib/avatars-voices";
import type { AvatarConfig, VoiceConfig } from "@/lib/avatars-voices";
import { XIcon } from "@/components/ui/Icons";

interface AvatarVoiceSelectorProps {
  avatarId: string;
  voiceId: string;
  onAvatarChange: (avatar: AvatarConfig) => void;
  onVoiceChange: (voice: VoiceConfig) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function AvatarVoiceSelector({
  avatarId,
  voiceId,
  onAvatarChange,
  onVoiceChange,
  onClose,
  disabled,
}: AvatarVoiceSelectorProps) {
  const [tab, setTab] = useState<"avatar" | "voice">("avatar");
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const femaleVoices = DEEPGRAM_VOICES.filter((v) => v.gender === "F");
  const maleVoices = DEEPGRAM_VOICES.filter((v) => v.gender === "M");
  const femaleAvatars = AVATARS.filter((a) => a.body === "F");
  const maleAvatars = AVATARS.filter((a) => a.body === "M");

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPreviewingVoiceId(null);
    setLoadingVoiceId(null);
  }, []);

  // Arrêter l'aperçu si on change d'onglet ou qu'on démonte le composant
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview, tab]);

  const handleClose = () => {
    stopPreview();
    onClose();
  };

  const handleTogglePreview = async (voice: VoiceConfig) => {
    if (previewingVoiceId === voice.id || loadingVoiceId === voice.id) {
      stopPreview();
      return;
    }

    stopPreview();
    setLoadingVoiceId(voice.id);

    const sampleText = `Hello! I'm ${voice.label}. Ready to practice English together?`;

    // 1. Audio déjà en cache mémoire ?
    const cachedUrl = audioCacheRef.current.get(voice.id);
    if (cachedUrl) {
      setLoadingVoiceId(null);
      setPreviewingVoiceId(voice.id);
      const audio = new Audio(cachedUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setPreviewingVoiceId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPreviewingVoiceId(null);
        audioRef.current = null;
      };
      audio.play().catch(() => {
        setPreviewingVoiceId(null);
      });
      return;
    }

    // 2. Appel TTS vers l'API /api/speak
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText, voice: voice.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const dataUrl = `data:${data.mimeType || "audio/mp3"};base64,${data.audioBase64}`;
          audioCacheRef.current.set(voice.id, dataUrl);
          setLoadingVoiceId(null);
          setPreviewingVoiceId(voice.id);

          const audio = new Audio(dataUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setPreviewingVoiceId(null);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setPreviewingVoiceId(null);
            audioRef.current = null;
          };
          await audio.play();
          return;
        }
      }
    } catch {
      // Ignorer l'erreur réseau et passer au fallback SpeechSynthesis
    }

    // 3. Fallback Web Speech Synthesis du navigateur
    setLoadingVoiceId(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setPreviewingVoiceId(voice.id);
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(sampleText);
      utt.lang = voice.accent === "British" ? "en-GB" : "en-US";
      utt.pitch = voice.gender === "M" ? 0.85 : 1.05;
      utt.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(
        (v) => v.lang.startsWith(utt.lang.slice(0, 5)) || v.lang.startsWith("en")
      );
      if (matched) utt.voice = matched;

      utt.onend = () => {
        setPreviewingVoiceId(null);
      };
      utt.onerror = () => {
        setPreviewingVoiceId(null);
      };
      window.speechSynthesis.speak(utt);
    } else {
      setPreviewingVoiceId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Personnaliser l'avatar et la voix"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brown-700/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full sm:max-w-lg bg-cream-50 sm:rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cream-200 bg-cream-100/70 shrink-0">
          <h2 className="text-sm font-semibold text-brown-700">Personnaliser</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 hover:bg-cream-200 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-1 p-2 bg-cream-100/60 border-b border-cream-200 shrink-0">
          {(["avatar", "voice"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                stopPreview();
                setTab(t);
              }}
              className={[
                "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
                tab === t
                  ? "bg-white text-brown-700 shadow-sm"
                  : "text-brown-400 hover:text-brown-600",
              ].join(" ")}
            >
              {t === "avatar" ? "Avatar" : "Voix"}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "avatar" && (
            <div className="space-y-4">
              {[
                { label: "Avatars féminins", avatars: femaleAvatars },
                { label: "Avatars masculins", avatars: maleAvatars },
              ].map(({ label, avatars }) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold text-brown-300 uppercase tracking-widest mb-2">
                    {label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {avatars.map((avatar) => {
                      const selected = avatar.id === avatarId;
                      return (
                        <button
                          key={avatar.id}
                          onClick={() => {
                            if (!disabled) {
                              onAvatarChange(avatar);
                              handleClose();
                            }
                          }}
                          disabled={disabled}
                          className={[
                            "relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-left",
                            selected
                              ? "border-terracotta-400 bg-terracotta-50 shadow-sm"
                              : "border-cream-200 bg-cream-50 hover:border-terracotta-200 hover:bg-cream-100",
                            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                          ].join(" ")}
                          aria-pressed={selected}
                          aria-label={`Sélectionner l'avatar ${avatar.label}`}
                        >
                          {/* Silhouette avatar */}
                          <div
                            className={[
                              "w-14 h-18 rounded-xl flex items-center justify-center",
                              avatar.body === "F" ? "bg-terracotta-100" : "bg-sage-100",
                            ].join(" ")}
                          >
                            <svg
                              width="36"
                              height="48"
                              viewBox="0 0 40 56"
                              fill="none"
                              aria-hidden="true"
                            >
                              <ellipse
                                cx="20"
                                cy="16"
                                rx="11"
                                ry="13"
                                fill={avatar.body === "F" ? "#c4512e" : "#5d6d5a"}
                                opacity="0.5"
                              />
                              <path
                                d={
                                  avatar.body === "F"
                                    ? "M6 56 C6 38 10 33 20 31 C30 33 34 38 34 56"
                                    : "M4 56 C4 38 8 33 20 31 C32 33 36 38 36 56"
                                }
                                fill={avatar.body === "F" ? "#c4512e" : "#5d6d5a"}
                                opacity="0.5"
                              />
                            </svg>
                          </div>

                          <div className="text-center w-full">
                            <p className="text-sm font-semibold text-brown-600 truncate">{avatar.label}</p>
                            <p className="text-[11px] text-brown-300 mt-0.5 truncate">{avatar.description}</p>
                          </div>

                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <polyline
                                  points="2,5 4,7.5 8,2.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "voice" && (
            <div className="space-y-4">
              {[
                { label: "Voix féminines", voices: femaleVoices },
                { label: "Voix masculines", voices: maleVoices },
              ].map(({ label, voices }) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold text-brown-300 uppercase tracking-widest mb-2">
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {voices.map((voice) => {
                      const selected = voice.id === voiceId;
                      const isPlaying = previewingVoiceId === voice.id;
                      const isLoading = loadingVoiceId === voice.id;

                      return (
                        <div
                          key={voice.id}
                          className={[
                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all",
                            selected
                              ? "border-terracotta-300 bg-terracotta-50"
                              : "border-cream-200 bg-cream-50 hover:border-terracotta-200 hover:bg-cream-100",
                            disabled ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {/* Zone de sélection de la voix */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!disabled) {
                                stopPreview();
                                onVoiceChange(voice);
                                handleClose();
                              }
                            }}
                            disabled={disabled}
                            className="flex-1 flex items-center gap-3 text-left focus:outline-none min-w-0"
                            aria-pressed={selected}
                            aria-label={`Sélectionner la voix ${voice.label}`}
                          >
                            {/* Genre badge */}
                            <div
                              className={[
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                voice.gender === "F"
                                  ? "bg-terracotta-100 text-terracotta-600"
                                  : "bg-sage-100 text-brown-500",
                              ].join(" ")}
                            >
                              {voice.gender}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-brown-600 truncate">
                                  {voice.label}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-cream-200 rounded text-brown-400 font-medium shrink-0">
                                  {voice.accent}
                                </span>
                              </div>
                              <p className="text-[11px] text-brown-300 truncate">
                                {voice.description}
                              </p>
                            </div>
                          </button>

                          {/* Bouton d'aperçu audio + coche si sélectionné */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePreview(voice);
                              }}
                              disabled={disabled}
                              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                                isPlaying
                                  ? "bg-terracotta-500 text-white border-terracotta-600 shadow-sm animate-pulse"
                                  : isLoading
                                  ? "bg-cream-200 text-brown-400 border-cream-300 cursor-wait"
                                  : "bg-white text-brown-500 border-cream-200 hover:border-terracotta-300 hover:text-terracotta-600 shadow-subtle"
                              }`}
                              aria-label={
                                isPlaying
                                  ? `Arrêter l'écoute de ${voice.label}`
                                  : `Écouter un extrait de la voix ${voice.label}`
                              }
                              title={isPlaying ? "Arrêter l'extrait" : "Écouter un extrait"}
                            >
                              {isLoading ? (
                                <svg
                                  className="animate-spin w-3.5 h-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                              ) : isPlaying ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <rect x="6" y="5" width="4" height="14" rx="1" />
                                  <rect x="14" y="5" width="4" height="14" rx="1" />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              )}
                            </button>

                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center shrink-0">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                  <polyline
                                    points="2,5 4,7.5 8,2.5"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p className="text-[11px] text-brown-200 pt-2 border-t border-cream-200">
                Voix fournies par Deepgram Aura 2 via OpenRouter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
