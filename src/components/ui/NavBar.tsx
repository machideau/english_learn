"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Logo + titre */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={34} className="shrink-0" />
            <span className="font-bold text-brown-700 tracking-tight text-sm truncate">English Tutor AI</span>
          </div>

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-brown-400 font-medium shrink-0">
            <a href="#features" className="hover:text-brown-600 transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-brown-600 transition-colors">Comment ça marche</a>
            <a href="#faq" className="hover:text-brown-600 transition-colors">FAQ</a>
          </nav>

          {/* Actions : CTA + hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span className="sm:hidden">Commencer</span>
              <span className="hidden sm:inline">Commencer gratuitement</span>
              <svg className="hidden sm:block" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M2 7h10M7 2l5 5-5 5" />
              </svg>
            </Link>

            <button
              className="sm:hidden p-2 rounded-lg text-brown-500 hover:bg-cream-200 transition-colors"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M2 5h16M2 10h16M2 15h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="sm:hidden border-t border-cream-200 bg-cream-50 px-4 py-3 animate-slide-down" aria-label="Menu mobile">
            <ul className="space-y-1">
              {[
                { href: "#features", label: "Fonctionnalités" },
                { href: "#how-it-works", label: "Comment ça marche" },
                { href: "#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-brown-600 hover:bg-cream-200 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
