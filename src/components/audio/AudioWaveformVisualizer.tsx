"use client";
import { useEffect, useRef } from "react";
import type { MicState } from "@/types";

interface AudioWaveformVisualizerProps {
  state: MicState;
  className?: string;
  height?: number;
}

export function AudioWaveformVisualizer({
  state,
  className = "",
  height = 42,
}: AudioWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const isRecording = state === "recording";
    const isSpeaking = state === "speaking";
    const isProcessing = state === "processing";

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const midY = h / 2;
      const numBars = 28;
      const barSpacing = width / numBars;
      const barWidth = Math.max(2.5, barSpacing * 0.45);

      phase += isRecording ? 0.12 : isSpeaking ? 0.08 : 0.03;

      for (let i = 0; i < numBars; i++) {
        const x = i * barSpacing + barSpacing / 2;
        let amp = 0.15; // état idle / repos

        if (isRecording) {
          // Onde vive et dynamique quand l'utilisateur parle
          const wave1 = Math.sin(phase + i * 0.35);
          const wave2 = Math.cos(phase * 0.8 + i * 0.2);
          amp = 0.25 + 0.65 * Math.abs(wave1 * wave2);
        } else if (isSpeaking) {
          // Onde plus douce et fluide pour la voix de l'avatar
          const wave = Math.sin(phase + i * 0.25);
          amp = 0.2 + 0.5 * Math.abs(wave);
        } else if (isProcessing) {
          // Pulsation progressive
          amp = 0.2 + 0.3 * Math.abs(Math.sin(phase + i * 0.5));
        }

        const barH = Math.max(4, amp * (h - 8));
        const yTop = midY - barH / 2;

        // Gradient chaleureux
        const grad = ctx.createLinearGradient(0, yTop, 0, yTop + barH);
        if (isRecording) {
          grad.addColorStop(0, "#f87171"); // rose / rouge vif
          grad.addColorStop(1, "#c2410c"); // terracotta vif
        } else if (isSpeaking) {
          grad.addColorStop(0, "#fb923c"); // ambre
          grad.addColorStop(1, "#ea580c"); // terracotta
        } else {
          grad.addColorStop(0, "rgba(234, 88, 12, 0.25)");
          grad.addColorStop(1, "rgba(120, 53, 15, 0.15)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Bords arrondis
        const r = barWidth / 2;
        ctx.roundRect(x - barWidth / 2, yTop, barWidth, barH, r);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={220}
        height={height}
        className="w-full max-w-[240px] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
