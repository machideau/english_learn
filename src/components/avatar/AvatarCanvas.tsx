"use client";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

export interface AvatarHandle {
  speak: (text: string, audioBase64?: string, mimeType?: string) => Promise<void>;
  stopSpeaking: () => void;
  setEmotion: (emotion: "neutral" | "happy" | "thinking") => void;
}

interface AvatarCanvasProps {
  className?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  subtitle?: string;
  avatarUrl?: string;
  avatarBody?: "M" | "F";
  avatarMood?: string;
  voiceLang?: string;
  voiceMale?: boolean;
}

const DEFAULT_AVATAR_URL = "/talkinghead/brunette.glb";
const TALKING_HEAD_MODULE = "/talkinghead/talkinghead.mjs";

function AvatarPlaceholder({ loading }: { loading: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-cream-100 to-cream-200">
      <svg width="72" height="88" viewBox="0 0 72 88" fill="none" aria-hidden="true" className="opacity-30">
        <ellipse cx="36" cy="28" rx="20" ry="22" fill="#a67c5b" />
        <path d="M14 88 C14 65 20 58 36 56 C52 58 58 65 58 88" fill="#a67c5b" />
      </svg>
      {loading && (
        <div className="flex flex-col items-center gap-2">
          <div className="h-0.5 w-24 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brown-200 rounded-full"
              style={{ width: "50%", animation: "shimmer 1.6s ease-in-out infinite" }}
            />
          </div>
          <p className="text-xs text-brown-200 tracking-wide">Chargement de l'avatar…</p>
        </div>
      )}
    </div>
  );
}

/**
 * Découpe le texte en mots et calcule des timings proportionnels
 * sur la durée totale de l'audio.
 * Retourne { words, wtimes, wdurations } attendus par speakAudio().
 */
function buildWordTimings(text: string, durationMs: number) {
  const raw = text.trim().split(/\s+/).filter(Boolean);
  if (raw.length === 0) return { words: [], wtimes: [], wdurations: [] };

  // Pondération par longueur de mot (un mot plus long prend plus de temps)
  const lengths = raw.map((w) => Math.max(w.replace(/[^a-zA-Z]/g, "").length, 1));
  const total = lengths.reduce((a, b) => a + b, 0);

  const words: string[] = [];
  const wtimes: number[] = [];
  const wdurations: number[] = [];

  let cursor = 0;
  for (let i = 0; i < raw.length; i++) {
    const dur = (lengths[i] / total) * durationMs;
    words.push(raw[i]);
    wtimes.push(cursor);
    wdurations.push(dur);
    cursor += dur;
  }

  return { words, wtimes, wdurations };
}

export const AvatarCanvas = forwardRef<AvatarHandle, AvatarCanvasProps>(
  function AvatarCanvas({
    className,
    onSpeakStart,
    onSpeakEnd,
    subtitle,
    avatarUrl = DEFAULT_AVATAR_URL,
    avatarBody = "F",
    avatarMood = "neutral",
    voiceLang = "en-US",
  }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headRef = useRef<any>(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentHead: any = null;

      async function init() {
        if (!containerRef.current) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mod = (await import(/* webpackIgnore: true */ TALKING_HEAD_MODULE)) as any;
          const { TalkingHead } = mod;

          if (cancelled || !containerRef.current) return;

          if (containerRef.current.clientHeight === 0) {
            await new Promise((r) => requestAnimationFrame(r));
            if (cancelled || !containerRef.current) return;
          }

          containerRef.current.innerHTML = "";

          const head = new TalkingHead(containerRef.current, {
            ttsEndpoint: null,
            ttsLang: "en-US",
            lipsyncLang: "en",
            lipsyncModules: ["en"],
            cameraView: "upper",
            cameraRotateEnable: false,
            cameraPanEnable: false,
            cameraZoomEnable: false,
            lightAmbientColor: 0xfff5e4,
            lightAmbientIntensity: 2.2,
            lightDirectColor: 0xfff8f0,
            lightDirectIntensity: 1.6,
            lightDirectPhi: 0.1,
            lightDirectTheta: 0.4,
            avatarMood: "neutral",
            avatarIdleEyeContact: 0.3,
            avatarIdleHeadMove: 0.4,
            avatarSpeakingEyeContact: 0.6,
          });

          currentHead = head;
          await head.showAvatar({ url: avatarUrl, body: avatarBody, avatarMood });

          if (cancelled) {
            try { head.stop?.(); } catch { /* ignore */ }
            return;
          }
          headRef.current = head;
          setLoaded(true);
        } catch (err) {
          if (!cancelled) {
            console.error("[AvatarCanvas]", err);
            const msg = err instanceof Error ? err.message : String(err);
            setError(`Avatar 3D indisponible (${msg.slice(0, 80)}). La conversation reste active.`);
          }
        }
      }

      init();
      return () => {
        cancelled = true;
        if (currentHead) { try { currentHead.stop?.(); } catch { /* ignore */ } }
        if (headRef.current) {
          try { headRef.current.stop?.(); } catch { /* ignore */ }
          headRef.current = null;
        }
      };
    }, [avatarUrl, avatarBody, avatarMood, voiceLang]);

    const speak = useCallback(
      async (text: string, audioBase64?: string, mimeType?: string) => {
        if (!headRef.current) return;
        onSpeakStart?.();

        const head = headRef.current;
        const TIMEOUT_MS = 60_000;

        try {
          // Résumer l'AudioContext (nécessaire après politique autoplay du navigateur)
          const ctx: AudioContext | undefined = head.audioCtx;
          if (ctx && ctx.state !== "running") {
            try { await ctx.resume(); } catch (e) {
              console.warn("[AvatarCanvas] audioCtx.resume failed:", e);
            }
          }

          if (audioBase64 && mimeType && ctx) {
            // ── Décoder le MP3 en AudioBuffer ──────────────────────────────────
            let audioBuffer: AudioBuffer | null = null;
            try {
              const binaryStr = atob(audioBase64);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
              audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
            } catch (e) {
              console.warn("[AvatarCanvas] decodeAudioData failed:", e);
            }

            if (audioBuffer) {
              // ── Calculer les timings de mots pour la lip-sync ─────────────────
              const durationMs = audioBuffer.duration * 1000;
              const { words, wtimes, wdurations } = buildWordTimings(text, durationMs);

              // speakAudio avec words+wtimes+wdurations → TalkingHead calcule les visèmes
              head.speakAudio(
                { audio: audioBuffer, words, wtimes, wdurations },
                { lipsyncLang: "en" }
              );

              // Attendre la fin via l'AudioBufferSourceNode de TalkingHead
              // On poll isSpeaking : plus fiable que de dépendre des callbacks internes
              await new Promise<void>((resolve) => {
                let resolved = false;
                const done = () => { if (!resolved) { resolved = true; resolve(); } };
                const timer = setTimeout(done, TIMEOUT_MS);

                // Laisser TalkingHead démarrer la lecture (léger délai asynchrone)
                setTimeout(() => {
                  const poll = setInterval(() => {
                    if (!head.isSpeaking && !head.isAudioPlaying) {
                      clearInterval(poll);
                      clearTimeout(timer);
                      done();
                    }
                  }, 150);
                }, 300);
              });

            } else {
              // Pas d'AudioBuffer : fallback HTMLAudio + speakText pour lip-sync
              await new Promise<void>((resolve) => {
                let resolved = false;
                const done = () => { if (!resolved) { resolved = true; resolve(); } };
                const timer = setTimeout(done, TIMEOUT_MS);

                const dataUrl = `data:${mimeType};base64,${audioBase64}`;
                const htmlAudio = new Audio(dataUrl);
                htmlAudio.onended = () => { clearTimeout(timer); done(); };
                htmlAudio.onerror = () => { clearTimeout(timer); done(); };
                htmlAudio.play()
                  .then(() => {
                    try { head.speakText(text, { avatarMute: true }, null, null); }
                    catch { /* ignore */ }
                  })
                  .catch(done);
              });
            }

          } else if (audioBase64 && mimeType) {
            // ctx inaccessible : HTMLAudio seul, pas de lip-sync
            await new Promise<void>((resolve) => {
              let resolved = false;
              const done = () => { if (!resolved) { resolved = true; resolve(); } };
              const timer = setTimeout(done, TIMEOUT_MS);
              const dataUrl = `data:${mimeType};base64,${audioBase64}`;
              const htmlAudio = new Audio(dataUrl);
              htmlAudio.onended = () => { clearTimeout(timer); done(); };
              htmlAudio.onerror = () => { clearTimeout(timer); done(); };
              htmlAudio.play().catch(done);
            });

          } else {
            // Aucun audio : lip-sync seule via speakText, poll sur isSpeaking
            await new Promise<void>((resolve) => {
              let resolved = false;
              const done = () => { if (!resolved) { resolved = true; resolve(); } };
              const timer = setTimeout(done, TIMEOUT_MS);
              try {
                head.speakText(text, null, null, null);
                setTimeout(() => {
                  const poll = setInterval(() => {
                    if (!head.isSpeaking) {
                      clearInterval(poll);
                      clearTimeout(timer);
                      done();
                    }
                  }, 150);
                }, 200);
              } catch {
                clearTimeout(timer);
                done();
              }
            });
          }
        } finally {
          onSpeakEnd?.();
        }
      },
      [onSpeakStart, onSpeakEnd]
    );

    const stopSpeaking = useCallback(() => {
      try { headRef.current?.stopSpeaking?.(); } catch { /* ignore */ }
    }, []);

    const setEmotion = useCallback(
      (emotion: "neutral" | "happy" | "thinking") => {
        if (!headRef.current) return;
        const map: Record<string, string> = { neutral: "neutral", happy: "happy", thinking: "sad" };
        try { headRef.current.setMood?.(map[emotion]); }
        catch (e) { console.warn("[AvatarCanvas] setMood failed:", e); }
      },
      []
    );

    useImperativeHandle(ref, () => ({ speak, stopSpeaking, setEmotion }), [
      speak, stopSpeaking, setEmotion,
    ]);

    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <div
          ref={containerRef}
          className="w-full h-full min-h-[160px]"
          style={{ minHeight: "160px" }}
          aria-label="Avatar 3D tuteur d'anglais"
        />

        {!loaded && !error && <AvatarPlaceholder loading />}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-cream-100 to-cream-200 p-6">
            <AvatarPlaceholder loading={false} />
            <p className="relative z-10 text-xs text-brown-300 text-center max-w-xs leading-relaxed mt-12">
              {error}
            </p>
          </div>
        )}

        {subtitle && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center px-3 z-10 animate-fade-in pointer-events-none">
            <p className="bg-brown-700/85 text-cream-50 text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl subtitle-text max-w-[90%] sm:max-w-md text-center leading-snug backdrop-blur-md border border-white/10 shadow-lift">
              {subtitle}
            </p>
          </div>
        )}

      </div>
    );
  }
);

export default AvatarCanvas;
