import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, lang } = load("dockhand-card.js", ["STRINGS", "lang"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).sort();
  for (const code of ["fr", "de", "es", "sr", "sr-Latn"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    assert.deepEqual(Object.keys(STRINGS[code]).sort(), ref, `key mismatch in ${code}`);
    for (const key of ref) {
      const value = STRINGS[code][key];
      if (Array.isArray(STRINGS.en[key])) {
        assert.ok(Array.isArray(value), `${code}.${key} should be an array`);
        assert.equal(value.length, STRINGS.en[key].length, `length of ${code}.${key}`);
      }
      assert.deepEqual(placeholders(value), placeholders(STRINGS.en[key]), `placeholders of ${code}.${key}`);
    }
  }
});

test("I18N script: sr is Cyrillic and sr-Latn is Latin (proper nouns, brands and units aside)", () => {
  const keep = /CPU|Dockhand|Home Assistant|URL|\{\w+\}/g;
  for (const [key, value] of Object.entries(STRINGS.sr)) {
    assert.doesNotMatch(String(value).replace(keep, ""), /[A-Za-z]/, `Latin letter in sr.${key}`);
  }
  for (const [key, value] of Object.entries(STRINGS["sr-Latn"])) {
    assert.doesNotMatch(String(value), /[Ѐ-ӿ]/, `Cyrillic letter in sr-Latn.${key}`);
  }
});

test("I18N resolution: full code, then the part before the dash, then en", () => {
  const hass = (language) => ({ locale: { language } });
  assert.equal(lang(hass("fr-FR")), "fr");
  assert.equal(lang(hass("sr-Latn")), "sr-Latn");
  assert.equal(lang(hass("sr")), "sr");
  assert.equal(lang(hass("pt-BR")), "en");
  assert.equal(lang(hass("sr-Latn"), { language: "de" }), "de", "config.language wins over hass");
  assert.equal(lang({ language: "sr-Latn" }), "sr-Latn", "hass.language is used without hass.locale");
});
