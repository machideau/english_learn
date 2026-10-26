/**
 * Génère /public/og-image.png (1200×630)
 * Usage : node scripts/generate-og-image.mjs
 *
 * Dépendances : sharp (inclus avec Next.js)
 */

import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, "../public/og-image.png");

const W = 1200;
const H = 630;

// ─── Dessin SVG inline ────────────────────────────────────────────────────────
// On génère un SVG puis on le convertit en PNG avec sharp (pas besoin de canvas natif)

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#faf2e8"/>
      <stop offset="50%"  stop-color="#f5e4d0"/>
      <stop offset="100%" stop-color="#fdf1ed"/>
    </linearGradient>
    <radialGradient id="glow1" cx="70%" cy="20%" r="50%">
      <stop offset="0%"   stop-color="#f4bfac" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#faf2e8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="85%" r="40%">
      <stop offset="0%"   stop-color="#e89880" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#faf2e8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Fond -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Cercles décoratifs -->
  <circle cx="980" cy="80"  r="220" fill="#c4512e" opacity="0.06"/>
  <circle cx="1080" cy="180" r="140" fill="#c4512e" opacity="0.05"/>
  <circle cx="120"  cy="560" r="180" fill="#c4512e" opacity="0.05"/>

  <!-- Badge en haut -->
  <rect x="430" y="72" width="340" height="44" rx="22"
        fill="#fdf1ed" stroke="#f4bfac" stroke-width="1.5"/>
  <!-- Point pulsant simulé -->
  <circle cx="462" cy="94" r="5" fill="#c4512e"/>
  <text x="478" y="99" font-family="system-ui, -apple-system, sans-serif"
        font-size="15" font-weight="600" fill="#c4512e" text-anchor="start">
    Tuteur IA disponible 24h/24
  </text>

  <!-- Icône micro -->
  <rect x="554" y="138" width="92" height="92" rx="22"
        fill="#c4512e"/>
  <!-- Micro SVG simplifié -->
  <rect x="588" y="148" width="24" height="36" rx="12" fill="white"/>
  <path d="M579 180 Q579 196 600 196 Q621 196 621 180" stroke="white" stroke-width="3"
        fill="none" stroke-linecap="round"/>
  <line x1="600" y1="196" x2="600" y2="208" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="590" y1="210" x2="610" y2="210" stroke="white" stroke-width="3" stroke-linecap="round"/>

  <!-- Titre principal -->
  <text x="600" y="298" font-family="system-ui, -apple-system, sans-serif"
        font-size="68" font-weight="900" fill="#2a1a0f" text-anchor="middle"
        letter-spacing="-2">
    Parlez anglais avec
  </text>
  <text x="600" y="378" font-family="system-ui, -apple-system, sans-serif"
        font-size="68" font-weight="900" fill="#c4512e" text-anchor="middle"
        letter-spacing="-2">
    un tuteur IA
  </text>

  <!-- Sous-titre -->
  <text x="600" y="438" font-family="system-ui, -apple-system, sans-serif"
        font-size="24" fill="#7d5a3c" text-anchor="middle" opacity="0.85">
    Avatar 3D · Corrections en temps réel · Flashcards intelligentes
  </text>

  <!-- Bouton CTA -->
  <rect x="380" y="480" width="440" height="64" rx="32"
        fill="#c4512e"/>
  <text x="600" y="520" font-family="system-ui, -apple-system, sans-serif"
        font-size="22" font-weight="700" fill="white" text-anchor="middle">
    Commencer gratuitement →
  </text>

  <!-- Badges de fonctionnalités -->
  <rect x="68"  y="548" width="230" height="34" rx="17"
        fill="white" stroke="#e8d5c4" stroke-width="1"/>
  <text x="183" y="570" font-family="system-ui, -apple-system, sans-serif"
        font-size="13" font-weight="600" fill="#5c3d2e" text-anchor="middle">
    ✓ Sans inscription
  </text>

  <rect x="318" y="548" width="200" height="34" rx="17"
        fill="white" stroke="#e8d5c4" stroke-width="1"/>
  <text x="418" y="570" font-family="system-ui, -apple-system, sans-serif"
        font-size="13" font-weight="600" fill="#5c3d2e" text-anchor="middle">
    ✓ 7 avatars 3D
  </text>

  <rect x="538" y="548" width="230" height="34" rx="17"
        fill="white" stroke="#e8d5c4" stroke-width="1"/>
  <text x="653" y="570" font-family="system-ui, -apple-system, sans-serif"
        font-size="13" font-weight="600" fill="#5c3d2e" text-anchor="middle">
    ✓ 12 voix naturelles
  </text>

  <rect x="788" y="548" width="244" height="34" rx="17"
        fill="white" stroke="#e8d5c4" stroke-width="1"/>
  <text x="910" y="570" font-family="system-ui, -apple-system, sans-serif"
        font-size="13" font-weight="600" fill="#5c3d2e" text-anchor="middle">
    ✓ Corrections en français
  </text>

  <!-- Nom de l'app en bas à gauche -->
  <rect x="48" y="48" width="200" height="44" rx="12"
        fill="white" stroke="#e8d5c4" stroke-width="1.5"/>
  <rect x="60" y="58" width="24" height="24" rx="6" fill="#c4512e"/>
  <text x="94" y="75" font-family="system-ui, -apple-system, sans-serif"
        font-size="15" font-weight="700" fill="#2a1a0f">
    English Tutor AI
  </text>
</svg>
`.trim();

// ─── Conversion SVG → PNG ─────────────────────────────────────────────────────
try {
  await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(OUTPUT);

  const stats = fs.statSync(OUTPUT);
  console.log(`✓ Image générée : ${OUTPUT}`);
  console.log(`  Taille : ${(stats.size / 1024).toFixed(1)} Ko`);
  console.log(`  Dimensions : ${W}×${H}px`);
} catch (err) {
  console.error("Erreur lors de la génération :", err.message);
  process.exit(1);
}
