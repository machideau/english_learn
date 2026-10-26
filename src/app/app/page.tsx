"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

import { MicButton } from "@/components/ui/MicButton";
import { LevelSelector } from "@/components/ui/LevelSelector";
import { TopicSelector } from "@/components/ui/TopicSelector";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { PronunciationToast } from "@/components/ui/PronunciationToast";
import { AvatarVoiceSelector } from "@/components/ui/AvatarVoiceSelector";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { ExportButton } from "@/components/ui/ExportButton";
import { ConversationView } from "@/components/conversation/ConversationView";
import { TextInput } from "@/components/conversation/TextInput";
import { CorrectionCard } from "@/components/corrections/CorrectionCard";
import { FlashcardModal } from "@/components/flashcards/FlashcardModal";
import { SRSFlashcardModal } from "@/components/flashcards/SRSFlashcardModal";
import { ModeModal } from "@/components/modes/ModeModal";
import {
  CalendarIcon,
  MessageIcon,
  PencilIcon,
  CheckIcon,
  CardsIcon,
  MicIcon,
  RepeatIcon,
  HeadphonesIcon,
  FileEditIcon,
  GraduationIcon,
  MaskIcon,
  TrophyIcon,
  CompassIcon,
  ShareIcon,
  SparkleIcon,
} from "@/components/ui/Icons";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { RoleplayHeader } from "@/components/roleplay/RoleplayHeader";
import { RoleplaySelectorModal } from "@/components/roleplay/RoleplaySelectorModal";
import { RoleplayDebriefModal } from "@/components/roleplay/RoleplayDebriefModal";
import { PlacementTestModal } from "@/components/placement/PlacementTestModal";
import { RoadmapModal } from "@/components/roadmap/RoadmapModal";
import { ShareableScoreCard } from "@/components/social/ShareableScoreCard";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { useHandsFree } from "@/hooks/useHandsFree";
import { analyzeSpokenWords } from "@/lib/phonetic-analyzer";
import { saveCompletedStep } from "@/lib/learning-roadmap";
import type { RoleplayScenario, ShareCardData } from "@/types";

import { useMicrophone } from "@/hooks/useMicrophone";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSession } from "@/hooks/useSession";
import { useSRS } from "@/hooks/useSRS";
import { useStreak } from "@/hooks/useStreak";

import type { AvatarHandle } from "@/components/avatar/AvatarCanvas";
import type { AppMode, Level, MicState, ChatApiResponse, PronunciationScore, Correction } from "@/types";
import { getAvatar, getVoice, DEFAULT_AVATAR_ID, DEFAULT_VOICE_ID } from "@/lib/avatars-voices";
import type { AvatarConfig, VoiceConfig } from "@/lib/avatars-voices";

import { AudioWaveformVisualizer } from "@/components/audio/AudioWaveformVisualizer";
import { SpeechSpeedControl, type SpeechSpeed } from "@/components/audio/SpeechSpeedControl";
import { DailyGoalTracker } from "@/components/gamification/DailyGoalTracker";
import { playSuccessChime } from "@/lib/sound-effects";

const AvatarCanvas = dynamic(
  () => import("@/components/avatar/AvatarCanvas"),
  { ssr: false, loading: () => <div className="skeleton w-full h-full" /> }
);

// ── TTS côté client via Web Speech API ──────────────────────────────────────
function speakWithBrowser(
  text: string,
  lang = "en-US",
  wantMale = false,
  rate = 1.0
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = rate;
    utt.pitch = wantMale ? 0.85 : 1.05;

    // Choisir la voix la plus adaptée (langue + genre)
    const allVoices = window.speechSynthesis.getVoices();
    const langVoices = allVoices.filter((v) => v.lang.startsWith(lang.slice(0, 5)));
    const anyEn = allVoices.filter((v) => v.lang.startsWith("en"));
    const pool = langVoices.length > 0 ? langVoices : anyEn;
    const maleKw = ["male", "man", "david", "james", "daniel", "george", "thomas", "alex"];
    const femaleKw = ["female", "woman", "samantha", "victoria", "emma", "kate", "karen", "moira"];
    const scored = pool.map((v) => {
      const n = v.name.toLowerCase();
      const isMale = maleKw.some((k) => n.includes(k));
      const isFemale = femaleKw.some((k) => n.includes(k));
      let score = 0;
      if (wantMale && isMale) score += 2;
      if (!wantMale && isFemale) score += 2;
      if (!isMale && !isFemale) score += 1;
      return { v, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0]?.v ?? pool[0];
    if (best) utt.voice = best;

    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; resolve(); } };
    const timer = setTimeout(done, 30_000);
    utt.onend = () => { clearTimeout(timer); done(); };
    utt.onerror = () => { clearTimeout(timer); done(); };
    window.speechSynthesis.speak(utt);
  });
}

export default function HomePage() {
  const avatarRef = useRef<AvatarHandle>(null);

  // Transcription : Web Speech API (priorité) + fallback MediaRecorder+OpenRouter
  const speechRec = useSpeechRecognition();
  const mic = useMicrophone(); // fallback si Web Speech indisponible

  const { currentSession, sessions, startSession, addMessage, endSession } = useSession();
  const { cards: srsCards, dueCards, addCorrections: addSRSCards, addWordCard, reviewCard } = useSRS();
  const { streak, recordActivity, recordSession } = useStreak();

  const userMessagesCount = currentSession?.messages.filter((m) => m.role === "user").length ?? 0;
  const gamificationStats = {
    totalSessions: streak.totalSessions,
    totalMessages: streak.totalMessages,
    currentStreak: streak.currentStreak,
    totalSRSCards: srsCards.length,
    roleplaysDone: sessions.filter((s) => s.roleplay).length,
    dictationsPerfect: 1,
    todayMessages: userMessagesCount,
  };

  const [level, setLevel] = useState<Level>("intermédiaire");
  const [topic, setTopic] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [micButtonState, setMicButtonState] = useState<MicState>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [showCorrections, setShowCorrections] = useState(true);
  const [avatarSubtitle, setAvatarSubtitle] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [transcriptionMode, setTranscriptionMode] = useState<"webspeech" | "openrouter" | "unknown">("unknown");
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null);
  const [rightTab, setRightTab] = useState<"chat" | "corrections">("chat");
  const [mobileTab, setMobileTab] = useState<"studio" | "chat" | "corrections">("studio");
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isSRSOpen, setIsSRSOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(() => getAvatar(DEFAULT_AVATAR_ID));
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(() => getVoice(DEFAULT_VOICE_ID));
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeed>(1.0);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [activeMode, setActiveMode] = useState<AppMode>("conversation");
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  // ── Roleplay & Mises en situation ─────────────────────────────────────────
  const [activeRoleplay, setActiveRoleplay] = useState<RoleplayScenario | null>(null);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [isRoleplaySelectorOpen, setIsRoleplaySelectorOpen] = useState(false);
  const [isRoleplayDebriefOpen, setIsRoleplayDebriefOpen] = useState(false);

  // ── Placement Test & Roadmap ──────────────────────────────────────────────
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

  // ── Mode Mains Libres ─────────────────────────────────────────────────────
  const [isHandsFree, setIsHandsFree] = useState(false);

  // ── Carte Bilan Partageable ───────────────────────────────────────────────
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [shareCardData, setShareCardData] = useState<ShareCardData | null>(null);

  // ── Menu header drawer (actions secondaires) ──────────────────────────────
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  // ── Menu modes dans le dock ───────────────────────────────────────────────
  const [isModesMenuOpen, setIsModesMenuOpen] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setTranscriptionMode(SR ? "webspeech" : "openrouter");
  }, []);

  const ensureSession = useCallback(() => {
    if (!currentSession || currentSession.endedAt) {
      return startSession(level, topic || undefined);
    }
    return currentSession;
  }, [currentSession, startSession, level, topic]);

  // ── Envoi d'un message ────────────────────────────────────────────────────
  const handleUserMessage = useCallback(
    async (text: string) => {
      setError(null);
      const session = ensureSession();
      if (!sessionActive) setSessionActive(true);

      // Analyse mot-à-mot de la prononciation pour coloration
      const analyzed = analyzeSpokenWords(text);
      addMessage({ role: "user", content: text, analyzedWords: analyzed });

      setMicButtonState("processing");
      setIsTyping(true);
      avatarRef.current?.setEmotion("thinking");
      setAvatarSubtitle("Je réfléchis…");
      // Enregistrer l'activité pour le streak
      recordActivity();

      try {
        const history = session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history,
            userMessage: text,
            level,
            interfaceLanguage: "fr",
            topic: topic || undefined,
            roleplay: activeRoleplay
              ? {
                  scenarioId: activeRoleplay.id,
                  scenarioTitle: activeRoleplay.title,
                  avatarRole: activeRoleplay.avatarRole,
                  userRole: activeRoleplay.userRole,
                  context: activeRoleplay.context,
                  objectives: activeRoleplay.objectives.map((o) => ({
                    id: o.id,
                    label: o.label,
                  })),
                }
              : undefined,
          }),
        });

        if (!chatRes.ok) {
          const errData = await chatRes.json().catch(() => ({}));
          throw new Error(errData.error ?? `Erreur HTTP ${chatRes.status}`);
        }

        const chatData: ChatApiResponse = await chatRes.json();
        setIsTyping(false);
        setAvatarSubtitle(""); // Effacer "Je réfléchis…"
        if (chatData.niveau_estime !== level) setLevel(chatData.niveau_estime);

        // Ajouter les nouvelles corrections au SRS
        if (chatData.corrections.length > 0) {
          addSRSCards(chatData.corrections);
        }

        // Mettre à jour les objectifs validés du rôleplay
        if (chatData.completedObjectiveIds && chatData.completedObjectiveIds.length > 0) {
          setCompletedObjectives((prev) =>
            Array.from(new Set([...prev, ...chatData.completedObjectiveIds!]))
          );
        }

        // ── TTS : essayer OpenRouter d'abord, fallback Web Speech ──
        setMicButtonState("speaking");
        avatarRef.current?.setEmotion("happy");

        let ttsOk = false;
        try {
          const speakRes = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chatData.reply, voice: selectedVoice.id }),
          });
          if (speakRes.ok) {
            const speakData = await speakRes.json();
            if (speakData.audioBase64) {
              const audioUrl = `data:${speakData.mimeType};base64,${speakData.audioBase64}`;
              addMessage({
                role: "assistant",
                content: chatData.reply,
                corrections: chatData.corrections,
                audioUrl,
              });
              setAvatarSubtitle(chatData.reply);
              await avatarRef.current?.speak(
                chatData.reply,
                speakData.audioBase64,
                speakData.mimeType
              );
              setAvatarSubtitle("");
              ttsOk = true;
            }
          }
        } catch {
          // TTS OpenRouter indisponible
        }

        if (!ttsOk) {
          // Fallback : Web Speech API TTS (navigateur) + lip-sync avatar en parallèle
          addMessage({
            role: "assistant",
            content: chatData.reply,
            corrections: chatData.corrections,
          });
          setAvatarSubtitle(chatData.reply);

          // Résumer l'AudioContext avant de lancer la lip-sync
          // (l'avatar.speak sans audio déclenche speakText pour la lip-sync)
          await Promise.all([
            speakWithBrowser(chatData.reply, "en-US", selectedVoice.gender === "M", speechSpeed),
            avatarRef.current?.speak(chatData.reply),
          ]);

          setAvatarSubtitle("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
        setIsTyping(false);
        avatarRef.current?.setEmotion("neutral");
      } finally {
        setMicButtonState("idle");
      }
    },
    [ensureSession, sessionActive, addMessage, level, topic, selectedVoice, activeRoleplay]
  );

  const allCorrections = currentSession?.allCorrections ?? [];

  // ── Mode Mains Libres (VAD Walk & Talk) ────────────────────────────────────
  const { isListening: isHandsFreeListening, interimText: handsFreeInterim } = useHandsFree({
    enabled: isHandsFree,
    isAvatarSpeaking: micButtonState === "speaking",
    isProcessing: micButtonState === "processing",
    onSpeechFinal: (text) => {
      handleUserMessage(text);
    },
    lang: "en-US",
  });

  // ── Lancer un Scénario de Roleplay ────────────────────────────────────────
  const handleSelectRoleplay = useCallback(
    async (scenario: RoleplayScenario) => {
      setActiveRoleplay(scenario);
      setCompletedObjectives([]);
      setLevel(scenario.level);
      setTopic(scenario.title);
      startSession(scenario.level, scenario.title);
      setSessionActive(true);

      // Réplique d'ouverture du personnage
      addMessage({
        role: "assistant",
        content: scenario.initialMessage,
      });
      setAvatarSubtitle(scenario.initialMessage);
      setMicButtonState("speaking");
      if (scenario.avatarMood) {
        avatarRef.current?.setEmotion(scenario.avatarMood);
      }
      await speakWithBrowser(scenario.initialMessage, "en-US", selectedVoice.gender === "M", speechSpeed);
      setAvatarSubtitle("");
      setMicButtonState("idle");
    },
    [startSession, selectedVoice, addMessage, speechSpeed]
  );

  // ── Ouvrir la Carte Bilan Partageable ──────────────────────────────────────
  const openShareCard = useCallback(
    (customData?: Partial<ShareCardData>) => {
      const accuracy = Math.max(60, 100 - allCorrections.length * 5);
      const fluency = Math.min(96, Math.max(70, 75 + (currentSession?.messages.length ?? 0) * 2));
      const cardData: ShareCardData = {
        levelTitle: `Niveau ${level.toUpperCase()}`,
        fluencyScore: fluency,
        accuracyScore: accuracy,
        messagesCount: currentSession?.messages.length ?? 0,
        streakDays: streak.currentStreak || 1,
        roleplayCompletedTitle: activeRoleplay?.title,
        dateStr: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        ...customData,
      };
      setShareCardData(cardData);
      setIsShareCardOpen(true);
    },
    [
      level,
      allCorrections.length,
      currentSession?.messages.length,
      streak.currentStreak,
      activeRoleplay?.title,
    ]
  );

  // ── Gestion vocale : Clic (Toggle) + Maintien (Push-to-talk) ──────────────
  const isHoldingRef = useRef(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startVoiceRecording = useCallback(async () => {
    setError(null);
    setMicButtonState("recording");

    if (transcriptionMode === "webspeech" || transcriptionMode === "unknown") {
      speechRec.startListening();
    } else {
      await mic.startRecording();
    }
  }, [transcriptionMode, speechRec, mic]);

  const stopVoiceRecording = useCallback(async () => {
    setMicButtonState("processing");

    if (transcriptionMode === "webspeech" || transcriptionMode === "unknown") {
      const text = await speechRec.stopListening();

      if (!text?.trim()) {
        if (transcriptionMode === "unknown") {
          setTranscriptionMode("openrouter");
        }
        setMicButtonState("idle");
        if (speechRec.error) setError(speechRec.error);
        else setError("Aucune parole détectée. Réessayez.");
        return;
      }

      await handleUserMessage(text.trim());
    } else {
      const result = await mic.stopRecording();
      if (!result) {
        setMicButtonState("idle");
        return;
      }

      try {
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: result.audioBase64,
            mimeType: result.mimeType,
          }),
        });
        if (!transcribeRes.ok) {
          const e = await transcribeRes.json().catch(() => ({}));
          throw new Error(
            e.error ?? "Transcription indisponible. Utilisez la saisie texte."
          );
        }
        const { text } = await transcribeRes.json();
        if (!text?.trim()) {
          setMicButtonState("idle");
          setError("Aucune parole détectée. Réessayez.");
          return;
        }

        // ── Analyse de prononciation (en parallèle avec le message) ──
        fetch("/api/pronunciation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: result.audioBase64,
            mimeType: result.mimeType,
            referenceText: text.trim(),
          }),
        })
          .then((r) => r.ok ? r.json() : null)
          .then((score: PronunciationScore | null) => {
            if (score && score.issues.length > 0) {
              setPronunciationScore(score);
            }
          })
          .catch(() => {/* silencieux */});

        await handleUserMessage(text.trim());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur de transcription."
        );
        setMicButtonState("idle");
      }
    }
  }, [transcriptionMode, speechRec, mic, handleUserMessage]);

  const handleMicClick = useCallback(async () => {
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      return;
    }
    if (micButtonState === "idle") {
      await startVoiceRecording();
    } else if (micButtonState === "recording") {
      await stopVoiceRecording();
    }
  }, [micButtonState, startVoiceRecording, stopVoiceRecording]);

  const handleMicDown = useCallback(() => {
    if (micButtonState !== "idle") return;
    isHoldingRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      startVoiceRecording();
    }, 350);
  }, [micButtonState, startVoiceRecording]);

  const handleMicUp = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (isHoldingRef.current && micButtonState === "recording") {
      stopVoiceRecording();
    }
  }, [micButtonState, stopVoiceRecording]);

  const handleCancel = useCallback(() => {
    if (transcriptionMode === "webspeech") {
      speechRec.cancelListening();
    } else {
      mic.cancelRecording();
    }
    setMicButtonState("idle");
    setError(null);
  }, [transcriptionMode, speechRec, mic]);

  const handleEndSession = useCallback(() => {
    endSession();
    recordSession();
    setSessionActive(false);
    setMicButtonState("idle");
    window.speechSynthesis?.cancel();
    avatarRef.current?.stopSpeaking();
    avatarRef.current?.setEmotion("neutral");
  }, [endSession, recordSession]);

  const displayError = error || mic.error || speechRec.error;

  // ── Ouvrir un mode spécial ────────────────────────────────────────────────
  const openMode = useCallback((mode: AppMode) => {
    setActiveMode(mode);
    setIsModeModalOpen(true);
  }, []);

  // ── Correction de texte → ajouter aux flashcards SRS ────────────────────
  const handleTextCorrections = useCallback((corrections: Correction[]) => {
    addSRSCards(corrections);
  }, [addSRSCards]);

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-cream-100">
      {/* ── Onboarding premier lancement ── */}
      <OnboardingOverlay />

      {/* ── Bannière d'installation PWA Mobile ── */}
      <PwaInstallBanner />

      {/* ── Header Glassmorphism ── */}

      {/* ── Header Glassmorphism ── */}
      <header className="glass-header sticky top-0 z-20 px-3 sm:px-6 py-2.5 shrink-0 flex items-center justify-between no-print shadow-subtle">
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo size={34} className="shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-brown-700 tracking-tight leading-tight">
              English Tutor
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              <span className="text-[10px] sm:text-[11px] text-brown-400 font-medium inline-flex items-center gap-1.5">
                <span>{selectedAvatar.label}</span>
                <span className="w-1 h-1 rounded-full bg-brown-300" aria-hidden="true" />
                <span>Tuteur IA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contrôles compacts dans le header sur écran >= lg */}
        <div className="hidden lg:flex items-center gap-2.5">
          <LevelSelector value={level} onChange={setLevel} compact disabled={sessionActive} />
          <TopicSelector value={topic} onChange={setTopic} compact disabled={sessionActive} />
        </div>

        {/* Navigation compacte */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Objectif quotidien & Badges */}
          <DailyGoalTracker
            todayMessages={userMessagesCount}
            goalTarget={5}
            stats={gamificationStats}
            className="hidden sm:inline-flex"
          />

          {/* Streak compact */}
          <StreakBadge streak={streak} compact />

          {sessionActive && (
            <button
              onClick={handleEndSession}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-terracotta-50 text-terracotta-600 border border-terracotta-200 hover:bg-terracotta-100 transition-colors shrink-0"
            >
              Terminer
            </button>
          )}

          {/* Bilans */}
          <Link
            href="/session"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-brown-600 bg-cream-50 hover:bg-cream-200 border border-cream-300 transition-colors shadow-subtle shrink-0"
            aria-label="Bilans de séance et flashcards"
          >
            <CalendarIcon size={14} />
            <span className="hidden sm:inline">Bilans</span>
            {sessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cream-300 text-[10px] font-bold text-brown-600">
                {sessions.length}
              </span>
            )}
          </Link>

          {/* Menu ⋮ — actions secondaires */}
          <div className="relative">
            <button
              onClick={() => setIsHeaderMenuOpen((v) => !v)}
              className="p-1.5 rounded-full text-brown-500 hover:text-brown-700 hover:bg-cream-200 border border-cream-300 bg-cream-50 transition-colors"
              aria-label="Plus d'options"
              aria-expanded={isHeaderMenuOpen}
              aria-haspopup="menu"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <circle cx="10" cy="4" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="10" cy="16" r="1.5" />
              </svg>
            </button>

            {isHeaderMenuOpen && (
              <>
                {/* Overlay pour fermer */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsHeaderMenuOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 z-40 w-52 bg-cream-50 border border-cream-200 rounded-xl shadow-2xl py-1 animate-fade-in"
                >
                  <button
                    role="menuitem"
                    onClick={() => { setIsRoleplaySelectorOpen(true); setIsHeaderMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
                  >
                    <MaskIcon size={14} />
                    Scénarios Roleplay
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => { setIsPlacementTestOpen(true); setIsHeaderMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
                  >
                    <TrophyIcon size={14} />
                    Test de Niveau (CEFR)
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => { setIsRoadmapOpen(true); setIsHeaderMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
                  >
                    <CompassIcon size={14} />
                    Parcours A1-C1
                  </button>
                  <hr className="border-cream-200 my-1" />
                  <button
                    role="menuitem"
                    onClick={() => { openShareCard(); setIsHeaderMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
                  >
                    <ShareIcon size={14} />
                    Partager ma progression
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Barre de contrôles sur tablette / mobile */}
      {!sessionActive && (
        <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-1.5 bg-cream-50/80 border-b border-cream-200 shrink-0 overflow-x-auto">
          <LevelSelector value={level} onChange={setLevel} compact />
          <TopicSelector value={topic} onChange={setTopic} compact />
        </div>
      )}

      {/* ── Segmented Control Mobile (< md) ── */}
      <div
        role="tablist"
        aria-label="Navigation principale"
        className="md:hidden flex items-center bg-cream-200/80 p-1 rounded-xl border border-cream-300 mx-3 mt-1.5 mb-1 shrink-0"
      >
        <button
          role="tab"
          aria-selected={mobileTab === "studio"}
          onClick={() => setMobileTab("studio")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "studio"
              ? "bg-white text-brown-700 shadow-sm"
              : "text-brown-400 hover:text-brown-600"
          }`}
        >
          <MicIcon size={13} />
          <span>Studio</span>
        </button>

        <button
          role="tab"
          aria-selected={mobileTab === "chat"}
          onClick={() => {
            setMobileTab("chat");
            setRightTab("chat");
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "chat"
              ? "bg-white text-brown-700 shadow-sm"
              : "text-brown-400 hover:text-brown-600"
          }`}
        >
          <MessageIcon size={13} />
          <span>Discussion</span>
          {(currentSession?.messages.length ?? 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cream-300 text-[10px] text-brown-700 font-bold">
              {currentSession?.messages.length}
            </span>
          )}
        </button>

        <button
          role="tab"
          aria-selected={mobileTab === "corrections"}
          onClick={() => {
            setMobileTab("corrections");
            setRightTab("corrections");
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "corrections"
              ? "bg-white text-brown-700 shadow-sm"
              : "text-brown-400 hover:text-brown-600"
          }`}
        >
          <PencilIcon size={13} />
          <span>Fautes</span>
          {allCorrections.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-white text-[10px] font-bold transition-colors ${
              mobileTab === "corrections" ? "bg-brown-400" : "bg-terracotta-500"
            }`}>
              {allCorrections.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Bannière d'erreur ── */}
      {displayError && (
        <div className="px-3 sm:px-6 pt-2 shrink-0">
          <ErrorBanner
            message={displayError}
            onDismiss={() => { setError(null); handleCancel(); }}
          />
        </div>
      )}

      {/* ── Corps : Disposition Studio Visio 2-colonnes Responsive ── */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-2.5 sm:p-4 md:p-5 flex flex-col md:flex-row gap-3 md:gap-5 overflow-hidden min-h-0">
        
        {/* ── COLONNE GAUCHE : Studio Avatar & Dock Vocal (Visible sur desktop ou sur mobile en mode "studio") ── */}
        <section
          className={`${
            mobileTab === "studio" ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-7/12 lg:w-3/5 h-full gap-2.5 sm:gap-3 overflow-hidden min-h-0`}
          aria-label="Espace Tuteur"
        >
          {/* Cadre Studio Avatar */}
          <div className="flex-1 min-h-0 relative rounded-2xl md:rounded-3xl border border-cream-300/80 shadow-lift overflow-hidden bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200/90 flex flex-col">
            {/* Halo de studio dynamique */}
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
                micButtonState === "speaking" ? "studio-glow-active" : "studio-glow"
              }`}
            />

            {/* Badges flottants dans la scène vidéo */}
            <div className="absolute top-2.5 sm:top-3.5 left-3 sm:left-4 right-3 sm:right-4 z-10 flex items-center justify-between pointer-events-none">
              {/* Bouton personnalisation avatar + nom */}
              <button
                onClick={() => setShowPersonalize(true)}
                className="glass-pill px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold text-brown-600 flex items-center gap-1.5 sm:gap-2 shadow-subtle pointer-events-auto hover:bg-cream-100/90 transition-colors"
                aria-label="Personnaliser l'avatar et la voix"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{selectedAvatar.label}</span>
                <span className="w-1 h-1 rounded-full bg-brown-300" aria-hidden="true" />
                <span>{selectedVoice.label}</span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-50">
                  <path d="M9 2l1 1-7 7H2V9l7-7z"/>
                </svg>
              </button>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <span className="glass-pill px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-brown-400 capitalize">
                  {level}
                </span>
                {topic && (
                  <span className="glass-pill px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-terracotta-600 truncate max-w-[90px] sm:max-w-none">
                    {topic}
                  </span>
                )}
              </div>
            </div>

            {/* Notification de correction flottante sur mobile pour basculer facilement */}
            {allCorrections.length > 0 && (
              <button
                onClick={() => {
                  setMobileTab("corrections");
                  setRightTab("corrections");
                }}
                className="md:hidden absolute bottom-3 left-3 z-10 glass-pill px-2.5 py-1 rounded-full text-[11px] font-semibold text-terracotta-600 border border-terracotta-200 shadow-sm flex items-center gap-1 animate-fade-in"
              >
                <PencilIcon size={12} />
                <span>{allCorrections.length} faute{allCorrections.length > 1 ? "s" : ""}</span>
              </button>
            )}

            {/* Canvas Avatar 3D */}
            <div className="w-full h-full flex-1 relative">
              <AvatarCanvas
                ref={avatarRef}
                className="w-full h-full"
                subtitle={avatarSubtitle}
                onSpeakStart={() => setMicButtonState("speaking")}
                onSpeakEnd={() => setMicButtonState("idle")}
                avatarUrl={selectedAvatar.url}
                avatarBody={selectedAvatar.body}
              />
            </div>
          </div>

          {/* Dock Vocal Central */}
          <div className="rounded-2xl border border-cream-200 bg-cream-50/90 backdrop-blur-md p-2.5 sm:p-3.5 shadow-sm shrink-0 flex flex-col items-center gap-2 sm:gap-2.5">
            {/* Toast de prononciation si détecté */}
            {pronunciationScore && pronunciationScore.issues.length > 0 && (
              <div className="w-full max-w-md">
                <PronunciationToast
                  score={pronunciationScore}
                  onDismiss={() => setPronunciationScore(null)}
                />
              </div>
            )}

            {/* Indicateur Mode Mains Libres */}
            {isHandsFree && (
              <div className="w-full max-w-md flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHandsFreeListening ? "bg-emerald-500 animate-pulse" : "bg-brown-300"
                    }`}
                  />
                  <span className="font-semibold text-[11px]">
                    {micButtonState === "speaking"
                      ? "L'avatar parle… Écoute suspendue"
                      : isHandsFreeListening
                      ? "🎧 Parlez naturellement (envoi auto après silence)"
                      : "Traitement en cours…"}
                  </span>
                </div>
                {handsFreeInterim && (
                  <span className="text-[10px] italic text-emerald-600 truncate max-w-[140px]">
                    "{handsFreeInterim}"
                  </span>
                )}
              </div>
            )}

            {/* ── Ligne principale : Modes | MicButton | Mains Libres ── */}
            <div className="w-full flex items-center justify-between gap-2 px-1">
              {/* Bouton "+" modes — ouvre un mini-menu */}
              <div className="relative">
                <button
                  onClick={() => setIsModesMenuOpen((v) => !v)}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-brown-400 hover:text-brown-700 transition-colors"
                  title="Modes d'entraînement"
                  aria-label="Modes d'entraînement"
                  aria-expanded={isModesMenuOpen}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a1 1 0 0 1 1 1v6h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H3a1 1 0 0 1 0-2h6V3a1 1 0 0 1 1-1z"/>
                  </svg>
                  <span className="text-[9px] font-semibold leading-none">Modes</span>
                </button>

                {isModesMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsModesMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute left-0 bottom-full mb-2 z-40 w-48 bg-cream-50 border border-cream-200 rounded-xl shadow-2xl py-1 animate-fade-in">
                      <button
                        onClick={() => { setIsRoleplaySelectorOpen(true); setIsModesMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-terracotta-700 hover:bg-terracotta-50 transition-colors"
                      >
                        <MaskIcon size={13} />
                        Scénarios Roleplay
                      </button>
                      {(
                        [
                          { mode: "repeat-after-me" as AppMode, Icon: RepeatIcon, label: "Répète après moi" },
                          { mode: "dictation" as AppMode, Icon: HeadphonesIcon, label: "Dictée" },
                          { mode: "text-correction" as AppMode, Icon: FileEditIcon, label: "Corriger texte" },
                          { mode: "lesson" as AppMode, Icon: GraduationIcon, label: "Leçons" },
                        ] as const
                      ).map(({ mode, Icon, label }) => (
                        <button
                          key={mode}
                          onClick={() => { openMode(mode); setIsModesMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
                        >
                          <Icon size={13} />
                          {label}
                        </button>
                      ))}
                      {dueCards.length > 0 && (
                        <>
                          <hr className="border-cream-200 my-1" />
                          <button
                            onClick={() => { setIsSRSOpen(true); setIsModesMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-terracotta-600 hover:bg-terracotta-50 transition-colors"
                          >
                            <CardsIcon size={13} />
                            Flashcards ({dueCards.length} dues)
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* MicButton & AudioWaveformVisualizer — zone centrale prominente */}
              <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
                {(micButtonState === "recording" || micButtonState === "speaking" || micButtonState === "processing") && (
                  <AudioWaveformVisualizer state={micButtonState} height={28} className="animate-fade-in" />
                )}
                <MicButton
                  state={micButtonState}
                  onClick={handleMicClick}
                  onMouseDown={handleMicDown}
                  onMouseUp={handleMicUp}
                  onTouchStart={handleMicDown}
                  onTouchEnd={handleMicUp}
                  disabled={micButtonState === "processing" || micButtonState === "speaking"}
                />
              </div>

              {/* Mode Mains Libres */}
              <button
                onClick={() => setIsHandsFree(!isHandsFree)}
                className={[
                  "flex flex-col items-center gap-0.5 p-2 rounded-xl text-xs font-semibold transition-all duration-200",
                  isHandsFree
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 border border-emerald-700"
                    : "bg-cream-100 border border-cream-300 text-brown-400 hover:border-terracotta-200 hover:text-brown-700 hover:bg-cream-200",
                ].join(" ")}
                title="Mode Mains Libres (Walk & Talk)"
                aria-label={isHandsFree ? "Désactiver le mode mains libres" : "Activer le mode mains libres"}
                aria-pressed={isHandsFree}
              >
                <HeadphonesIcon size={16} />
                <span className="text-[9px] font-semibold leading-none">
                  {isHandsFree ? "Actif" : "Libre"}
                </span>
              </button>
            </div>

            {/* Séparateur visuel */}
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-cream-200" />
              <span className="text-[10px] text-brown-300 font-medium">ou par écrit</span>
              <div className="flex-1 h-px bg-cream-200" />
            </div>

            {/* Champ de saisie texte */}
            <div className="w-full max-w-lg">
              <TextInput
                onSend={handleUserMessage}
                disabled={micButtonState !== "idle"}
                placeholder="Écrivez votre message en anglais…"
              />
            </div>

            {/* Contrôles avatar et débit vocal */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => setShowPersonalize(true)}
                disabled={micButtonState === "processing" || micButtonState === "speaking"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-brown-500 bg-cream-100/80 border border-cream-200 hover:bg-cream-200 hover:text-brown-700 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Personnaliser l'avatar et la voix"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 13.5C2 11 4.7 9 8 9s6 2 6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{selectedAvatar.label}</span>
                <span className="w-1 h-1 rounded-full bg-brown-300" aria-hidden="true" />
                <span>{selectedVoice.label}</span>
              </button>

              <SpeechSpeedControl speed={speechSpeed} onChange={setSpeechSpeed} />
            </div>
          </div>
        </section>

        {/* ── COLONNE DROITE : Hub Interactif (Visible sur desktop ou sur mobile en mode "chat"/"corrections") ── */}
        <section
          className={`${
            mobileTab !== "studio" ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-5/12 lg:w-2/5 h-full rounded-2xl md:rounded-3xl border border-cream-200 bg-cream-50/95 shadow-sm overflow-hidden min-h-0`}
          aria-label="Fil de discussion et corrections"
        >
          {/* Header des onglets */}
          <div className="flex items-center border-b border-cream-200 bg-cream-100/60 p-1.5 shrink-0">
            <button
              onClick={() => {
                setRightTab("chat");
                setMobileTab("chat");
              }}
              className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                rightTab === "chat"
                  ? "bg-white text-brown-700 shadow-sm"
                  : "text-brown-400 hover:text-brown-600 hover:bg-cream-200/50"
              }`}
            >
              <MessageIcon size={14} />
              <span>Discussion</span>
              {(currentSession?.messages.length ?? 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cream-200 text-[10px] text-brown-500 font-bold">
                  {currentSession?.messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setRightTab("corrections");
                setMobileTab("corrections");
              }}
              className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                rightTab === "corrections"
                  ? "bg-white text-brown-700 shadow-sm"
                  : "text-brown-400 hover:text-brown-600 hover:bg-cream-200/50"
              }`}
            >
              <PencilIcon size={14} />
              <span>Corrections</span>
              {allCorrections.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition-all ${
                  rightTab === "corrections"
                    ? "bg-brown-200 text-brown-700"
                    : "bg-terracotta-500 text-cream-50 animate-pulse"
                }`}>
                  {allCorrections.length}
                </span>
              )}
            </button>
          </div>

          {/* Contenu de l'onglet Discussion */}
          {rightTab === "chat" ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {activeRoleplay && (
                <RoleplayHeader
                  scenario={activeRoleplay}
                  completedObjectives={completedObjectives}
                  onEndScenario={() => setIsRoleplayDebriefOpen(true)}
                  onExit={() => setActiveRoleplay(null)}
                />
              )}
              <ConversationView
                messages={currentSession?.messages ?? []}
                onReplay={(url) => new Audio(url).play().catch(() => {})}
                onAddToSRS={addWordCard}
                isTyping={isTyping}
              />

              {/* Barre de saisie et micro d'appoint pour mobile dans le chat */}
              <div className="md:hidden shrink-0 border-t border-cream-200 bg-cream-50 p-2 flex items-center gap-2">
                <button
                  onClick={handleMicClick}
                  disabled={micButtonState === "processing" || micButtonState === "speaking"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    micButtonState === "recording"
                      ? "bg-terracotta-500 text-white animate-pulse"
                      : "bg-cream-100 text-brown-400 hover:bg-cream-200 border border-cream-300"
                  }`}
                  aria-label="Microphone"
                >
                  <MicIcon size={16} />
                </button>
                <div className="flex-1">
                  <TextInput
                    onSend={handleUserMessage}
                    disabled={micButtonState !== "idle"}
                    placeholder="Écrivez en anglais…"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Contenu de l'onglet Corrections */
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
              {allCorrections.length > 0 && (
                <div className="bg-gradient-to-br from-terracotta-50 to-cream-100 p-3 sm:p-3.5 rounded-xl border border-terracotta-200 flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-terracotta-700">
                      {allCorrections.length} point{allCorrections.length > 1 ? "s" : ""} corrigé{allCorrections.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-brown-300">
                      Révisez-les sous forme de Flashcards pour les mémoriser.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFlashcardsOpen(true)}
                    className="btn-primary text-xs py-1.5 px-3 shrink-0 shadow-sm flex items-center gap-1.5"
                  >
                    <CardsIcon size={13} />
                    <span>Réviser</span>
                  </button>
                </div>
              )}

              {allCorrections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center mb-3 text-brown-300">
                    <CheckIcon size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-brown-600">Aucune erreur pour l'instant</p>
                  <p className="text-xs text-brown-300 mt-1 max-w-xs">
                    Continuez à vous exprimer à l'oral ou à l'écrit. Sarah vous aidera à peaufiner vos tournures au fil de l'échange.
                  </p>
                </div>
              ) : (
                allCorrections
                  .slice()
                  .reverse()
                  .map((c, i) => (
                    <CorrectionCard
                      key={`${c.original}-${i}`}
                      correction={c}
                      index={allCorrections.length - 1 - i}
                    />
                  ))
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modale Flashcards si ouverte depuis l'onglet corrections */}
      <FlashcardModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        corrections={allCorrections}
        title="Révision de la séance en cours"
      />

      {/* Modale SRS - Répétition espacée */}
      <SRSFlashcardModal
        isOpen={isSRSOpen}
        onClose={() => setIsSRSOpen(false)}
        cards={srsCards}
        dueCards={dueCards}
        onGrade={reviewCard}
        title="Révision espacée"
      />

      {/* Modale des modes spéciaux */}
      <ModeModal
        mode={activeMode}
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        level={level}
        topic={topic || undefined}
        voice={selectedVoice}
        onCorrectionsFound={handleTextCorrections}
        onStartConversation={(prompt) => {
          setIsModeModalOpen(false);
          handleUserMessage(prompt);
        }}
      />

      {/* Modale de personnalisation avatar + voix */}
      {showPersonalize && (
        <AvatarVoiceSelector
          avatarId={selectedAvatar.id}
          voiceId={selectedVoice.id}
          onAvatarChange={(avatar: AvatarConfig) => {
            setSelectedAvatar(avatar);
            setShowPersonalize(false);
          }}
          onVoiceChange={(voice: VoiceConfig) => {
            setSelectedVoice(voice);
          }}
          onClose={() => setShowPersonalize(false)}
          disabled={micButtonState !== "idle"}
        />
      )}

      {/* ── NOUVELLES FONCTIONNALITÉS ── */}

      {/* 1. Modale de sélection de scénario Roleplay */}
      <RoleplaySelectorModal
        isOpen={isRoleplaySelectorOpen}
        onClose={() => setIsRoleplaySelectorOpen(false)}
        onSelectScenario={handleSelectRoleplay}
        userLevel={level}
      />

      {/* 2. Modale de débriefing de fin de scénario Roleplay */}
      {activeRoleplay && (
        <RoleplayDebriefModal
          isOpen={isRoleplayDebriefOpen}
          onClose={() => setIsRoleplayDebriefOpen(false)}
          scenario={activeRoleplay}
          completedObjectives={completedObjectives}
          totalMessages={currentSession?.messages.length ?? 0}
          corrections={allCorrections}
          onOpenShareCard={() => {
            setIsRoleplayDebriefOpen(false);
            openShareCard({ roleplayCompletedTitle: activeRoleplay.title });
          }}
        />
      )}

      {/* 3. Modale Test de Niveau Initial CEFR (A1-C1) */}
      <PlacementTestModal
        isOpen={isPlacementTestOpen}
        onClose={() => setIsPlacementTestOpen(false)}
        onLevelAssigned={(lvl) => setLevel(lvl)}
        onOpenShareCard={(data) =>
          openShareCard({
            levelTitle: data.levelTitle,
            fluencyScore: data.fluencyScore,
            accuracyScore: data.accuracyScore,
          })
        }
      />

      {/* 4. Modale Parcours d'Apprentissage & Roadmap */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        onLaunchRoleplay={handleSelectRoleplay}
        onLaunchLesson={(lessonId) => openMode("lesson")}
        onLaunchConversation={(topicName) => {
          setTopic(topicName);
          ensureSession();
        }}
      />

      {/* 5. Carte Bilan Partageable & Virale (Social Share Card) */}
      {shareCardData && (
        <ShareableScoreCard
          isOpen={isShareCardOpen}
          onClose={() => setIsShareCardOpen(false)}
          data={shareCardData}
        />
      )}
    </div>
  );
}


