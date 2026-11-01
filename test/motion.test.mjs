import assert from "node:assert/strict";
import { test } from "node:test";
import { entities, devices as mockDevices, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const { DockhandCard, DockhandMiniCard } = load("dockhand-card.js", ["DockhandCard", "DockhandMiniCard"]);

const REDUCED = "@media (prefers-reduced-motion: reduce)";
const rules = (css) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));

// The <style> the card really renders, cut into what lies outside the reduced-motion blocks and what lies inside.
const style = (Cls, config) => {
  const el = new Cls();
  el._config = config;
  el._hass = { states, entities, devices: mockDevices, language: "en" };
  const css = el._render().match(/<style>([\s\S]*?)<\/style>/)[1];
  let outside = "";
  const reduced = [];
  let last = 0;
  for (let at = css.indexOf(REDUCED); at >= 0; at = css.indexOf(REDUCED, last)) {
    outside += css.slice(last, at);
    const open = css.indexOf("{", at);
    let depth = 0;
    let end = open;
    for (; end < css.length; end++) {
      if (css[end] === "{") depth++;
      else if (css[end] === "}" && --depth === 0) break;
    }
    reduced.push({ at, body: css.slice(open + 1, end) });
    last = end + 1;
  }
  outside += css.slice(last);
  return { css, outside, reduced };
};

const animates = (body) => /\b(transition|animation)\s*:/.test(body) && !/\b(transition|animation)\s*:\s*none\b/.test(body);

const cards = {
  "full card": [DockhandCard, { show_containers: true }],
  "mini card": [DockhandMiniCard, {}],
};

for (const [name, [Cls, config]] of Object.entries(cards)) {
  test(`${name}: prefers-reduced-motion turns off every transition and animation`, () => {
    const { css, outside, reduced } = style(Cls, config);
    const animated = rules(outside).filter((r) => animates(r.body));
    assert.ok(animated.length > 0, "expected the card to animate something");
    assert.ok(reduced.length > 0, `no ${REDUCED} block`);
    // A blanket rule with !important wins over every transition, whatever its selector or position.
    const blanket = reduced.some((b) =>
      rules(b.body).some(
        (r) =>
          r.sel.split(",").some((s) => s.trim() === "*") &&
          /transition[^;]*:\s*none\s*!important/.test(r.body) &&
          /animation[^;]*:\s*none\s*!important/.test(r.body)
      )
    );
    assert.ok(blanket, `${REDUCED} must set transition and animation to none !important on *`);
    // Sanity: the block is part of the rendered style, after the last animated rule.
    const lastAnimated = Math.max(...animated.map((r) => css.indexOf(r.body)));
    assert.ok(reduced.at(-1).at > lastAnimated, `${REDUCED} comes before an animated rule`);
  });
}
