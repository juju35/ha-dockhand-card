import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS } = load("dockhand-card.js", ["STRINGS"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).sort();
  for (const code of ["fr", "de", "es"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    assert.deepEqual(Object.keys(STRINGS[code]).sort(), ref, `key mismatch in ${code}`);
    for (const key of ref) {
      assert.deepEqual(placeholders(STRINGS[code][key]), placeholders(STRINGS.en[key]), `placeholders of ${code}.${key}`);
    }
  }
});
