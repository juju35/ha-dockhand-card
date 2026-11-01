import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, lang, tn, pluralLocale, DockhandCardEditor } = load("dockhand-card.js", ["STRINGS", "lang", "tn", "pluralLocale", "DockhandCardEditor"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
// Plural forms (key_one, key_few, key_many…) are optional per language: the key without suffix is the fallback.
const PLURAL = /_(zero|one|two|few|many|other)$/;

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).filter((k) => !PLURAL.test(k)).sort();
  for (const code of ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    const keys = Object.keys(STRINGS[code]);
    assert.deepEqual(keys.filter((k) => !PLURAL.test(k)).sort(), ref, `key mismatch in ${code}`);
    for (const k of keys.filter((k) => PLURAL.test(k))) {
      const base = k.replace(PLURAL, "");
      assert.ok(base in STRINGS.en, `${code}.${k} has no base key in en`);
      assert.ok(String(STRINGS[code][k]).trim() !== "", `${code}.${k} is empty`);
      assert.deepEqual(placeholders(STRINGS[code][k]), placeholders(STRINGS.en[base]), `placeholders of ${code}.${k}`);
    }
    // A key with plural forms covers every category the language uses for a realistic count, 0 to 1000
    // (other may use the base key; fr, es, it and pt "many" only starts at a million).
    const bases = new Set(keys.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, "")));
    const rules = new Intl.PluralRules(pluralLocale(code));
    const cats = [...new Set(Array.from({ length: 1001 }, (_, n) => rules.select(n)))].filter((c) => c !== "other");
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
  assert.equal(tn(en, {}, "cores", 2), "cores");
  assert.equal(tn({ locale: { language: "fr" } }, {}, "containers_lc", 1, "container_lc"), "conteneur");
});

// Counted nouns as shown: the mini card footer (stacks, images, updates), the CPU gauge (cores) and the
// stack rows (containers). Counts 1, 2, 5, 21 and 22 cover the one / few / many forms of every language.
const COUNTED = [
  ["stacks_lc"],
  ["images_lc"],
  ["updates_lc"],
  ["cores"],
  ["containers_lc", "container_lc"],
];
const counted = (code, n) => COUNTED.map(([key, oneKey]) => `${n} ${tn({ locale: { language: code } }, {}, key, n, oneKey)}`).join(", ");

test("I18N plurals: 1 is singular in every language", () => {
  const one = {
    en: "1 stack, 1 image, 1 update, 1 core, 1 container",
    fr: "1 stack, 1 image, 1 mise à jour, 1 cœur, 1 conteneur",
    de: "1 Stack, 1 Image, 1 Update, 1 Kern, 1 Container",
    es: "1 stack, 1 imagen, 1 actualización, 1 núcleo, 1 contenedor",
    it: "1 stack, 1 immagine, 1 aggiornamento, 1 core, 1 container",
    nl: "1 stack, 1 image, 1 update, 1 core, 1 container",
    pt: "1 stack, 1 imagem, 1 atualização, 1 núcleo, 1 contentor",
    pl: "1 stos, 1 obraz, 1 aktualizacja, 1 rdzeń, 1 kontener",
    sr: "1 стек, 1 слика, 1 ажурирање, 1 језгро, 1 контејнер",
    "sr-Latn": "1 stek, 1 slika, 1 ažuriranje, 1 jezgro, 1 kontejner",
  };
  assert.deepEqual(Object.keys(one).sort(), Object.keys(STRINGS).sort());
  for (const [code, text] of Object.entries(one)) assert.equal(counted(code, 1), text, code);
  // Above one, the plural, as before.
  assert.equal(counted("en", 2), "2 stacks, 2 images, 2 updates, 2 cores, 2 containers");
  assert.equal(counted("fr", 21), "21 stacks, 21 images, 21 mises à jour, 21 cœurs, 21 conteneurs");
  assert.equal(counted("de", 5), "5 Stacks, 5 Images, 5 Updates, 5 Kerne, 5 Container");
  assert.equal(counted("es", 22), "22 stacks, 22 imágenes, 22 actualizaciones, 22 núcleos, 22 contenedores");
  assert.equal(counted("it", 2), "2 stack, 2 immagini, 2 aggiornamenti, 2 core, 2 container");
  assert.equal(counted("nl", 2), "2 stacks, 2 images, 2 updates, 2 cores, 2 containers");
});

test("I18N plurals: European Portuguese keeps 0 in the plural", () => {
  assert.equal(counted("pt", 0), "0 stacks, 0 imagens, 0 atualizações, 0 núcleos, 0 contentores");
  assert.equal(counted("pt", 2), "2 stacks, 2 imagens, 2 atualizações, 2 núcleos, 2 contentores");
  // French puts 0 in the singular (one category), as written in French.
  assert.equal(counted("fr", 0), "0 stack, 0 image, 0 mise à jour, 0 cœur, 0 conteneur");
});

test("I18N plurals: Serbian (Cyrillic and Latin) one / few / other forms for 1, 2, 5, 21, 22", () => {
  const sr = {
    1: "1 стек, 1 слика, 1 ажурирање, 1 језгро, 1 контејнер",
    2: "2 стека, 2 слике, 2 ажурирања, 2 језгра, 2 контејнера",
    5: "5 стекова, 5 слика, 5 ажурирања, 5 језгара, 5 контејнера",
    21: "21 стек, 21 слика, 21 ажурирање, 21 језгро, 21 контејнер",
    22: "22 стека, 22 слике, 22 ажурирања, 22 језгра, 22 контејнера",
  };
  const srLatn = {
    1: "1 stek, 1 slika, 1 ažuriranje, 1 jezgro, 1 kontejner",
    2: "2 steka, 2 slike, 2 ažuriranja, 2 jezgra, 2 kontejnera",
    5: "5 stekova, 5 slika, 5 ažuriranja, 5 jezgara, 5 kontejnera",
    21: "21 stek, 21 slika, 21 ažuriranje, 21 jezgro, 21 kontejner",
    22: "22 steka, 22 slike, 22 ažuriranja, 22 jezgra, 22 kontejnera",
  };
  for (const [n, text] of Object.entries(sr)) assert.equal(counted("sr", Number(n)), text, `sr ${n}`);
  for (const [n, text] of Object.entries(srLatn)) assert.equal(counted("sr-Latn", Number(n)), text, `sr-Latn ${n}`);
});

test("I18N plurals: Polish 1, 2, 5, 21, 22", () => {
  assert.equal(counted("pl", 2), "2 stosy, 2 obrazy, 2 aktualizacje, 2 rdzenie, 2 kontenery");
  assert.equal(counted("pl", 5), "5 stosów, 5 obrazów, 5 aktualizacji, 5 rdzeni, 5 kontenerów");
  assert.equal(counted("pl", 21), "21 stosów, 21 obrazów, 21 aktualizacji, 21 rdzeni, 21 kontenerów");
  assert.equal(counted("pl", 22), "22 stosy, 22 obrazy, 22 aktualizacje, 22 rdzenie, 22 kontenery");
});

test("I18N plurals: a count that is not a number (dash, unavailable) keeps the base form", () => {
  for (const code of Object.keys(STRINGS)) {
    for (const [key] of COUNTED) {
      assert.equal(tn({ locale: { language: code } }, {}, key, "—"), STRINGS[code][key], `${code}.${key}`);
      assert.equal(tn({ locale: { language: code } }, {}, key, null), STRINGS[code][key], `${code}.${key} null`);
    }
  }
});

test("README: the features list names every language the cards ship", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find((l) => /^- Light and dark mode/.test(l));
  assert.ok(line, "no language line in the features list");
  for (const name of ["English", "French", "German", "Spanish", "Serbian", "Italian", "Dutch", "Portuguese", "Polish"]) {
    assert.match(line, new RegExp(name), `${name} missing from: ${line}`);
  }
  // The translations table lists every code.
  for (const code of Object.keys(STRINGS)) assert.match(readme, new RegExp(`\\| \`${code}\` \\|`), `${code} missing from the table`);
});
