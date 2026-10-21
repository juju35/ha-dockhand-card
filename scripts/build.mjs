// Bundles src/dockhand-card.js into the single HACS file dist/dockhand-card.js,
// inlining the Dockhand logo so the card needs no extra resource.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const img = readFileSync(`${root}images/logo.webp`).toString("base64");

const out = readFileSync(`${root}src/dockhand-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_LOGO__", `data:image/webp;base64,${img}`);

const target = `${root}dist/dockhand-card.js`;
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(target, out);
console.log(`Built dist/dockhand-card.js (${(out.length / 1024).toFixed(1)} KB)`);
