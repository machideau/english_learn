// Icônes SVG inline — sans emojis
// Toutes les icônes sont 20×20 par défaut, accessibles avec aria-hidden

interface IconProps {
  className?: string;
  size?: number;
}

const icon = (paths: string, viewBox = '0 0 20 20') =>
  function Icon({ className = '', size = 20 }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill='none'
        stroke='currentColor'
        strokeWidth={1.6}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}
        aria-hidden='true'
      >
        {/* eslint-disable-next-line react/no-danger */}
        <g dangerouslySetInnerHTML={{ __html: paths }} />
      </svg>
    );
  };

// Microphone
export const MicIcon = icon(
  '<path d="M10 1a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>' +
  '<path d="M16 10a6 6 0 0 1-12 0"/>' +
  '<line x1="10" x2="10" y1="16" y2="19"/>' +
  '<line x1="7" x2="13" y1="19" y2="19"/>'
);

// Stop (carré)
export const StopIcon = icon(
  '<rect x="5" y="5" width="10" height="10" rx="1.5" fill="currentColor" stroke="none"/>'
);

// Spinner
export const SpinnerIcon = ({ className = '', size = 20 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
    <path
      d="M10 3a7 7 0 0 1 7 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="animate-spin origin-center"
      style={{ animationDuration: '0.8s' }}
    />
  </svg>
);

// Haut-parleur
export const SpeakerIcon = icon(
  '<polygon points="3,7 3,13 7,13 12,17 12,3 7,7" fill="currentColor" stroke="none"/>' +
  '<path d="M15 7a5 5 0 0 1 0 6"/>'
);

// Flèche gauche (retour)
export const ArrowLeftIcon = icon(
  '<path d="M15 10H5"/>' +
  '<path d="M9 5l-5 5 5 5"/>'
);

// Chevron bas
export const ChevronDownIcon = icon(
  '<path d="M5 8l5 5 5-5"/>'
);

// Croix (fermer)
export const XIcon = icon(
  '<line x1="5" y1="5" x2="15" y2="15"/>' +
  '<line x1="15" y1="5" x2="5" y2="15"/>'
);

// Play
export const PlayIcon = icon(
  '<polygon points="6,3 17,10 6,17" fill="currentColor" stroke="none"/>'
);

// Horloge
export const ClockIcon = icon(
  '<circle cx="10" cy="10" r="8"/>' +
  '<polyline points="10,5 10,10 13,13"/>'
);

// Message
export const MessageIcon = icon(
  '<path d="M17 11a1 1 0 0 1-1 1H6l-3 3V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7z"/>'
);

// Crayon (grammaire)
export const PencilIcon = icon(
  '<path d="M14 2l4 4L6 18H2v-4L14 2z"/>'
);

// Livre (vocabulaire)
export const BookIcon = icon(
  '<path d="M3 18V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14l-7-3-7 3z"/>'
);

// Flèches (tournure)
export const RefreshIcon = icon(
  '<path d="M4 10a6 6 0 0 1 11-3.3"/>' +
  '<path d="M16 10a6 6 0 0 1-11 3.3"/>' +
  '<polyline points="17,5 15,8 12.5,6"/>' +
  '<polyline points="3,15 5,12 7.5,14"/>'
);

// Onde sonore (prononciation)
export const WaveIcon = icon(
  '<path d="M2 10h2"/>' +
  '<path d="M5 6v8"/>' +
  '<path d="M8 4v12"/>' +
  '<path d="M11 7v6"/>' +
  '<path d="M14 5v10"/>' +
  '<path d="M17 8v4"/>' +
  '<path d="M20 10h-1"/>'
);

// Coche
export const CheckIcon = icon(
  '<polyline points="4,10 8,14 16,6"/>'
);

// Calendrier
export const CalendarIcon = icon(
  '<rect x="2" y="4" width="16" height="14" rx="2"/>' +
  '<path d="M6 2v4M14 2v4M2 9h16"/>'
);

// Cartes de révision / Flashcards
export const CardsIcon = icon(
  '<rect x="2" y="5" width="12" height="13" rx="2"/>' +
  '<path d="M6 2h10a2 2 0 0 1 2 2v11"/>'
);

// Volume / Prononciation audio
export const VolumeIcon = icon(
  '<polygon points="3,7 3,13 7,13 12,17 12,3 7,7" fill="currentColor" stroke="none"/>' +
  '<path d="M15 6a5.5 5.5 0 0 1 0 8"/>' +
  '<path d="M17.5 4a8.5 8.5 0 0 1 0 12"/>'
);

// Recommencer / Rejouer
export const RotateCcwIcon = icon(
  '<path d="M3 4v5h5"/>' +
  '<path d="M3.5 13a7.5 7.5 0 1 0 2.2-7.8L3 9"/>'
);

// Étoiles / Félicitations
export const SparklesIcon = icon(
  '<path d="M10 2l1.8 4.2L16 8l-4.2 1.8L10 14l-1.8-4.2L4 8l4.2-1.8z"/>' +
  '<path d="M15 13l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>'
);

