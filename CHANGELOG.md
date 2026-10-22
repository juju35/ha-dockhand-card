# Changelog

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
