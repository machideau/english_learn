"use client";
import { useRef, useState } from "react";
import type { ShareCardData } from "@/types";
import {
  DownloadIcon,
  ShareIcon,
  XIcon,
  SparkleIcon,
  TrophyIcon,
  FlameIcon,
  CheckIcon,
} from "@/components/ui/Icons";

interface ShareableScoreCardProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export function ShareableScoreCard({
  isOpen,
  onClose,
  data,
}: ShareableScoreCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🚀 J'ai pratiqué mon anglais oral avec mon tuteur IA 3D !\n\n📊 Mon bilan :\n• Niveau : ${data.levelTitle}\n• Fluidité : ${data.fluencyScore}%\n• Précision : ${data.accuracyScore}%\n• Série de pratique : ${data.streakDays} jours 🔥\n${data.roleplayCompletedTitle ? `• Scénario validé : ${data.roleplayCompletedTitle}\n` : ""}\nTestez gratuitement votre niveau : https://english-tutor-ai.app`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Mon bilan d'anglais avec English Tutor AI",
          text: shareText,
          url: "https://english-tutor-ai.app",
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    handleCopyText();
  };

  const handleCopyText = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadImage = () => {
    // Dessiner sur un canvas haute résolution
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fond dégradé riche
    const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
    gradient.addColorStop(0, "#1c1917");
    gradient.addColorStop(0.5, "#291811");
    gradient.addColorStop(1, "#431407");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 675);

    // Accent terracotta décoratif
    ctx.fillStyle = "rgba(194, 65, 12, 0.15)";
    ctx.beginPath();
    ctx.arc(1050, 150, 300, 0, Math.PI * 2);
    ctx.fill();

    // Bordure dorée subtile
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 615);

    // Logo / Titre
    ctx.fillStyle = "#fdba74";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("ENGLISH TUTOR AI", 70, 95);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "20px sans-serif";
    ctx.fillText("Tuteur IA & Avatar 3D interactif", 70, 130);

    // Niveau
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(data.levelTitle, 70, 230);

    if (data.roleplayCompletedTitle) {
      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(`Mission accomplie : ${data.roleplayCompletedTitle}`, 70, 275);
    }

    // Boîtes de statistiques
    const drawStatBox = (x: number, y: number, w: number, h: number, val: string, label: string) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.roundRect(x, y, w, h, 20);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.roundRect(x, y, w, h, 20);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(val, x + 30, y + 65);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "18px sans-serif";
      ctx.fillText(label, x + 30, y + 105);
    };

    drawStatBox(70, 320, 240, 130, `${data.fluencyScore}%`, "Score de Fluidité");
    drawStatBox(330, 320, 240, 130, `${data.accuracyScore}%`, "Précision Globale");
    drawStatBox(590, 320, 240, 130, `${data.messagesCount}`, "Échanges Parlés");
    drawStatBox(850, 320, 240, 130, `${data.streakDays} jours`, "Série Quotidienne");

    // Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Date de validation : ${data.dateStr} • https://english-tutor-ai.app`, 70, 580);

    // Déclencher le téléchargement
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-tutor-score-${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brown-950/70 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-cream-50 rounded-2xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cream-200 bg-cream-100/70 shrink-0">
          <div className="flex items-center gap-2">
            <SparkleIcon size={18} className="text-terracotta-600" />
            <h2 className="text-sm font-bold text-brown-800">
              Votre Carte de Réussite Partageable
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-300 hover:text-brown-600 rounded-full hover:bg-cream-200 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Aperçu de la carte */}
        <div className="p-6 overflow-y-auto">
          <div
            ref={cardRef}
            className="w-full rounded-2xl p-6 bg-gradient-to-br from-stone-900 via-stone-850 to-orange-950 text-white shadow-xl border border-stone-700/60 relative overflow-hidden"
          >
            {/* Décoration de fond */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* En-tête de marque */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <span className="text-xs font-bold tracking-wider text-orange-200 uppercase">
                  English Tutor AI
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <FlameIcon size={14} className="text-orange-500" />
                <span>{data.streakDays} jours</span>
              </div>
            </div>

            {/* Titre & Niveau */}
            <div className="mb-5">
              <div className="text-[11px] uppercase tracking-wider text-orange-400 font-semibold mb-1">
                Bilan de pratique orale
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {data.levelTitle}
              </h3>
              {data.roleplayCompletedTitle && (
                <div className="mt-1 text-xs text-orange-300 font-medium flex items-center gap-1.5">
                  <TrophyIcon size={13} />
                  <span>Mission validée : {data.roleplayCompletedTitle}</span>
                </div>
              )}
            </div>

            {/* Grille de stats */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="text-xl font-black text-white">{data.fluencyScore}%</div>
                <div className="text-[10px] text-stone-300">Fluidité de parole</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="text-xl font-black text-white">{data.accuracyScore}%</div>
                <div className="text-[10px] text-stone-300">Précision grammaticale</div>
              </div>
            </div>

            {/* Footer de la carte */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-800 pt-3">
              <span>{data.dateStr}</span>
              <span className="font-semibold text-stone-300">
                Parlez anglais avec un avatar 3D
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-4 border-t border-cream-200 bg-white flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadImage}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <DownloadIcon size={15} />
            <span>Télécharger l'image (PNG)</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 hover:bg-cream-100 text-brown-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ShareIcon size={15} />
            <span>{copied ? "Texte copié !" : "Partager"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
