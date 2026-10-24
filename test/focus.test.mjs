// Browser test (Chromium through Playwright): a list reordered while one of its buttons has the keyboard
// focus must not hand that focus to another row. Skipped when Playwright or Chromium is not installed,
// except in CI, where it must run. CHROMIUM_PATH points to a local Chromium if needed.
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

// Renders the full card with the stacks list open, focuses the start/stop button of `stack`, applies
// `change` to the states, then presses Enter. Returns the service calls and the focused entity.
const run = async ({ stack, change, noMoveBefore = false }) => {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent("<!doctype html><body><div id=root></div></body>");
  // Older browsers: no moveBefore, a moved node loses the focus. The shadow root inherits it from DocumentFragment.
  if (noMoveBefore) {
    await page.addScriptTag({
      content: "for (const c of [Element, DocumentFragment, Document]) delete c.prototype.moveBefore;",
    });
  }
  await page.addScriptTag({
    content: `customElements.define("ha-card", class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<slot></slot>"; } });`,
  });
  await page.addScriptTag({ content: src });
  const res = await page.evaluate(
    ({ states, entities, devices, stack, change }) => {
      window.confirm = () => true;
      window.calls = [];
      const hass = (st) => ({ states: st, entities, devices, language: "en", callService: (d, s, data) => window.calls.push(`${d}.${s} ${data.entity_id}`) });
      const el = document.createElement("dockhand-card");
      el.setConfig({ type: "custom:dockhand-card", expand_stacks: true, show_stats: false, show_counts: false });
      el.hass = hass(states);
      document.getElementById("root").appendChild(el);
      el.shadowRoot.querySelector(`button[data-action="toggle"][data-entity="switch.host_stacks_${stack}"]`).focus();
      const next = { ...states };
      for (const [id, state] of Object.entries(change)) next[id] = { ...states[id], state };
      el.hass = hass(next);
      // The patched DOM matches a fresh render of the same HTML.
      const tpl = document.createElement("template");
      tpl.innerHTML = el._html;
      const fresh = document.createElement("div");
      fresh.append(tpl.content.cloneNode(true));
      return { focused: el.shadowRoot.activeElement?.dataset?.entity ?? null, faithful: el.shadowRoot.innerHTML === fresh.innerHTML };
    },
    { states, entities, devices, stack, change }
  );
  await page.keyboard.press("Enter");
  const calls = await page.evaluate(() => window.calls);
  await page.close();
  return { ...res, calls, errors };
};

// "auth" stops: it becomes a problem and moves to the top of the list, shifting every row below it.
const STOP_AUTH = { "sensor.host_stacks_auth_statut": "stopped", "switch.host_stacks_auth": "off" };

test("reordered stacks: the focus stays on the same stack and Enter acts on it", async (t) => {
  if (skip) return t.skip(skip);
  const r = await run({ stack: "auth", change: STOP_AUTH });
  assert.deepEqual(r.errors, []);
  assert.equal(r.faithful, true);
  assert.equal(r.focused, "switch.host_stacks_auth");
  assert.deepEqual(r.calls, ["switch.turn_on switch.host_stacks_auth"]);
});

test("reordered stacks without moveBefore: Enter never acts on another stack", async (t) => {
  if (skip) return t.skip(skip);
  const r = await run({ stack: "auth", change: STOP_AUTH, noMoveBefore: true });
  assert.deepEqual(r.errors, []);
  assert.equal(r.faithful, true);
  assert.ok(r.focused === null || r.focused === "switch.host_stacks_auth", `focus moved to ${r.focused}`);
  assert.ok(r.calls.every((c) => c.endsWith(" switch.host_stacks_auth")), `unexpected calls: ${r.calls}`);
});
