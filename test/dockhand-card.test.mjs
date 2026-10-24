import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { DockhandCard, DockhandMiniCard, resolve, sameSig } = load("dockhand-card.js", [
  "DockhandCard",
  "DockhandMiniCard",
  "resolve",
  "sameSig",
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
