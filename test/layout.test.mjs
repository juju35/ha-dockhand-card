// Browser test (Chromium through Playwright): at the narrowest widths of the Sections view (6 columns of a
// 320 px section, about 156 px, up to a full 460 px column), in long translations, the header title never
// collapses, no chip or button leaves the card, the mini card bars and values stay visible and the full
// card gauges fit. Skipped when Playwright or Chromium is not installed, except in CI, where it must run.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";

const src = readFileSync(new URL("../src/dockhand-card.js", import.meta.url), "utf8");
let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;border-radius:12px;border:1px solid #ddd;overflow:hidden}</style><slot></slot>";
  }
});`;

// Renders each card at each width and returns the measurements (px) of what must stay visible.
const measure = async (cards) => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Roboto,Helvetica,Arial,sans-serif}</style></head><body><div id="root"></div></body></html>`
  );
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const out = await page.evaluate(
    ({ cards, states, entities, devices }) => {
      const res = [];
      for (const { type, width, language, zoom } of cards) {
        const box = document.createElement("div");
        box.style.width = `${width}px`;
        document.getElementById("root").replaceChildren(box);
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, language });
        el.hass = { states, entities, devices, language, locale: { language }, callService: () => {} };
        box.appendChild(el);
        if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        const r = el.shadowRoot;
        const card = r.querySelector("ha-card").getBoundingClientRect();
        const rect = (n) => n.getBoundingClientRect();
        const outside = [...r.querySelectorAll(".header > *, .gauge, .metric > *, .foot > span, .count-tile")]
          .filter((n) => {
            const b = rect(n);
            return b.width > 0 && (b.right > card.right + 0.5 || b.left < card.left - 0.5);
          })
          .map((n) => n.className.baseVal ?? n.className);
        const name = r.querySelector(".header .name");
        const chip = r.querySelector(".header .chip");
        const center = (n) => (n ? rect(n).top + rect(n).height / 2 - card.top : null);
        res.push({
          type: zoom ? "mini-zoomed" : type,
          width,
          language,
          title: Math.round(rect(name).width),
          chip: chip ? Math.round(rect(chip).width) : null,
          titleCenter: center(name),
          chipCenter: center(chip),
          hasSub: !!r.querySelector(".header .sub"),
          outside,
          bars: [...r.querySelectorAll(".metric .bar")].map((n) => Math.round(rect(n).width)),
          clipped: [...r.querySelectorAll(".metric .v, .gauge .val b")].filter((n) => n.scrollWidth > n.clientWidth + 0.5).map((n) => n.textContent),
          gaugeOverflow: [...r.querySelectorAll(".gauge")].filter((g) => g.scrollWidth > g.clientWidth + 0.5).length,
        });
      }
      return res;
    },
    { cards, states, entities, devices }
  );
  await page.close();
  assert.deepEqual(errors, []);
  return out;
};

const WIDTHS = [156, 175, 200, 246, 300, 460];
const LANGS = ["en", "pl", "sr", "sr-Latn"];
const cards = [];
for (const width of WIDTHS)
  for (const language of LANGS)
    for (const [type, zoom] of [
      ["dockhand-mini-card", false],
      ["dockhand-mini-card", true],
      ["dockhand-card", false],
    ])
      cards.push({ type, width, language, zoom });

test("narrow widths: title kept, nothing out of the card, bars and values visible", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await measure(cards)) {
    const at = `${m.type} ${m.width}px ${m.language}`;
    t.diagnostic(`${at}: title ${m.title}px, chip ${m.chip}px, bars ${m.bars.join("/")}`);
    assert.ok(m.title >= 28, `${at}: title only ${m.title}px wide`);
    assert.deepEqual(m.outside, [], `${at}: out of the card`);
    for (const b of m.bars) assert.ok(b >= 20, `${at}: bar only ${b}px wide`);
    assert.deepEqual(m.clipped, [], `${at}: clipped values`);
    assert.equal(m.gaugeOverflow, 0, `${at}: gauge content wider than its column`);
  }
});

test("header chip lines up with the title line when there is a subtitle", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await measure([
    { type: "dockhand-card", width: 460, language: "en" },
    { type: "dockhand-mini-card", width: 460, language: "en" },
    { type: "dockhand-mini-card", width: 300, language: "pl" },
  ])) {
    assert.ok(m.hasSub, "the mock environment has a subtitle");
    assert.ok(Math.abs(m.chipCenter - m.titleCenter) <= 2, `${m.type} ${m.width}px: chip centre ${m.chipCenter} vs title centre ${m.titleCenter}`);
  }
});
