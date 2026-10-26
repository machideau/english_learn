import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const svg = fs.readFileSync(path.join(ROOT, "public/icon.svg"));

const icons = [
  { out: "src/app/apple-icon.png", size: 180, label: "apple-icon (iOS)" },
  { out: "public/icon-192.png",    size: 192, label: "icon-192 (PWA)"  },
  { out: "public/icon-512.png",    size: 512, label: "icon-512 (PWA)"  },
];

for (const { out, size, label } of icons) {
  await sharp(svg)
    .resize(size, size)
    .png({ quality: 95 })
    .toFile(path.join(ROOT, out));
  console.log(`✓ ${label} → ${out}`);
}

console.log("\nDone ! Redémarre le serveur pour voir les icônes.");
