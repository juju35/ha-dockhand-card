# Changelog

## 1.11.6 - 2026-11-01

### Fixed
- Counted nouns are singular for 1 in every language ("1 update", "1 stack", "1 image", "1 core" instead of "1 updates"…), and Serbian (Cyrillic and Latin) uses its three forms: 1 стек, 2 стека, 5 стекова, 21 стек (same for images, updates, cores and containers). European Portuguese keeps 0 in the plural.
- The cards stay readable at their smallest Sections width (6 columns, about 160 px): the mini card bars and values no longer disappear or get cut, its labels give way to the row icons, the full card gauges shrink to fit, and the header title always keeps a few characters while the status chip falls back to its coloured dot.
- The header status chip lines up with the title line when there is a subtitle.
- An unavailable or unknown "online" sensor now shows "Unavailable" / "Unknown" in grey instead of a red "Offline".
- The restart button of an unavailable stack or container is disabled.
- Screen readers announce the question of the confirmation popup ("Restart auth?").

## 1.11.5 - 2026-11-01

### Added
- Added Italian, Dutch, European Portuguese and Polish translations: `it`, `nl`, `pt` and `pl`, all selectable in the editor and picked automatically from the Home Assistant language (`pt-BR` falls back to European Portuguese).

### Fixed
- A long Git sync error tag no longer hides the stack name on a narrow card: the tag shrinks with an ellipsis (it helps German too).
- Polish counted nouns use the right plural form (1 rdzeń, 2 rdzenie, 5 rdzeni; same for containers, stacks, images and updates).

## 1.11.4 - 2026-11-01

### Added
- Added Serbian (Cyrillic and Latin) translations: `sr` and `sr-Latn`, both selectable in the editor; `sr-Latn` is picked automatically when Home Assistant is set to Serbian (Latin).

## 1.11.3

### Fixes
- With "reduce motion" enabled in the system or browser, the bars, gauge rings and section chevrons no longer animate; they jump straight to their new value.

### Maintenance
- Screenshots: the mock environment counters now match the stacks and containers listed (7 stacks, 11 containers), so tiles and sections show the same totals.
- CI: a single Biome version (2.6.3) in pre-commit, `biome.json` and Lint; the Lint job reads it from `.pre-commit-config.yaml`.

## 1.11.2

### Fixes
- The header no longer shows "Docker unavailable" (untranslated) when the Docker version sensor is unavailable; it is hidden like the platform and connection type.

## 1.11.1

### Fixes
- German: inline counts keep their capitalised nouns ("3 Container", "5 Stacks · 12 Images · 2 Updates").
- Mini card: a long metric label (German "Arbeitsspeicher", now "Speicher") no longer spills over its bar; it is cut with an ellipsis instead.
- Pending updates show "—" instead of 0 when the containers sensor is unavailable or unknown, like the other counters.
- A stack whose container count is unavailable no longer reads "unavailable containers".
- The start / stop button is disabled for an unavailable or unknown switch instead of sending `switch.turn_on`.
- "Unavailable" and "Unknown" states are translated.
- Confirmation popup: the OK button follows the smoked-glass style of the other buttons, Tab stays inside the popup and the focus returns to the button that opened it.
- Spanish: "Sin incidencias" for an empty filtered list, shorter "Actualiz." tile label so it is no longer truncated.

### Maintenance
- CI: the apt retry loop now fails after 3 attempts, the unguarded duplicate `install-deps` step is gone from Validate, and Screenshots also runs on `package-lock.json` and `images/` changes.
- CI: after pushing refreshed screenshots onto a PR, the Screenshots workflow dispatches Lint, Validate and HACS again on that branch (a `GITHUB_TOKEN` push starts no `pull_request` run); Lint can now be started manually.

## 1.11.0

### Changes
- German and Spanish translations for both cards and the visual editor (`language: de` / `language: es`, also picked automatically from the Home Assistant language); the editor's language list offers Deutsch and Español.

### Maintenance
- New I18N parity test checking that every language has exactly the keys and placeholders of English.

## 1.10.0

### Changes
- Restart and stop now ask for confirmation in a popup inside the card (Cancel / OK, Escape or a click outside to cancel) instead of the browser's `window.confirm()`, which blocks the page and is silently skipped in some webviews. A double click no longer sends the action twice.
- Empty filtered lists (`only_problems`) show a translated "Nothing to report" label instead of a bare ✓.

### Fixes
- Memory gauge label keeps the unit of the used value when it differs from the total's: 980 MB used of 62.5 GB now reads "980 MB / 62.5 GB" instead of "980 / 62.5 GB".
- The card size follows `only_problems` and counts only the rows actually listed.
- Visual editor: the form is no longer re-rendered on every unrelated Home Assistant state change while editing.
- Mini card: changing the configuration resets the zoom, so the editor preview starts from the compact view.
- Entity and key attributes are escaped everywhere they are interpolated.

### Maintenance
- Release gated on the unit tests; unused ruff tooling dropped.
- New Screenshots workflow regenerating `screenshots/` on pull requests; Playwright Chromium cached in Validate, Playwright lockfile bumped to 1.64.1 so Chromium installs again on current runners.
- One GIF per animation (sections folding, gauge transitions, mini card zoom) in a new README *Animations* section; PNG screenshots regenerated, dark capture caption fixed.

## 1.9.0

### Fixes
- All three card buttons (the `.ctrl` restart and start/stop buttons and the `.zoom` detail button) now carry `type="button"`, instead of relying on the default `type="submit"`. This has no effect today, but prevents an accidental form submission if the card is ever embedded in a `<form>` context.

### Maintenance
- Test assertions for the zoom button markup updated.

## 1.8.0
### Changes
- The Dockhand logo in the header fits a 40 × 40 px box on the full card and a 32 × 32 px box on the mini card (was 40 px and 36 px high), like the header icon of the other cards.
- Detail button at the top right of the mini card (after the status pill): it shows the full card with the same options (gauges, counters, stacks, containers), and a second click brings the compact view back. A click anywhere outside the card also folds it back; clicks on the card or in a dialog opened from it (more-info) do not. Zoomed in, the logo is the full card's 40 px. New `zoom` option (on by default, in the visual editor): `zoom: false` removes the button.
- Header geometry: the body starts 8 px below the header on both cards (was 4 px on the full card); on the mini card the logo is top-aligned, 12 px from the card's top edge like the other cards of the family.

### Maintenance
- Tests for the detail button; light and dark screenshots of the zoomed-in mini card.

## 1.7.1

### Fixes
- Keyboard focus stays on the stack or container you were on when the list reorders (for example after stopping it): pressing Enter on restart, start/stop or update now always acts on that one, never on its neighbour.

### Maintenance
- Browser tests (Chromium) for focus and in-place updates, run in CI.

## 1.7.0

### Changes
- `dockhand_url` is only used for the logo link when it starts with `http://` or `https://`; any other value falls back to the detected Dockhand URL.
- Count tiles and the mini card footer show "—" instead of the raw `unknown` / `unavailable` state.
- The card only re-renders when something it shows changes, and updates the page in place: keyboard focus, hover and text selection survive updates, and the bars, rings and chevrons animate again.
- Values coming from the Dockhand API (CPU count, running containers, pending updates) are escaped before display.
- Keyboard access: clickable items can be reached with Tab and opened with Enter or Space, with a visible focus outline; fold titles announce whether they are open.
- Restart / start / stop failures are logged instead of raising unhandled errors; the error message gives the right minimum Home Assistant version (2024.8); the card size follows the sections shown.

### Maintenance
- CI hardened: actions pinned by commit SHA, read-only token permissions, Dependabot for action updates, duplication report annotated on pull requests.
- Unit tests (`npm test`, run in CI).

## 1.6.1

### Maintenance
- Tooling only, no functional change: Biome linting, pre-commit and a Lint CI (duplication checks). Card source modernized (optional chaining, template literals), identical behavior.

## 1.6.0

### Changes
- More compact layout with the same information, like the other ha-* cards: 12 px card padding, 36 px header icon, 16 px name and 12 px subtitle, 11 px pills, tighter tiles and sections.
- Dockhand logo 48 → 40 px, gauges 84 → 60 px, lower count tiles, container rows 7 → 5 px.
- The mini card picks up the smaller pills and subtitle.

## 1.5.1

### Changes
- The status pill is back on the right of the header: moving it under the title in the previous version is undone.

## 1.5.0

### Changes
- The Online / Offline pill sits under the title, as in the other ha-* cards, instead of on the right of the header.
- HACS now asks for Home Assistant 2024.8 or later, the version that brought the sections view the card supports; the README says so under **Prerequisites**.

### Maintenance
- CHANGELOG headings use the same plain English set as the other ha-* repositories.

## 1.4.0

### Changes
- The warning color falls back to Home Assistant's default `#ffa600` (was `#ffa000`), like the other ha-* cards.

### Development
- The built card is no longer committed in `dist/`: CI builds it on every push, and the release workflow builds it and attaches it to the release, which is where HACS downloads it from.
- Releases are published when `version` in `package.json` has no tag yet: bump the version, add its CHANGELOG section and push, like the other ha-* repositories (the manual Release workflow run is no longer needed).
- Issue templates, and stale, release notes and merged-branch cleanup workflows, shared with the other repositories.

## 1.3.0

### What's new
- A click anywhere else on the page folds the stacks and containers lists back to their defaults (`expand_stacks`, `expand_containers`), as in ha-carburants-france.

## 1.2.0

### What's new
- Stacks and containers lists are now collapsed by default: click the section title to unfold them. New `expand_stacks` and `expand_containers` options (also in the visual editor) keep them expanded.

## 1.1.0

### What's new
- Clicking the Dockhand logo opens the Dockhand web UI in a new tab. The address is detected from the integration and can be set with the new `dockhand_url` option (also in the visual editor). Falls back to [dockhand.pro](https://dockhand.pro).

## 1.0.0

First release of the Dockhand cards for Home Assistant, built for the [Dockhand integration](https://github.com/raetha/ha-dockhand).

| Dockhand Card | Dockhand Mini Card |
|---|---|
| ![dockhand-card](https://raw.githubusercontent.com/juju35/ha-dockhand-card/main/screenshots/card.png) | ![dockhand-mini-card](https://raw.githubusercontent.com/juju35/ha-dockhand-card/main/screenshots/mini-card.png) |

### What's new
- **Dockhand Card** (`custom:dockhand-card`): CPU, memory and running containers gauges, stacks / images / volumes / networks / updates counters, stacks list and optional containers list with start / stop and restart buttons.
- **Dockhand Mini Card** (`custom:dockhand-mini-card`): compact overview with CPU, memory, containers, stacks, images and pending updates.
- **Automatic discovery** through the entity and device registries: no entity to pick, several environments supported, works with entity ids in any language.
- **Visual editor** for both cards: environment, title, sections to display and language.
- "Only items needing attention" mode for stopped, unhealthy, out of sync or outdated stacks and containers.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency.

### Installation
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-dockhand-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-dockhand-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `dockhand-card.js` from the assets below to `/config/www/` and add `/local/dockhand-card.js` as a JavaScript Module resource.

### Quick start
```yaml
type: custom:dockhand-card
```

```yaml
type: custom:dockhand-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-dockhand-card#configuration).
