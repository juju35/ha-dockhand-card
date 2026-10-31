// Renders the cards with mock Dockhand data and saves the README screenshots, plus one looping GIF per
// animation (section folding, gauge transitions, mini card zoom) — the GIFs need ffmpeg on PATH.
// Usage: npm run build && npm run screenshots
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { devices, entities, states } from "./mock-states.mjs";
import { gifs, shots } from "./screenshot-scenes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/dockhand-card.js`, "utf8");

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const page_html = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme]).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// Fresh page with the card mounted; window.__card points to it for the GIF scenarios.
const openCard = async (browser, s) => {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2400 } });
  page.on("pageerror", (err) => console.error(`${s.file}: ${err.message}`));
  await page.setContent(page_html(s.theme, s.width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, states, entities, devices, zoom }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = { states, entities, devices, language: "en", locale: { language: "en" }, callService: () => {} };
      document.getElementById("root").appendChild(el);
      window.__card = el;
      // A mouse click (detail 1) on the detail button: the zoomed-in view, without a keyboard focus ring.
      if (zoom)
        el.shadowRoot
          .querySelector(".zoom")
          .dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
    },
    { type: s.type, config: s.config, states: s.states ?? states, entities, devices, zoom: !!s.zoom }
  );
  return page;
};

// A mouse click (detail 1, as a user's) on a shadow DOM element of the card.
const clickSel = (sel) =>
  window.__card.shadowRoot.querySelector(sel)?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));

const recordGif = async (browser, g, fps = 15) => {
  const page = await openCard(browser, g);
  await page.waitForTimeout(400);
  // Size the frame on the tallest state (list open, card zoomed in), then come back to the initial state.
  for (const sel of g.measure ?? []) await page.evaluate(clickSel, sel);
  await page.waitForTimeout(400);
  const box = await page.locator("#root").boundingBox();
  const clip = { x: 0, y: 0, width: g.width + 32, height: Math.ceil(box.height) + 32 };
  for (const sel of g.measure ?? []) await page.evaluate(clickSel, sel);
  await page.waitForTimeout(400);

  const dir = mkdtempSync(join(tmpdir(), "dh-frames-"));
  await page.evaluate(() => {
    window.__born = new Map(); // animation → time of the event that started it
    window.__eventAt = 0;
  });
  const events = [...g.events];
  const frames = Math.round(fps * g.seconds);
  for (let i = 0; i < frames; i++) {
    const t = (i * 1000) / fps;
    while (events.length && events[0].at * 1000 <= t) {
      const e = events.shift();
      await page.evaluate(
        ({ sel, overrides, t }) => {
          window.__eventAt = t;
          const el = window.__card;
          if (sel) el.shadowRoot.querySelector(sel)?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
          if (overrides) {
            const next = { ...el.hass.states };
            for (const [id, o] of Object.entries(overrides))
              next[id] = { ...next[id], ...o, attributes: { ...next[id].attributes, ...o.attributes } };
            el.hass = { ...el.hass, states: next };
          }
        },
        { sel: e.click ?? null, overrides: e.states ?? null, t }
      );
    }
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) {
        if (!window.__born.has(a)) window.__born.set(a, window.__eventAt);
        a.pause();
        a.currentTime = Math.max(0, t - window.__born.get(a));
      }
    }, t);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  }
  await page.close();
  const out = `${root}screenshots/${g.file}.gif`;
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%03d.png"),
    "-vf", `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop", "0", out,
  ]);
  rmSync(dir, { recursive: true });
  console.log(`screenshots/${g.file}.gif`);
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
for (const s of shots) {
  // A fresh page for each capture: the card script declares its classes and custom elements once per page.
  const page = await openCard(browser, s);
  await page.waitForTimeout(800);
  const box = await page.locator("#root").boundingBox();
  await page.screenshot({
    path: `${root}screenshots/${s.file}.png`,
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  console.log(`screenshots/${s.file}.png`);
  await page.close();
}
for (const g of gifs) await recordGif(browser, g);
await browser.close();
