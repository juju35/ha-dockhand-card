import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { DockhandCard, DockhandMiniCard, resolve, sameSig, fmtBytesPair } = load("dockhand-card.js", [
  "DockhandCard",
  "DockhandMiniCard",
  "resolve",
  "sameSig",
  "fmtBytesPair",
]);

const devices = {
  env: { id: "env", name: "Docker host", model: "Environment", via_device_id: null },
  grp: { id: "grp", name: "Docker host – Containers", model: "Environment Group", via_device_id: "env" },
  ct: { id: "ct", name: "Docker host – Containers – web", model: "Container", via_device_id: "grp" },
};
const entities = {};
const add = (entity_id, device_id, translation_key) =>
  (entities[entity_id] = { entity_id, device_id, platform: "dockhand", translation_key });
add("sensor.cpu", "env", "cpu_usage");
add("sensor.containers", "env", "containers");
add("sensor.web_state", "ct", "state");

const XSS = `<img src=x onerror="alert(1)">`;
const baseStates = () => ({
  "sensor.cpu": { entity_id: "sensor.cpu", state: "12", attributes: { cpu_count: XSS } },
  "sensor.containers": { entity_id: "sensor.containers", state: "3", attributes: { running: XSS, pending_updates_total: XSS } },
  "sensor.web_state": { entity_id: "sensor.web_state", state: "running", attributes: {} },
  "light.kitchen": { entity_id: "light.kitchen", state: "off", attributes: {} },
});

const make = (Cls, states, config = {}) => {
  const el = new Cls();
  el._config = config;
  el._hass = { states, entities, devices, language: "en" };
  return el;
};

test("resolve groups containers under their environment", () => {
  const model = resolve({ entities, devices });
  assert.equal(model.envs.length, 1);
  assert.equal(model.envs[0].containers[0].name, "web");
});

test("attributes from the API are escaped in the full card", () => {
  const html = make(DockhandCard, baseStates())._render();
  assert.ok(!html.includes("<img src=x"), "raw attribute injected");
  assert.ok(html.includes("&lt;img src=x"));
});

test("attributes from the API are escaped in the mini card", () => {
  const html = make(DockhandMiniCard, baseStates())._render();
  assert.ok(!html.includes("<img src=x"), "raw attribute injected");
});

test("an unrelated state change keeps the render signature", () => {
  const states = baseStates();
  const before = make(DockhandCard, states)._signature();
  const after = make(DockhandCard, { ...states, "light.kitchen": { ...states["light.kitchen"], state: "on" } })._signature();
  assert.ok(sameSig(before, after));
});

test("a change of a container state changes the render signature", () => {
  const states = baseStates();
  const before = make(DockhandCard, states)._signature();
  const next = { ...states, "sensor.web_state": { ...states["sensor.web_state"], state: "exited" } };
  assert.ok(!sameSig(before, make(DockhandCard, next)._signature()));
});

test("dockhand_url is only used for an http(s) address", () => {
  const env = resolve({ entities, devices }).envs[0];
  const card = (url) => make(DockhandCard, baseStates(), { dockhand_url: url })._dockhandUrl(env);
  assert.equal(card("http://nas.local:3000"), "http://nas.local:3000");
  assert.equal(card("HTTPS://dockhand.example"), "HTTPS://dockhand.example");
  assert.ok(!card("javascript:alert(1)").startsWith("javascript"));
  assert.ok(!card(" javascript:alert(1)").includes("javascript"));
});

test("unknown or unavailable counters are shown as a dash", () => {
  const ents = { ...entities, "sensor.images": { entity_id: "sensor.images", device_id: "env", platform: "dockhand", translation_key: "image_count" } };
  const states = { ...baseStates(), "sensor.images": { entity_id: "sensor.images", state: "unavailable", attributes: {} } };
  for (const Cls of [DockhandCard, DockhandMiniCard]) {
    const el = make(Cls, states);
    el._hass.entities = ents;
    const html = el._render();
    assert.ok(!html.includes("unavailable"), Cls.name);
    assert.ok(html.includes("—"), Cls.name);
  }
});

test("getCardSize follows the sections shown and the open lists", () => {
  const states = baseStates();
  assert.equal(make(DockhandCard, states, {}).getCardSize(), 4);
  assert.equal(make(DockhandCard, states, { show_stats: false, show_counts: false }).getCardSize(), 1);
  assert.equal(make(DockhandCard, states, { show_containers: true }).getCardSize(), 5);
  assert.equal(make(DockhandCard, states, { show_containers: true, expand_containers: true }).getCardSize(), 6);
});

// Mini card detail button: a mini card whose renders are captured instead of patched into a DOM.
const zoomCard = (config = {}) => {
  const el = make(DockhandMiniCard, baseStates(), config);
  el._hass.language = config.language || "en";
  el._update = () => {
    el.html = el._render();
  };
  el.shadowRoot.querySelector = () => null;
  el._update();
  return el;
};
const node = (localName) => ({ localName });
const click = (path, extra = {}) => ({ composedPath: () => path, stopPropagation() {}, detail: 1, ...extra });
const zoomButton = () => click([], { target: { closest: (sel) => (sel === ".zoom" ? {} : null) } });

test("the mini card detail button switches to the full card content and back", () => {
  const el = zoomCard();
  const full = make(DockhandCard, el._hass.states);
  full._hass = el._hass;
  assert.match(el.html, /class="metric/);
  // Rightmost header element.
  assert.match(el.html, /<button type="button" class="zoom" title="Show the full card">[\s\S]*?<\/button>\s*<\/div>/);
  assert.equal(el.getCardSize(), 3);
  let stopped = false;
  el._zoomClick({ ...zoomButton(), stopPropagation: () => (stopped = true) });
  assert.equal(stopped, true);
  assert.equal(el._zoomed, true);
  assert.doesNotMatch(el.html, /class="metric/);
  assert.match(el.html, /class="gauges/);
  assert.equal(el.html.replace(/<button type="button" class="zoom"[\s\S]*?<\/button>/, ""), full._render());
  assert.match(el.html, /<button type="button" class="zoom" title="Back to the compact view">/);
  assert.equal(el.getCardSize(), full.getCardSize());
  assert.deepEqual({ ...el.getGridOptions() }, { ...full.getGridOptions() });
  el._zoomClick(zoomButton());
  assert.equal(el._zoomed, false);
  assert.match(el.html, /class="metric/);
  assert.equal(el.getCardSize(), 3);
});

test("a click outside the mini card collapses it, a click inside or in a dialog does not", () => {
  const el = zoomCard({ language: "fr" });
  assert.match(el.html, /title="Afficher la carte complète"/);
  el._zoomClick(zoomButton());
  assert.match(el.html, /title="Revenir à la vue compacte"/);
  el._onUnzoom(click([node("div"), el, node("body")]));
  assert.equal(el._zoomed, true);
  for (const dialog of ["ha-more-info-dialog", "ha-dialog", "dialog"]) {
    el._onUnzoom(click([node("div"), node(dialog), node("body")]));
    assert.equal(el._zoomed, true, dialog);
  }
  // Other clicks on the card leave it as it is.
  el._zoomClick(click([el], { target: { closest: () => null } }));
  assert.equal(el._zoomed, true);
  el._onUnzoom(click([node("div"), node("body")]));
  assert.equal(el._zoomed, false);
  assert.match(el.html, /class="metric/);
});

test("zoom: false removes the mini card detail button, the full card has none", () => {
  assert.doesNotMatch(zoomCard({ zoom: false }).html, /class="zoom"/);
  assert.doesNotMatch(make(DockhandCard, baseStates())._render(), /class="zoom"/);
});

test("memory label keeps the used unit when it differs from the total's", () => {
  const GB = 1024 ** 3;
  assert.equal(fmtBytesPair(980 * 1024 ** 2, 62.5 * GB), "980 MB / 62.5 GB");
  assert.equal(fmtBytesPair(12.3 * GB, 62.5 * GB), "12.3 / 62.5 GB");
});

test("getCardSize applies the only_problems filter, as the rendered sections do", () => {
  const devs = { ...devices, ct2: { id: "ct2", name: "Docker host – Containers – db", model: "Container", via_device_id: "grp" } };
  const ents = { ...entities, "sensor.db_state": { entity_id: "sensor.db_state", device_id: "ct2", platform: "dockhand", translation_key: "state" } };
  const states = { ...baseStates(), "sensor.db_state": { entity_id: "sensor.db_state", state: "exited", attributes: {} } };
  const mk = (config) => {
    const el = new DockhandCard();
    el._config = config;
    el._hass = { states, entities: ents, devices: devs, language: "en" };
    return el;
  };
  const config = { show_containers: true, expand_containers: true };
  assert.equal(mk(config).getCardSize(), 7); // header + gauges + counts + title + both containers
  assert.equal(mk({ ...config, only_problems: true }).getCardSize(), 6); // only the stopped container is listed
});

test("restart asks for an in-card confirmation, Cancel closes it without acting", async () => {
  const el = make(DockhandCard, baseStates());
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {
    let html = el._render();
    if (el._confirm) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${el._confirmHtml()}</ha-card>`);
    el.html = html;
  };
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  await null;
  assert.ok(el._confirm, "no confirmation opened");
  assert.deepEqual(calls, []);
  assert.match(el.html, /class="dialog-open"/);
  assert.match(el.html, /Restart web\?/);
  el._onClick(click([{ dataset: { action: "confirm_cancel" } }]));
  await null;
  assert.equal(el._confirm, null);
  assert.deepEqual(calls, []);
  assert.doesNotMatch(el.html, /class="dialog-open"/);
});

test("stopping asks for an in-card confirmation, starting does not", async () => {
  const states = { ...baseStates(), "switch.web": { entity_id: "switch.web", state: "on", attributes: {} } };
  const el = make(DockhandCard, states);
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {};
  el._onClick(click([{ dataset: { action: "toggle", entity: "switch.web", label: "web" } }]));
  await null;
  assert.ok(el._confirm);
  assert.deepEqual(calls, []);
  el._onClick(click([{ dataset: { action: "confirm_ok" } }]));
  await null;
  assert.deepEqual(calls, ["switch.turn_off switch.web"]);
  assert.equal(el._confirm, null);
  // Starting a stopped switch needs no confirmation.
  const el2 = make(DockhandCard, baseStates());
  const calls2 = [];
  el2._hass.callService = (d, s, data) => calls2.push(`${d}.${s} ${data.entity_id}`);
  el2._update = () => {};
  el2._onClick(click([{ dataset: { action: "toggle", entity: "switch.db", label: "db" } }]));
  await null;
  assert.equal(el2._confirm ?? null, null);
  assert.deepEqual(calls2, ["switch.turn_on switch.db"]);
});
