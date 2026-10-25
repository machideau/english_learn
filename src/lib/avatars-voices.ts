/**
 * Catalogue des avatars et voix disponibles.
 * Ajouter un avatar : placer le .glb dans /public/talkinghead/ et l'ajouter ici.
 * Ajouter une voix : chercher les IDs sur openrouter.ai/deepgram-aura-2 ou fish-audio.
 */

export interface AvatarConfig {
  id: string;
  label: string;
  url: string;          // Chemin relatif à /public
  body: "M" | "F";
  description: string;
}

export interface VoiceConfig {
  id: string;           // ID passé à l'API TTS (ou "" pour voix par défaut)
  label: string;
  gender: "F" | "M";
  accent: string;
  description: string;
}

export const AVATARS: AvatarConfig[] = [
  // ── Avatars féminins ────────────────────────────────────────────────────────
  {
    id: "brunette",
    label: "Sarah",
    url: "/talkinghead/brunette.glb",
    body: "F",
    description: "Tutrice chaleureuse",
  },
  {
    id: "brunette-t",
    label: "Emma",
    url: "/talkinghead/brunette-t.glb",
    body: "F",
    description: "Style décontracté",
  },
  {
    id: "vroid",
    label: "Hana",
    url: "/talkinghead/vroid.glb",
    body: "F",
    description: "Style anime",
  },
  // ── Avatars masculins ───────────────────────────────────────────────────────
  {
    id: "david",
    label: "David",
    url: "/talkinghead/david.glb",
    body: "M",
    description: "Tuteur bienveillant et posé",
  },
  {
    id: "james",
    label: "James",
    url: "/talkinghead/james.glb",
    body: "M",
    description: "Tuteur dynamique et moderne",
  },
  {
    id: "bruce",
    label: "Bruce",
    url: "/talkinghead/bruce.glb",
    body: "M",
    description: "Style élégant et pro",
  },
  {
    id: "avaturn",
    label: "Alex",
    url: "/talkinghead/avaturn.glb",
    body: "M",
    description: "Tuteur contemporain",
  },
];

// Voix Fish Audio disponibles via fish-audio/s2.1-pro-free:free
// L'API ne requiert pas de "voice" pour ce modèle — chaîne vide = voix par défaut
export const VOICES: VoiceConfig[] = [
  {
    id: "",
    label: "Default",
    gender: "F",
    accent: "American",
    description: "Voix par défaut Fish Audio",
  },
];

// Voix Deepgram Aura-2 (nécessite deepgram/aura-2 ou deepgram/aura-2-thalia-en etc.)
// Ces voix fonctionnent avec le modèle deepgram/aura-2
export const DEEPGRAM_VOICES: VoiceConfig[] = [
  { id: "aura-2-thalia-en",   label: "Thalia",   gender: "F", accent: "American", description: "Naturelle et claire" },
  { id: "aura-2-luna-en",     label: "Luna",     gender: "F", accent: "American", description: "Douce et rassurante" },
  { id: "aura-2-stella-en",   label: "Stella",   gender: "F", accent: "American", description: "Dynamique" },
  { id: "aura-2-athena-en",   label: "Athena",   gender: "F", accent: "British",  description: "Accent britannique" },
  { id: "aura-2-hera-en",     label: "Hera",     gender: "F", accent: "American", description: "Professionnelle" },
  { id: "aura-2-orion-en",    label: "Orion",    gender: "M", accent: "American", description: "Grave et posé" },
  { id: "aura-2-arcas-en",    label: "Arcas",    gender: "M", accent: "American", description: "Décontracté" },
  { id: "aura-2-perseus-en",  label: "Perseus",  gender: "M", accent: "American", description: "Formel" },
  { id: "aura-2-angus-en",    label: "Angus",    gender: "M", accent: "Irish",    description: "Accent irlandais" },
  { id: "aura-2-orpheus-en",  label: "Orpheus",  gender: "M", accent: "American", description: "Expressif" },
  { id: "aura-2-helios-en",   label: "Helios",   gender: "M", accent: "British",  description: "Accent britannique" },
  { id: "aura-2-zeus-en",     label: "Zeus",     gender: "M", accent: "American", description: "Autoritaire" },
];

export const DEFAULT_AVATAR_ID = "brunette";
export const DEFAULT_VOICE_ID  = "aura-2-thalia-en";

export function getAvatar(id: string): AvatarConfig {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function getVoice(id: string): VoiceConfig {
  return DEEPGRAM_VOICES.find((v) => v.id === id)
    ?? VOICES.find((v) => v.id === id)
    ?? DEEPGRAM_VOICES[0];
}
