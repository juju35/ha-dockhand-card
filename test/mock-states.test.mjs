import assert from "node:assert/strict";
import { test } from "node:test";
import { entities, states } from "../scripts/mock-states.mjs";

// The screenshots in the README are rendered from these mocks: the environment counters must match
// the stacks and containers they list, otherwise a tile and its section show two different totals.
const byKey = (key) => Object.values(entities).filter((e) => e.translation_key === key).map((e) => states[e.entity_id]);
const env = (key) => byKey(key).find((s) => s.entity_id.startsWith("sensor.host_") && entities[s.entity_id].device_id === "env");

test("mock stacks counter matches the generated stacks", () => {
  const list = byKey("status").map((s) => s.state);
  const stacks = env("stacks");
  assert.equal(Number(stacks.state), list.length);
  assert.equal(stacks.attributes.running, list.filter((s) => s === "running").length);
  assert.equal(stacks.attributes.stopped, list.filter((s) => s === "stopped").length);
  assert.equal(stacks.attributes.partial, list.filter((s) => s === "partial").length);
});

test("mock containers counter matches the generated containers", () => {
  const list = byKey("state").map((s) => s.state);
  const containers = env("containers");
  assert.equal(Number(containers.state), list.length);
  assert.equal(containers.attributes.running, list.filter((s) => s === "running").length);
  assert.equal(containers.attributes.stopped, list.filter((s) => s === "exited").length);
  assert.equal(containers.attributes.unhealthy, byKey("health").filter((s) => s.state === "unhealthy").length);
});
