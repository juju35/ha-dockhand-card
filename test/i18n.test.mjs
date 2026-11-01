import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, lang, DockhandCardEditor } = load("dockhand-card.js", ["STRINGS", "lang", "DockhandCardEditor"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).sort();
  for (const code of ["fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    assert.deepEqual(Object.keys(STRINGS[code]).sort(), ref, `key mismatch in ${code}`);
    for (const key of ref) {
      const value = STRINGS[code][key];
      if (Array.isArray(STRINGS.en[key])) {
        assert.ok(Array.isArray(value), `${code}.${key} should be an array`);
        assert.equal(value.length, STRINGS.en[key].length, `length of ${code}.${key}`);
      }
      assert.ok(String(value).trim() !== "", `${code}.${key} is empty`);
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
  assert.equal(lang(hass("ja")), "en");
  assert.equal(lang(hass("sr-Latn"), { language: "de" }), "de", "config.language wins over hass");
  assert.equal(lang({ language: "sr-Latn" }), "sr-Latn", "hass.language is used without hass.locale");
});

test("I18N resolution: Italian, Dutch, Portuguese and Polish", () => {
  const hass = (language) => ({ locale: { language } });
  assert.equal(lang(hass("it-IT")), "it");
  assert.equal(lang(hass("nl-BE")), "nl");
  assert.equal(lang(hass("pt")), "pt");
  assert.equal(lang(hass("pt-BR")), "pt", "Brazilian Portuguese falls back to European Portuguese");
  assert.equal(lang(hass("pl-PL")), "pl");
  assert.equal(lang(hass("sr-Latn")), "sr-Latn");
  assert.equal(lang(hass("ja")), "en");
});

test("Editor: the language list offers every translation, plus automatic", () => {
  const editor = new DockhandCardEditor();
  editor._config = {};
  const field = editor._schema([]).find((s) => s.name === "language");
  // The card runs in another realm (vm): copy the values into a local array before comparing.
  const values = [...field.selector.select.options].map((o) => o.value);
  assert.deepEqual([...values].sort(), ["", ...Object.keys(STRINGS)].sort());
  const labels = Object.fromEntries(field.selector.select.options.map((o) => [o.value, o.label]));
  assert.equal(labels.it, "Italiano");
  assert.equal(labels.nl, "Nederlands");
  assert.equal(labels.pt, "Português");
  assert.equal(labels.pl, "Polski");
});
