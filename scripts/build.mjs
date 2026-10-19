// Bundles src/dockhand-card.js into the single HACS file dist/dockhand-card.js,
// inlining the Dockhand logo so the card needs no extra resource.
// Usage: node scripts/build.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const img = readFileSync(`${root}images/logo.webp`).toString("base64");

const out = readFileSync(`${root}src/dockhand-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_LOGO__", `data:image/webp;base64,${img}`);

const target = `${root}dist/dockhand-card.js`;
if (process.argv.includes("--check")) {
  if (!existsSync(target) || readFileSync(target, "utf8") !== out) {
    console.error("dist/dockhand-card.js is out of date: run `npm run build` and commit the result.");
    process.exit(1);
  }
  console.log("dist/dockhand-card.js is up to date.");
} else {
  writeFileSync(target, out);
  console.log(`Built dist/dockhand-card.js (${(out.length / 1024).toFixed(1)} KB)`);
}
