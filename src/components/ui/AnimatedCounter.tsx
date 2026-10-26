"use client";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  /** Durée de l'animation en ms */
  duration?: number;
}

/**
 * Anime un compteur de 0 jusqu'à la valeur cible quand l'élément
 * entre dans le viewport. Gère les préfixes/suffixes non numériques
 * (ex: "< 2s", "A1→C1").
 */
export function AnimatedCounter({ value, className = "", duration = 1200 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extraire la partie numérique et les préfixes/suffixes
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const targetNum = match ? parseFloat(match[2]) : null;
  const suffix = match?.[3] ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si pas de nombre détectable, afficher directement
    if (targetNum === null) {
      setDisplayValue(value);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Easing ease-out-cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = targetNum * eased;
            setDisplayValue(
              targetNum % 1 !== 0 ? current.toFixed(1) : Math.round(current).toString()
            );
            if (progress < 1) requestAnimationFrame(animate);
            else setDisplayValue(match![2]); // Valeur exacte finale
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, targetNum, hasAnimated, match]);

  return (
    <span ref={ref} className={className}>
      {targetNum !== null ? `${prefix}${displayValue}${suffix}` : displayValue}
    </span>
  );
}
