"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Délai en ms avant l'animation (pour le stagger) */
  delay?: number;
  /** Direction de l'animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Distance de déplacement en px */
  distance?: number;
  /** Activer l'effet de flou pendant la transition */
  blur?: boolean;
  as?: React.ElementType;
}

const DIRECTION_MAP: Record<string, string> = {
  up: "translateY",
  down: "translateY",
  left: "translateX",
  right: "translateX",
  none: "none",
};

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  blur = false,
  as = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const Tag = as as any;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si l'IntersectionObserver n'est pas supporté, afficher directement
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const axis = DIRECTION_MAP[direction];
  const offset = direction === "down" || direction === "right" ? -distance : distance;

  const initialStyle: React.CSSProperties = visible
    ? {}
    : {
        opacity: 0,
        transform: axis !== "none" ? `${axis}(${offset}px)` : undefined,
        filter: blur ? "blur(6px)" : undefined,
        transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease",
        transitionDelay: `${delay}ms`,
      };

  const revealedStyle: React.CSSProperties = {
    opacity: 1,
    transform: "none",
    filter: "none",
    transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease",
    transitionDelay: `${delay}ms`,
  };

  return (
    <Tag
      ref={ref}
      className={className}
      style={visible ? revealedStyle : initialStyle}
    >
      {children}
    </Tag>
  );
}
