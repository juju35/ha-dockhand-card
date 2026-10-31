import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { gifs, shots } from "../scripts/screenshot-scenes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readme = readFileSync(`${root}README.md`, "utf8");
const scenes = [...shots.map((s) => ({ ...s, ext: "png" })), ...gifs.map((g) => ({ ...g, ext: "gif" }))];

// Everything but the file name and the theme: a light/dark pair must show exactly the same card state.
const setup = ({ file, theme, ...rest }) => rest;

test("screenshots: every light capture has a -dark twin with the exact same setup", () => {
  const byFile = new Map(scenes.map((s) => [`${s.file}.${s.ext}`, s]));
  for (const s of scenes) {
    if (s.theme === "dark") {
      assert.ok(s.file.endsWith("-dark"), `${s.file} is dark but not named -dark`);
      const light = byFile.get(`${s.file.slice(0, -"-dark".length)}.${s.ext}`);
      assert.ok(light, `${s.file}.${s.ext} has no light twin`);
      continue;
    }
    assert.equal(s.theme, "light", `${s.file}: unknown theme`);
    const dark = byFile.get(`${s.file}-dark.${s.ext}`);
    assert.ok(dark, `${s.file}.${s.ext} has no dark twin`);
    assert.deepEqual(setup(dark), setup(s), `${s.file}-dark.${s.ext} does not show the same state as ${s.file}.${s.ext}`);
  }
});

test("screenshots: the README shows every capture, and every capture it shows is rendered", () => {
  const referenced = new Set([...readme.matchAll(/\]\((screenshots\/[^)\s]+)\)/g)].map((m) => m[1]));
  const rendered = new Set(scenes.map((s) => `screenshots/${s.file}.${s.ext}`));
  assert.deepEqual([...referenced].sort(), [...rendered].sort());
});
