import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (f) => readFileSync(`${root}${f}`, "utf8");

// One Biome version everywhere: .pre-commit-config.yaml is the source of truth (bumped by Dependabot).
test("Biome: one version in pre-commit, biome.json and the Lint workflow", () => {
  const precommit = read(".pre-commit-config.yaml");
  const rev = precommit.match(/biomejs\/pre-commit\s*\n\s*rev:\s*"?v?([\d.]+)"?/)?.[1];
  assert.ok(rev, "Biome rev not found in .pre-commit-config.yaml");
  assert.match(precommit, new RegExp(`@biomejs/biome@${rev.replace(/\./g, "\\.")}"`), "additional_dependencies differ from rev");
  assert.equal(JSON.parse(read("biome.json")).$schema, `https://biomejs.dev/schemas/${rev}/schema.json`);
  const lint = read(".github/workflows/lint.yml");
  assert.doesNotMatch(lint, /version:\s*\d+\.\d+\.\d+/, "lint.yml hardcodes a Biome version");
  assert.match(lint, /\.pre-commit-config\.yaml/, "lint.yml does not read the version from .pre-commit-config.yaml");
});
