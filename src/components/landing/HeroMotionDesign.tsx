"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MicIcon,
  SparklesIcon,
  VolumeIcon,
  CheckIcon,
  RefreshIcon,
  PlayIcon,
  BookIcon,
} from "@/components/ui/Icons";

interface StepConfig {
  id: number;
  label: string;
  durationMs: number;
}

const STEPS: StepConfig[] = [
  { id: 0, label: "1. Vous parlez", durationMs: 3200 },
  { id: 1, label: "2. Correction IA", durationMs: 2800 },
  { id: 2, label: "3. Réponse avatar", durationMs: 3400 },
  { id: 3, label: "4. Flashcard SRS", durationMs: 3000 },
];

export function HeroMotionDesign() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Soundwave animation bars
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 18, 30, 22, 14, 28, 16]);

  // Audio wave variation during speaking phases
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (activeStep === 0 || activeStep === 2) {
        setWaveHeights([
          10 + Math.random() * 24,
          14 + Math.random() * 28,
          8 + Math.random() * 22,
          18 + Math.random() * 26,
          12 + Math.random() * 30,
          16 + Math.random() * 24,
          8 + Math.random() * 20,
          14 + Math.random() * 26,
        ]);
      } else {
        setWaveHeights([6, 8, 7, 8, 7, 6, 8, 6]);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [activeStep, isPlaying]);

  // Step advancement timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const currentDuration = STEPS[activeStep].durationMs;
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / currentDuration) * 100);
      setProgress(currentProgress);

      if (elapsed >= currentDuration) {
        setActiveStep((prev) => (prev + 1) % STEPS.length);
        setProgress(0);
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeStep, isPlaying]);

  const goToStep = useCallback((idx: number) => {
    setActiveStep(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Ambient Floating Glows ── */}
      <div
        className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-tr from-terracotta-400/25 to-amber-300/20 blur-3xl pointer-events-none -z-10 animate-pulse"
        style={{ animationDuration: "6s" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-bl from-emerald-300/20 to-terracotta-300/20 blur-3xl pointer-events-none -z-10 animate-pulse"
        style={{ animationDuration: "8s" }}
        aria-hidden="true"
      />

      {/* ── Floating Motion Badges (Decorative Motion Design) ── */}
      <div
        className="hidden md:flex absolute -bottom-4 -right-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-terracotta-200/70 shadow-lg text-[11px] font-semibold text-terracotta-700 transition-transform duration-500 hover:scale-105"
        style={{
          transform: isHovered ? "translateY(4px)" : "translateY(0px)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <SparklesIcon size={14} className="text-terracotta-500" />
        <span>Répétition espacée SRS intégrée</span>
      </div>

      {/* ── Main Mockup Window ── */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-cream-300/80 bg-cream-50/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-terracotta-300/80 hover:shadow-terracotta-500/5">
        {/* macOS style Window Header */}
        <div className="bg-gradient-to-r from-cream-100/90 via-cream-50/80 to-cream-100/90 border-b border-cream-200 px-4 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 hover:bg-amber-500 transition-colors cursor-pointer" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-3 px-2.5 py-0.5 rounded-full bg-white/70 border border-cream-200 text-[10px] text-brown-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session active · Niveau B2 Intermédiaire</span>
            </div>
          </div>

          {/* Controller button & status */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-brown-600 bg-white/80 hover:bg-white border border-cream-200 transition-all active:scale-95 shadow-xs"
              title={isPlaying ? "Mettre en pause la démo" : "Reprendre la démo"}
            >
              {isPlaying ? (
                <>
                  <span className="inline-block w-1.5 h-2.5 bg-terracotta-500 rounded-[1px]" />
                  <span className="inline-block w-1.5 h-2.5 bg-terracotta-500 rounded-[1px]" />
                  <span className="text-[10px] text-brown-400 ml-0.5">Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon size={11} className="text-terracotta-500 fill-terracotta-500" />
                  <span className="text-[10px] text-brown-400 ml-0.5">Lire</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-terracotta-600 font-bold bg-terracotta-50 border border-terracotta-200/60 px-2 py-0.5 rounded-md">
              00:{activeStep === 0 ? "03" : activeStep === 1 ? "06" : activeStep === 2 ? "09" : "12"}
            </span>
          </div>
        </div>

        {/* ── Cockpit Body : 2 Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] sm:min-h-[410px]">
          {/* Left Column (5 cols): 3D Avatar Stage & Audio Visualizer */}
          <div className="md:col-span-5 bg-gradient-to-b from-cream-100/90 to-cream-200/50 p-6 flex flex-col items-center justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-cream-200/80">
            {/* Ambient Avatar Spotlight */}
            <div
              className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
                activeStep === 2
                  ? "bg-terracotta-400/30 scale-125"
                  : activeStep === 0
                  ? "bg-emerald-400/20 scale-110"
                  : "bg-terracotta-200/20 scale-100"
              }`}
            />

            {/* Avatar Pill tag */}
            <div className="w-full flex justify-between items-center z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-cream-200 text-[11px] font-semibold text-brown-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sarah · British RP
              </span>
              <span className="text-[10px] font-mono text-brown-400 bg-cream-200/60 px-2 py-0.5 rounded">
                {activeStep === 2 ? "L'avatar parle..." : activeStep === 0 ? "À vous..." : "Analyse..."}
              </span>
            </div>

            {/* Avatar 3D Stage — vrai avatar Three.js lazy-loaded */}
            <div className="relative my-4 flex flex-col items-center justify-center">
              {/* Audio ripples when avatar is speaking */}
              {activeStep === 2 && (
                <>
                  <div
                    className="absolute inset-0 -m-4 rounded-3xl border-2 border-terracotta-400/40 animate-ping pointer-events-none"
                    style={{ animationDuration: "2s" }}
                  />
                  <div
                    className="absolute inset-0 -m-8 rounded-3xl border border-terracotta-300/30 animate-pulse pointer-events-none"
                    style={{ animationDuration: "1.4s" }}
                  />
                </>
              )}

              {/* Avatar Illustration with subtle continuous breathing motion */}
              <div
                className={`relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl bg-gradient-to-b from-terracotta-100 via-cream-100 to-terracotta-200/50 border-2 border-terracotta-200 flex items-end justify-center overflow-hidden shadow-card transition-transform duration-500 ${
                  activeStep === 2 ? "scale-105 border-terracotta-400" : "scale-100"
                }`}
                style={{
                  animation: "hero-breathing 4s ease-in-out infinite",
                }}
              >
                {/* 3D-styled stylized avatar silhouette */}
                <svg width="100" height="135" viewBox="0 0 80 112" fill="none" aria-hidden="true" className="transition-transform duration-300">
                  <ellipse cx="40" cy="30" rx="22" ry="26" fill="#c4512e" opacity="0.5" />
                  <ellipse cx="40" cy="32" rx="18" ry="22" fill="#df6b45" opacity="0.75" />
                  {/* Subtle hair shape */}
                  <path d="M22 28 C22 14 30 8 40 8 C50 8 58 14 58 28 C58 20 48 16 40 16 C32 16 22 20 22 28 Z" fill="#933618" />
                  {/* Shoulders and chest */}
                  <path d="M12 112 C12 78 22 68 40 64 C58 68 68 78 68 112" fill="#c4512e" opacity="0.85" />
                  <path d="M22 112 C22 84 28 74 40 70 C52 74 58 84 58 112" fill="#e8825a" opacity="0.6" />
                </svg>

                {/* Live soundwave overlay on the avatar chest */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-cream-200">
                  {waveHeights.slice(0, 5).map((h, i) => (
                    <span
                      key={i}
                      className="inline-block w-1 rounded-full bg-terracotta-500 transition-all duration-100"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mic / Live Audio status controls */}
            <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-cream-200/70">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeStep === 0
                      ? "bg-terracotta-500 text-white shadow-mic scale-110"
                      : "bg-white text-brown-500 border border-cream-300"
                  }`}
                >
                  <MicIcon size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-brown-700">
                    {activeStep === 0 ? "Microphone actif" : "Microphone prêt"}
                  </div>
                  <div className="text-[9px] text-brown-400">
                    {activeStep === 0 ? "Détection automatique" : "Cliquez ou parlez"}
                  </div>
                </div>
              </div>

              {/* Dynamic waveform visualizer */}
              <div className="flex items-end gap-[2px] h-6 px-2 py-1 rounded-md bg-white/70 border border-cream-200" aria-hidden="true">
                {waveHeights.map((h, i) => (
                  <span
                    key={i}
                    className={`inline-block w-[3px] rounded-full transition-all duration-100 ${
                      activeStep === 0
                        ? "bg-emerald-500"
                        : activeStep === 2
                        ? "bg-terracotta-500"
                        : "bg-brown-300"
                    }`}
                    style={{ height: `${Math.max(4, h)}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Dynamic Motion Design Conversation */}
          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-white/50 backdrop-blur-sm relative overflow-hidden">
            {/* Top header within right column */}
            <div className="flex items-center justify-between pb-3 border-b border-cream-200/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brown-800">Transcription & Analyse</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cream-100 text-brown-600 border border-cream-200">
                  Temps réel
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <CheckIcon size={12} />
                <span>IA connectée</span>
              </div>
            </div>

            {/* Conversation Flow Area */}
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {/* 1. User Message (Appears smoothly at Step 0, transforms at Step 1) */}
              <div
                className={`flex justify-end transition-all duration-500 ${
                  activeStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
              >
                <div className="bg-terracotta-500 text-white rounded-2xl rounded-br-xs px-4 py-3 max-w-[90%] shadow-sm relative group">
                  <div className="text-[10px] text-terracotta-100 font-semibold mb-1 flex items-center justify-between gap-4">
                    <span>Vous (oral)</span>
                    <span className="text-[9px] opacity-80">14:22</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    Yesterday I{" "}
                    {activeStep === 0 ? (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-bold underline decoration-amber-300 decoration-2">
                        go
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded">
                        <span className="line-through text-red-200 opacity-90">go</span>
                        <span className="text-emerald-200 font-bold bg-emerald-900/40 px-1 rounded">went</span>
                      </span>
                    )}{" "}
                    to the museum in London!
                  </p>
                </div>
              </div>

              {/* 2. Instant Neural Grammar Correction Box (Triggers at Step 1) */}
              <div
                className={`transition-all duration-500 ${
                  activeStep >= 1 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <div className="bg-gradient-to-r from-cream-100 via-amber-50/50 to-cream-100 border border-amber-200/80 rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[11px] font-bold text-amber-900">Grammaire · Passé simple</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Score : 94%
                    </span>
                  </div>
                  <p className="text-xs text-brown-600 leading-relaxed">
                    Utilisez le prétérit irrégulier <strong className="text-emerald-700 font-bold">went</strong> au lieu de <span className="line-through text-red-500">go</span> pour une action passée terminée.
                  </p>
                </div>
              </div>

              {/* 3. AI Tutor Response (Triggers at Step 2) */}
              <div
                className={`flex items-start gap-2.5 transition-all duration-500 ${
                  activeStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-terracotta-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  AI
                </div>
                <div className="bg-white border border-cream-300/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs sm:text-sm text-brown-700 shadow-sm leading-relaxed max-w-[88%]">
                  <div className="flex items-center justify-between text-[10px] text-brown-400 mb-1">
                    <span className="font-semibold text-terracotta-600">Sarah (Tuteur)</span>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-brown-400 hover:text-brown-700 transition-colors"
                      aria-label="Écouter la prononciation"
                    >
                      <VolumeIcon size={12} />
                      <span>Audio</span>
                    </button>
                  </div>
                  <p>
                    That sounds wonderful! Did you visit the Rosetta Stone room, or did you explore the Egyptian mummies?
                  </p>
                </div>
              </div>

              {/* 4. Smart SRS Flashcard Generated with Pop-in (Triggers at Step 3) */}
              <div
                className={`transition-all duration-500 ${
                  activeStep === 3
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                }`}
              >
                <div className="bg-gradient-to-r from-emerald-50 to-cream-100 border-2 border-emerald-300 rounded-xl p-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookIcon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brown-800">Flashcard mémorisée</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                          SRS +15 XP
                        </span>
                      </div>
                      <p className="text-[11px] text-brown-500 mt-0.5">
                        <strong className="text-brown-700 font-semibold">go → went</strong> (passé simple) · Révision prévue demain
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                    Sauvegardée
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Timeline Step Switcher (Interactive Motion Controls) */}
            <div className="pt-4 mt-2 border-t border-cream-200/80">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {STEPS.map((s, idx) => {
                  const isActive = activeStep === idx;
                  const isPast = activeStep > idx;

                  return (
                    <button
                      key={s.id}
                      onClick={() => goToStep(idx)}
                      className={`text-left p-2 rounded-lg transition-all relative overflow-hidden group ${
                        isActive
                          ? "bg-terracotta-50 border border-terracotta-300 shadow-xs"
                          : "hover:bg-cream-100/80 border border-transparent"
                      }`}
                    >
                      {/* Active Step Progress Fill Bar */}
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 h-[2.5px] bg-terracotta-500 transition-all duration-75"
                          style={{ width: `${progress}%` }}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] sm:text-xs font-bold block truncate ${
                            isActive
                              ? "text-terracotta-600 font-extrabold"
                              : isPast
                              ? "text-brown-600"
                              : "text-brown-400"
                          }`}
                        >
                          {s.label}
                        </span>
                        {isPast && (
                          <span className="text-emerald-500 shrink-0">
                            <CheckIcon size={11} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
