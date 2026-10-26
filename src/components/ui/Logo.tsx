interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo English Tutor AI - micro avec ondes sonores et étoile.
 * Identique à /public/icon.svg mais en composant React inline
 * pour éviter un chargement réseau supplémentaire.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ea580c" />
          <stop offset="50%"  stopColor="#c2410c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id="logo-inner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Squircle fond */}
      <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#logo-bg)" />
      <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#logo-inner)" />
      <rect x="32" y="32" width="448" height="448" rx="112" fill="none"
            stroke="#ffffff" strokeWidth="4" strokeOpacity="0.3" />

      {/* Ondes sonores droite */}
      <path d="M 360 216 A 64 64 0 0 1 360 296" fill="none" stroke="#fed7aa"
            strokeWidth="16" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M 396 186 A 110 110 0 0 1 396 326" fill="none" stroke="#fed7aa"
            strokeWidth="16" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Ondes sonores gauche */}
      <path d="M 152 216 A 64 64 0 0 0 152 296" fill="none" stroke="#fed7aa"
            strokeWidth="16" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M 116 186 A 110 110 0 0 0 116 326" fill="none" stroke="#fed7aa"
            strokeWidth="16" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Microphone */}
      <rect x="220" y="148" width="72" height="136" rx="36" fill="#ffffff" />
      <path d="M 188 236 C 188 300 220 324 256 324 C 292 324 324 300 324 236"
            fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
      <line x1="256" y1="324" x2="256" y2="368" stroke="#ffffff"
            strokeWidth="20" strokeLinecap="round" />
      <line x1="212" y1="368" x2="300" y2="368" stroke="#ffffff"
            strokeWidth="20" strokeLinecap="round" />

      {/* Étoile */}
      <path d="M 380 96 L 392 128 L 424 140 L 392 152 L 380 184 L 368 152 L 336 140 L 368 128 Z"
            fill="#fef08a" />
    </svg>
  );
}
