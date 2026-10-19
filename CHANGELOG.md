# Changelog

## Unreleased

### ✨ Features

- Clicking the Dockhand logo opens the Dockhand web UI in a new tab. The address is detected from the integration and can be set with the new `dockhand_url` option (also in the visual editor). Falls back to [dockhand.pro](https://dockhand.pro).

## 1.0.0

First release of the Dockhand cards for Home Assistant, built for the [Dockhand integration](https://github.com/raetha/ha-dockhand).

| Dockhand Card | Dockhand Mini Card |
|---|---|
| ![dockhand-card](https://raw.githubusercontent.com/juju35/ha-dockhand-card/main/screenshots/card.png) | ![dockhand-mini-card](https://raw.githubusercontent.com/juju35/ha-dockhand-card/main/screenshots/mini-card.png) |

### ✨ Features

- **Dockhand Card** (`custom:dockhand-card`): CPU, memory and running containers gauges, stacks / images / volumes / networks / updates counters, stacks list and optional containers list with start / stop and restart buttons.
- **Dockhand Mini Card** (`custom:dockhand-mini-card`): compact overview with CPU, memory, containers, stacks, images and pending updates.
- **Automatic discovery** through the entity and device registries: no entity to pick, several environments supported, works with entity ids in any language.
- **Visual editor** for both cards: environment, title, sections to display and language.
- "Only items needing attention" mode for stopped, unhealthy, out of sync or outdated stacks and containers.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency.

### 📦 Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-dockhand-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-dockhand-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `dockhand-card.js` from the assets below to `/config/www/` and add `/local/dockhand-card.js` as a JavaScript Module resource.

### 🚀 Quick start

```yaml
type: custom:dockhand-card
```

```yaml
type: custom:dockhand-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-dockhand-card#configuration).
