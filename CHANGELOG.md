# Changelog

## Unreleased

### Changes
- The Dockhand logo in the header fits a 40 × 40 px box on the full card and a 32 × 32 px box on the mini card (was 40 px and 36 px high), like the header icon of the other cards.

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
