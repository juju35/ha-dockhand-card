import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, lang, tn, DockhandCardEditor } = load("dockhand-card.js", ["STRINGS", "lang", "tn", "DockhandCardEditor"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
// Plural forms (key_one, key_few, key_many…) are optional per language: the key without suffix is the fallback.
const PLURAL = /_(zero|one|two|few|many|other)$/;

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).sort();
  for (const code of ["fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    const keys = Object.keys(STRINGS[code]);
    assert.deepEqual(keys.filter((k) => !PLURAL.test(k)).sort(), ref, `key mismatch in ${code}`);
    for (const k of keys.filter((k) => PLURAL.test(k))) {
      const base = k.replace(PLURAL, "");
      assert.ok(base in STRINGS.en, `${code}.${k} has no base key in en`);
      assert.ok(String(STRINGS[code][k]).trim() !== "", `${code}.${k} is empty`);
      assert.deepEqual(placeholders(STRINGS[code][k]), placeholders(STRINGS.en[base]), `placeholders of ${code}.${k}`);
    }
    // A key with plural forms covers every category of the language (other may use the base key).
    const bases = new Set(keys.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, "")));
    const cats = new Intl.PluralRules(code).resolvedOptions().pluralCategories.filter((c) => c !== "other");
    for (const base of bases) for (const c of cats) assert.ok(`${base}_${c}` in STRINGS[code], `missing ${code}.${base}_${c}`);
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
  assert.equal(labels.pt, "Português (Portugal)");
  assert.equal(labels.pl, "Polski");
});

test("I18N plurals: Polish counted nouns follow Intl.PluralRules, other languages keep their forms", () => {
  const pl = { locale: { language: "pl" } };
  const forms = (key, oneKey) => [0, 1, 2, 4, 5, 12, 22, 25].map((n) => `${n} ${tn(pl, {}, key, n, oneKey)}`);
  assert.deepEqual(forms("cores"), ["0 rdzeni", "1 rdzeń", "2 rdzenie", "4 rdzenie", "5 rdzeni", "12 rdzeni", "22 rdzenie", "25 rdzeni"]);
  assert.deepEqual(forms("containers_lc", "container_lc").slice(1, 5), ["1 kontener", "2 kontenery", "4 kontenery", "5 kontenerów"]);
  assert.deepEqual(forms("stacks_lc").slice(1, 4), ["1 stos", "2 stosy", "4 stosy"]);
  assert.deepEqual(forms("images_lc").slice(1, 4), ["1 obraz", "2 obrazy", "4 obrazy"]);
  assert.deepEqual(forms("updates_lc").slice(1, 4), ["1 aktualizacja", "2 aktualizacje", "4 aktualizacje"]);
  assert.equal(tn(pl, {}, "stacks_lc", "—"), "stosów", "a dash keeps the fallback form");
  const en = { locale: { language: "en" } };
  assert.equal(tn(en, {}, "containers_lc", 1, "container_lc"), "container");
  assert.equal(tn(en, {}, "containers_lc", 3, "container_lc"), "containers");
  assert.equal(tn(en, {}, "cores", 1), "cores", "without plural forms, the key as before");
  assert.equal(tn({ locale: { language: "fr" } }, {}, "containers_lc", 1, "container_lc"), "conteneur");
});
