import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

// Needs ffmpeg (already required by the screenshot script for the GIFs); skipped without it.
const ffmpeg = (() => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
const make = (dir, name, color, extra = []) => {
  const file = join(dir, name);
  execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", `color=${color}:s=16x8:d=0.2:r=10`, ...extra, "-y", file]);
  return file;
};

test("screenshots: a capture is only rewritten when its decoded pixels change", { skip: !ffmpeg && "ffmpeg not on PATH" }, async () => {
  const { pixelHash, replaceIfChanged } = await import("../scripts/pixels.mjs");
  const dir = mkdtempSync(join(tmpdir(), "dh-pixels-"));
  try {
    // Same picture, other compression: other bytes, same pixels.
    const a = make(dir, "a.png", "red", ["-frames:v", "1", "-compression_level", "0"]);
    const b = make(dir, "b.png", "red", ["-frames:v", "1", "-compression_level", "9"]);
    assert.notDeepEqual(readFileSync(a), readFileSync(b));
    assert.equal(pixelHash(a), pixelHash(b));
    const before = readFileSync(a);
    assert.equal(replaceIfChanged(b, a), false);
    assert.deepEqual(readFileSync(a), before);
    assert.equal(existsSync(b), false, "the unused render is removed");
    // Other pixels: the file is replaced.
    const c = make(dir, "c.png", "blue", ["-frames:v", "1"]);
    const blue = readFileSync(c);
    assert.equal(replaceIfChanged(c, a), true);
    assert.deepEqual(readFileSync(a), blue);
    // First render of a capture: written.
    const d = make(dir, "d.png", "red", ["-frames:v", "1"]);
    assert.equal(replaceIfChanged(d, join(dir, "new.png")), true);
    // GIFs: every frame is compared.
    const g1 = make(dir, "g1.gif", "red");
    const g2 = make(dir, "g2.gif", "red");
    const g3 = make(dir, "g3.gif", "green");
    assert.equal(pixelHash(g1), pixelHash(g2));
    assert.notEqual(pixelHash(g1), pixelHash(g3));
  } finally {
    rmSync(dir, { recursive: true });
  }
});
