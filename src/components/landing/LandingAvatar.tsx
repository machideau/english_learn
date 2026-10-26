"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import type { AvatarHandle } from "@/components/avatar/AvatarCanvas";

// Lazy-load du vrai AvatarCanvas (Three.js + talkinghead.mjs)
const AvatarCanvas = dynamic(
  () => import("@/components/avatar/AvatarCanvas"),
  {
    ssr: false,
    loading: () => <AvatarPlaceholder />,
  }
);

// ── Placeholder SVG (affiché pendant le chargement de Three.js) ──────────────
function AvatarPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-cream-100 to-cream-200/80">
      <svg width="90" height="120" viewBox="0 0 80 112" fill="none" aria-hidden="true" className="opacity-30">
        <ellipse cx="40" cy="30" rx="22" ry="26" fill="#c4512e" opacity="0.5" />
        <ellipse cx="40" cy="32" rx="18" ry="22" fill="#df6b45" opacity="0.75" />
        <path d="M22 28 C22 14 30 8 40 8 C50 8 58 14 58 28 C58 20 48 16 40 16 C32 16 22 20 22 28 Z" fill="#933618" />
        <path d="M12 112 C12 78 22 68 40 64 C58 68 68 78 68 112" fill="#c4512e" opacity="0.85" />
      </svg>
      <div className="h-0.5 w-20 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta-300 rounded-full"
          style={{ width: "60%", animation: "shimmer 1.6s ease-in-out infinite" }}
        />
      </div>
      <p className="text-[10px] text-brown-300 tracking-wide font-medium">Chargement de l'avatar 3D…</p>
    </div>
  );
}

export interface LandingAvatarHandle extends AvatarHandle {
  isReady: boolean;
}

interface LandingAvatarProps {
  className?: string;
  onReady?: () => void;
}

/**
 * Avatar 3D pour la landing page.
 * - Lazy-load différé : l'avatar ne se charge que quand l'élément
 *   entre dans le viewport (IntersectionObserver).
 * - Placeholder SVG affiché pendant le chargement.
 * - Une fois prêt, fondu vers le canvas 3D.
 */
export const LandingAvatar = forwardRef<LandingAvatarHandle, LandingAvatarProps>(
  function LandingAvatar({ className = "", onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<AvatarHandle>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // ── Déclencher le chargement quand l'élément entre dans le viewport ──
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      if (typeof IntersectionObserver === "undefined") {
        setShouldLoad(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin: "100px" }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // ── Propager le ref vers le parent (HeroMotionDesign) ──
    useImperativeHandle(
      ref,
      () => ({
        isReady: loaded,
        speak: (text: string, audioBase64?: string, mimeType?: string) => {
          return avatarRef.current?.speak(text, audioBase64, mimeType) ?? Promise.resolve();
        },
        stopSpeaking: () => {
          avatarRef.current?.stopSpeaking();
        },
        setEmotion: (emotion: "neutral" | "happy" | "thinking") => {
          avatarRef.current?.setEmotion(emotion);
        },
      }),
      [loaded]
    );

    return (
      <div
        ref={containerRef}
        className={`relative ${className}`}
        aria-label="Avatar 3D du tuteur d'anglais"
      >
        {/* Placeholder visible jusqu'à ce que l'avatar soit chargé */}
        {!loaded && <AvatarPlaceholder />}

        {/* Canvas 3D — chargé en lazy, fondu une fois prêt */}
        {shouldLoad && (
          <div
            className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <AvatarCanvas
              ref={avatarRef}
              className="w-full h-full"
              onSpeakStart={() => {}}
              onSpeakEnd={() => {}}
              avatarUrl="/talkinghead/brunette.glb"
              avatarBody="F"
            />
          </div>
        )}
      </div>
    );
  }
);
