"use client";
import { type MicState } from "@/types";
import { MicIcon, StopIcon } from "./Icons";

interface MicButtonProps {
  state: MicState;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  disabled?: boolean;
}

type StateConfig = {
  label: string;
  ariaLabel: string;
  className: string;
};

const STATE_CONFIG: Record<MicState, StateConfig> = {
  idle: {
    label: "Cliquez pour parler (ou maintenez)",
    ariaLabel: "Démarrer l'enregistrement",
    className: "mic-button-idle",
  },
  recording: {
    label: "Cliquez pour envoyer",
    ariaLabel: "Enregistrement en cours (cliquez pour envoyer)",
    className: "mic-button-recording",
  },
  processing: {
    label: "Traitement…",
    ariaLabel: "Traitement en cours",
    className: "mic-button-processing",
  },
  speaking: {
    label: "L'avatar répond…",
    ariaLabel: "L'avatar est en train de parler",
    className: "mic-button-speaking",
  },
};

const RECORDING_DELAYS = ["0s", "0.12s", "0.24s", "0.12s"];
const RECORDING_HEIGHTS = [10, 16, 12, 8];

function WaveBars() {
  return (
    <div className="flex items-center gap-[3px]" style={{ height: 20 }}>
      {RECORDING_DELAYS.map((delay, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{ height: RECORDING_HEIGHTS[i], animationDelay: delay }}
        />
      ))}
    </div>
  );
}

const SPEAKING_DELAYS = ["0s", "0.15s", "0.3s", "0.15s", "0s"];
const SPEAKING_HEIGHTS = [8, 14, 18, 14, 8];

function SpeakingBars() {
  return (
    <div className="flex items-center gap-[2px]" style={{ height: 20 }}>
      {SPEAKING_DELAYS.map((delay, i) => (
        <span
          key={i}
          className="wave-bar text-white"
          style={{ height: SPEAKING_HEIGHTS[i], animationDelay: delay, background: "currentColor" }}
        />
      ))}
    </div>
  );
}


function Spinner() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true"
      className="animate-spin" style={{ animationDuration: "0.75s" }}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M11 3a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MicButton({
  state,
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  disabled,
}: MicButtonProps) {
  const config = STATE_CONFIG[state];
  const isInteractive = state === "idle" || state === "recording";

  function renderIcon() {
    if (state === "recording") return <WaveBars />;
    if (state === "processing") return <Spinner />;
    if (state === "speaking") return <SpeakingBars />;
    return <MicIcon size={22} />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        {state === "recording" && (
          <span
            className="absolute -inset-1 rounded-full bg-terracotta-400/40 animate-ping pointer-events-none"
            style={{ animationDuration: "1.8s" }}
          />
        )}
        <button
          className={config.className}
          onClick={isInteractive ? onClick : undefined}
          onMouseDown={isInteractive ? onMouseDown : undefined}
          onMouseUp={isInteractive ? onMouseUp : undefined}
          onTouchStart={isInteractive ? onTouchStart : undefined}
          onTouchEnd={isInteractive ? onTouchEnd : undefined}
          disabled={disabled || (state !== "idle" && state !== "recording")}
          aria-label={config.ariaLabel}
          aria-pressed={state === "recording"}
          aria-busy={state === "processing"}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
        >
          {renderIcon()}
        </button>
      </div>
      <span className="text-xs font-medium text-brown-400 tracking-wide text-center">
        {config.label}
      </span>
    </div>
  );
}

