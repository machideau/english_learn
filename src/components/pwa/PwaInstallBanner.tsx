"use client";
import { useState, useEffect } from "react";
import { SmartphoneIcon, XIcon, DownloadIcon } from "@/components/ui/Icons";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Vérifier si déjà en mode standalone (déjà installé)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Vérifier si dismiss récemment
    const dismissed = localStorage.getItem("english_tutor_pwa_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 3600 * 1000) {
      return;
    }

    // Détecter iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (isIosDevice) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    try {
      localStorage.setItem("english_tutor_pwa_dismissed", String(Date.now()));
    } catch {}
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-cream-100 border-b border-cream-200 px-4 py-2 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-subtle shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-terracotta-100 text-terracotta-600 flex items-center justify-center shrink-0">
            <SmartphoneIcon size={16} />
          </div>
          <p className="text-brown-700 truncate">
            <span className="font-bold">Installez l'application</span> - Pratiquez à tout moment sur votre smartphone.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 rounded-full bg-terracotta-500 hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-semibold text-[11px] shadow-sm transition-colors flex items-center gap-1"
          >
            <DownloadIcon size={12} />
            <span>Installer</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-brown-300 hover:text-brown-600 rounded-full hover:bg-cream-200 transition-colors"
            aria-label="Ignorer"
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>

      {/* Guide modal pour iOS Safari */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-brown-900/60 backdrop-blur-sm"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="bg-cream-50 rounded-2xl border border-cream-200 p-5 max-w-sm w-full text-center space-y-3 animate-fade-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center mx-auto">
              <SmartphoneIcon size={24} />
            </div>
            <h3 className="text-sm font-bold text-brown-800">
              Installer sur iPhone / iPad
            </h3>
            <p className="text-xs text-brown-500 leading-relaxed text-left space-y-1.5">
              <span>1. Appuyez sur le bouton <strong>Partager</strong> <svg className="inline w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> dans Safari.</span>
              <br />
              <span>2. Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</span>
              <br />
              <span>3. Touchez <strong>Ajouter</strong> en haut à droite.</span>
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold"
            >
              C'est compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
