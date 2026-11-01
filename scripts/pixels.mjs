// Screenshots are only rewritten when their pixels change: a re-encode of the same picture (other zlib or
// encoder build, other GIF palette order) must not show up as a changed file in a pull request.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";

// Decoded frames of a PNG or GIF, as ffmpeg's per-frame checksums of the RGBA pixels: picture size, frame
// timing and every pixel are compared, the file bytes (compression, metadata) are not.
export const pixelHash = (file) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-pix_fmt", "rgba", "-f", "framemd5", "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\n")
    .filter((l) => l && !l.startsWith("#software"))
    .join("\n");

export const samePixels = (a, b) => existsSync(a) && existsSync(b) && pixelHash(a) === pixelHash(b);

// Moves the freshly rendered `tmp` onto `out` unless `out` already shows the very same pixels.
// Returns true when `out` was (re)written.
export const replaceIfChanged = (tmp, out) => {
  if (samePixels(tmp, out)) {
    rmSync(tmp);
    return false;
  }
  // Copy, not rename: the temporary folder may be on another file system.
  copyFileSync(tmp, out);
  rmSync(tmp);
  return true;
};
