/*
 * Dockhand Card for Home Assistant
 * https://github.com/juju35/ha-dockhand-card
 *
 * Lovelace cards for the Dockhand integration (https://github.com/raetha/ha-dockhand).
 * Entities are resolved through the entity and device registries (platform, translation_key,
 * device model and hierarchy), so they work whatever the Home Assistant language or entity ids.
 */

const VERSION = "__VERSION__";
const IMG_LOGO = "__IMG_LOGO__";
const DOCKHAND_SITE = "https://dockhand.pro";

const ICONS = {
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  cpu: "M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z",
  ram: "M17,17H7V7H17M21,11V9H19V7C19,5.89 18.1,5 17,5H15V3H13V5H11V3H9V5H7C5.89,5 5,5.89 5,7V9H3V11H5V13H3V15H5V17A2,2 0 0,0 7,19H9V21H11V19H13V21H15V19H17A2,2 0 0,0 19,17V15H21V13H19V11M13,13H11V11H13M15,9H9V15H15V9Z",
  container: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z",
  stack: "M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z",
  image: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L10.11,5.22L16,8.61L17.96,7.5L12,4.15M6.04,7.5L12,10.85L13.96,9.75L8.08,6.35L6.04,7.5M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z",
  volume: "M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z",
  network: "M10,2C8.89,2 8,2.89 8,4V7C8,8.11 8.89,9 10,9H11V11H2V13H6V15H5C3.89,15 3,15.89 3,17V20C3,21.11 3.89,22 5,22H9C10.11,22 11,21.11 11,20V17C11,15.89 10.11,15 9,15H8V13H16V15H15C13.89,15 13,15.89 13,17V20C13,21.11 13.89,22 15,22H19C20.11,22 21,21.11 21,20V17C21,15.89 20.11,15 19,15H18V13H22V11H13V9H14C15.11,9 16,8.11 16,7V4C16,2.89 15.11,2 14,2H10M10,4H14V7H10V4M5,17H9V20H5V17M15,17H19V20H15V17Z",
  update: "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,7L7,12H10V16H14V12H17L12,7Z",
  restart: "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
  power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  git: "M2.6,10.59L8.38,4.8L10.07,6.5C9.83,7.35 10.22,8.28 11,8.73V14.27C10.4,14.61 10,15.26 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16C14,15.26 13.6,14.61 13,14.27V9.41L15.07,11.5C15,11.65 15,11.82 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10C16.82,10 16.65,10 16.5,10.07L13.93,7.5C14.19,6.57 13.71,5.55 12.78,5.16C12.35,5 11.9,4.96 11.5,5.07L9.8,3.38L10.59,2.6C11.37,1.81 12.63,1.81 13.41,2.6L21.4,10.59C22.19,11.37 22.19,12.63 21.4,13.41L13.41,21.4C12.63,22.19 11.37,22.19 10.59,21.4L2.6,13.41C1.81,12.63 1.81,11.37 2.6,10.59Z",
  alert: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
  // mdi:arrow-expand and mdi:arrow-collapse, the mini card's detail button.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

const STRINGS = {
  en: {
    cpu: "CPU",
    memory: "Memory",
    containers: "Containers",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Networks",
    updates: "Updates",
    // Inline lowercase forms ("3 containers", "5 stacks"): German keeps its capitalised nouns.
    container_lc: "container",
    containers_lc: "containers",
    stacks_lc: "stacks",
    images_lc: "images",
    updates_lc: "updates",
    running: "running",
    cores: "cores",
    online: "Online",
    offline: "Offline",
    update_available: "Update available",
    unhealthy: "Unhealthy",
    sync_error: "Sync error",
    restart: "Restart",
    stop: "Stop",
    cancel: "Cancel",
    start_stop: "Start / stop",
    confirm_restart: "Restart {name}?",
    confirm_stop: "Stop {name}?",
    all_ok: "Nothing to report",
    no_env: "No Dockhand environment found. Is the Dockhand integration installed?",
    unknown_env: "Dockhand environment not found",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    state_running: "Running",
    state_exited: "Stopped",
    state_stopped: "Stopped",
    state_partial: "Partial",
    state_paused: "Paused",
    state_restarting: "Restarting",
    state_created: "Created",
    state_dead: "Dead",
    state_unavailable: "Unavailable",
    state_unknown: "Unknown",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    // Editor
    environment: "Dockhand environment",
    title: "Title (optional, defaults to the environment name)",
    show_logo: "Show Dockhand logo",
    dockhand_url: "Dockhand URL opened by the logo (optional, detected from the integration)",
    show_stats: "Show CPU, memory and containers",
    show_counts: "Show counts (stacks, images…)",
    show_stacks: "Show stacks",
    show_containers: "Show containers",
    show_controls: "Show start / stop / restart buttons",
    only_problems: "Only list stacks and containers needing attention",
    expand_stacks: "Stacks list expanded by default",
    expand_containers: "Containers list expanded by default",
    show_updates: "Show pending updates",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card and back",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    cpu: "CPU",
    memory: "Mémoire",
    containers: "Conteneurs",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Réseaux",
    updates: "Mises à jour",
    container_lc: "conteneur",
    containers_lc: "conteneurs",
    stacks_lc: "stacks",
    images_lc: "images",
    updates_lc: "mises à jour",
    running: "actifs",
    cores: "cœurs",
    online: "En ligne",
    offline: "Hors ligne",
    update_available: "Mise à jour disponible",
    unhealthy: "En mauvaise santé",
    sync_error: "Erreur de synchro",
    restart: "Redémarrer",
    stop: "Arrêter",
    cancel: "Annuler",
    start_stop: "Démarrer / arrêter",
    confirm_restart: "Redémarrer {name} ?",
    confirm_stop: "Arrêter {name} ?",
    all_ok: "Rien à signaler",
    no_env: "Aucun environnement Dockhand trouvé. L'intégration Dockhand est-elle installée ?",
    unknown_env: "Environnement Dockhand introuvable",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    state_running: "Actif",
    state_exited: "Arrêté",
    state_stopped: "Arrêté",
    state_partial: "Partiel",
    state_paused: "En pause",
    state_restarting: "Redémarrage",
    state_created: "Créé",
    state_dead: "Mort",
    state_unavailable: "Indisponible",
    state_unknown: "Inconnu",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    environment: "Environnement Dockhand",
    title: "Titre (facultatif, nom de l'environnement par défaut)",
    show_logo: "Afficher le logo Dockhand",
    dockhand_url: "URL de Dockhand ouverte par le logo (facultatif, détectée depuis l'intégration)",
    show_stats: "Afficher CPU, mémoire et conteneurs",
    show_counts: "Afficher les compteurs (stacks, images…)",
    show_stacks: "Afficher les stacks",
    show_containers: "Afficher les conteneurs",
    show_controls: "Afficher les boutons démarrer / arrêter / redémarrer",
    only_problems: "Lister uniquement les stacks et conteneurs à surveiller",
    expand_stacks: "Liste des stacks dépliée par défaut",
    expand_containers: "Liste des conteneurs dépliée par défaut",
    show_updates: "Afficher les mises à jour en attente",
    zoom: "Bouton de détail",
    zoom_helper: "Bascule la mini-carte en carte complète, et inversement",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    cpu: "CPU",
    memory: "Speicher",
    containers: "Container",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Netzwerke",
    updates: "Updates",
    container_lc: "Container",
    containers_lc: "Container",
    stacks_lc: "Stacks",
    images_lc: "Images",
    updates_lc: "Updates",
    running: "aktiv",
    cores: "Kerne",
    online: "Online",
    offline: "Offline",
    update_available: "Update verfügbar",
    unhealthy: "Fehlerhaft",
    sync_error: "Synchronisierungsfehler",
    restart: "Neu starten",
    stop: "Stoppen",
    cancel: "Abbrechen",
    start_stop: "Starten / stoppen",
    confirm_restart: "{name} neu starten?",
    confirm_stop: "{name} stoppen?",
    all_ok: "Keine Auffälligkeiten",
    no_env: "Keine Dockhand-Umgebung gefunden. Ist die Dockhand-Integration installiert?",
    unknown_env: "Dockhand-Umgebung nicht gefunden",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    state_running: "Aktiv",
    state_exited: "Gestoppt",
    state_stopped: "Gestoppt",
    state_partial: "Teilweise",
    state_paused: "Pausiert",
    state_restarting: "Startet neu",
    state_created: "Erstellt",
    state_dead: "Tot",
    state_unavailable: "Nicht verfügbar",
    state_unknown: "Unbekannt",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    environment: "Dockhand-Umgebung",
    title: "Titel (optional, standardmäßig der Name der Umgebung)",
    show_logo: "Dockhand-Logo anzeigen",
    dockhand_url: "Vom Logo geöffnete Dockhand-URL (optional, wird aus der Integration ermittelt)",
    show_stats: "CPU, Speicher und Container anzeigen",
    show_counts: "Zähler anzeigen (Stacks, Images…)",
    show_stacks: "Stacks anzeigen",
    show_containers: "Container anzeigen",
    show_controls: "Schaltflächen Starten / Stoppen / Neu starten anzeigen",
    only_problems: "Nur Stacks und Container auflisten, die Aufmerksamkeit erfordern",
    expand_stacks: "Stack-Liste standardmäßig aufgeklappt",
    expand_containers: "Container-Liste standardmäßig aufgeklappt",
    show_updates: "Ausstehende Updates anzeigen",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Wechselt von der Mini-Karte zur vollständigen Karte und zurück",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    cpu: "CPU",
    memory: "Memoria",
    containers: "Contenedores",
    stacks: "Stacks",
    images: "Imágenes",
    volumes: "Volúmenes",
    networks: "Redes",
    updates: "Actualiz.",
    container_lc: "contenedor",
    containers_lc: "contenedores",
    stacks_lc: "stacks",
    images_lc: "imágenes",
    updates_lc: "actualizaciones",
    running: "en ejecución",
    cores: "núcleos",
    online: "En línea",
    offline: "Sin conexión",
    update_available: "Actualización disponible",
    unhealthy: "En mal estado",
    sync_error: "Error de sincronización",
    restart: "Reiniciar",
    stop: "Detener",
    cancel: "Cancelar",
    start_stop: "Iniciar / detener",
    confirm_restart: "¿Reiniciar {name}?",
    confirm_stop: "¿Detener {name}?",
    all_ok: "Sin incidencias",
    no_env: "No se encontró ningún entorno de Dockhand. ¿Está instalada la integración Dockhand?",
    unknown_env: "Entorno de Dockhand no encontrado",
    no_registry: "Esta tarjeta requiere Home Assistant 2024.8 o posterior.",
    state_running: "En ejecución",
    state_exited: "Detenido",
    state_stopped: "Detenido",
    state_partial: "Parcial",
    state_paused: "En pausa",
    state_restarting: "Reiniciando",
    state_created: "Creado",
    state_dead: "Muerto",
    state_unavailable: "No disponible",
    state_unknown: "Desconocido",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    environment: "Entorno de Dockhand",
    title: "Título (opcional, por defecto el nombre del entorno)",
    show_logo: "Mostrar el logo de Dockhand",
    dockhand_url: "URL de Dockhand abierta por el logo (opcional, detectada desde la integración)",
    show_stats: "Mostrar CPU, memoria y contenedores",
    show_counts: "Mostrar contadores (stacks, imágenes…)",
    show_stacks: "Mostrar los stacks",
    show_containers: "Mostrar los contenedores",
    show_controls: "Mostrar los botones iniciar / detener / reiniciar",
    only_problems: "Mostrar solo los stacks y contenedores que requieren atención",
    expand_stacks: "Lista de stacks desplegada por defecto",
    expand_containers: "Lista de contenedores desplegada por defecto",
    show_updates: "Mostrar las actualizaciones pendientes",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la mini tarjeta a la tarjeta completa y viceversa",
    language: "Idioma",
    lang_auto: "Automático",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = (config?.language) || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

// Counter value as shown: a dash while the sensor is unknown or unavailable.
const countText = (s) => (!s || s.state === "unknown" || s.state === "unavailable" ? "—" : s.state);

const fmtBytes = (b) => {
  if (b === null || b === undefined || !Number.isFinite(Number(b))) return "—";
  b = Number(b);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  const v = b >= 100 || i === 0 ? b.toFixed(0) : b.toFixed(b >= 10 ? 1 : 2);
  return `${v.includes(".") ? v.replace(/\.?0+$/, "") : v} ${units[i]}`;
};

// "used / total" label: the unit of used is dropped only when it matches the total's.
const fmtBytesPair = (used, total) => {
  const u = fmtBytes(used);
  const t = fmtBytes(total);
  return `${u.split(" ")[1] === t.split(" ")[1] ? u.split(" ")[0] : u} / ${t}`;
};

const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

// Status → color class for containers and stacks.
const stateClass = (state) => {
  switch (String(state || "").toLowerCase()) {
    case "running":
    case "healthy":
    case "synced":
      return "ok";
    case "partial":
    case "paused":
    case "restarting":
    case "starting":
    case "created":
    case "syncing":
    case "pending":
      return "warn";
    case "exited":
    case "stopped":
    case "dead":
    case "unhealthy":
    case "error":
      return "crit";
    default:
      return "idle";
  }
};

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, embedded pictures and CSS transitions survive an update, and only the changed text and
// attributes are written. Rows of a list carry a data-key (their entity or row id) and are matched by it,
// wherever they moved, so a focused row keeps its own data when the list is reordered (a node matched by
// position would be rewritten with the row taking its place, and Enter would act on that row). Nodes
// without a data-key are matched by position.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it, which is safe:
// Enter then does nothing rather than act on another row.
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// ---------------------------------------------------------------------------
// Registry-based resolution
// ---------------------------------------------------------------------------

const _cache = new WeakMap();

/**
 * Build the Dockhand model from hass.entities / hass.devices:
 * { envs: [{ id, name, entities, stacks: [...], containers: [...] }] }
 * Entities are keyed by translation_key; primary entities without one (running switch,
 * container update) are keyed "_<domain>".
 */
const resolve = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _cache.get(hass.entities);
  if (cached && cached.devices === hass.devices) return cached.model;

  const byDevice = new Map();
  for (const e of Object.values(hass.entities)) {
    if (e.platform !== "dockhand" || !e.device_id) continue;
    const key = e.translation_key || `_${e.entity_id.split(".")[0]}`;
    const map = byDevice.get(e.device_id) || {};
    if (!(key in map)) map[key] = e.entity_id;
    byDevice.set(e.device_id, map);
  }

  const devName = (d) => d.name_by_user || d.name || "";
  const envOf = (d) => {
    for (let i = 0, cur = d; cur && i < 4; i++, cur = hass.devices[cur.via_device_id]) {
      if (cur.model === "Environment") return cur.id;
    }
    return null;
  };
  // "Docker host – Containers – web" → "web"
  const shortName = (d) => devName(d).split(" – ").pop();

  const envs = new Map();
  for (const id of byDevice.keys()) {
    const d = hass.devices[id];
    if (d && d.model === "Environment")
      envs.set(id, { id, name: devName(d), entities: byDevice.get(id), stacks: [], containers: [] });
  }
  for (const [id, entities] of byDevice) {
    const d = hass.devices[id];
    if (!d) continue;
    const env = envs.get(envOf(d));
    if (!env) continue;
    if (d.model === "Container") env.containers.push({ id, name: shortName(d), entities });
    else if (/Stack$/.test(d.model || "")) env.stacks.push({ id, name: shortName(d), type: d.model, entities });
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const model = { envs: [...envs.values()].sort(byName) };
  for (const env of model.envs) {
    env.stacks.sort(byName);
    env.containers.sort(byName);
  }
  _cache.set(hass.entities, { devices: hass.devices, model });
  return model;
};

const listEnvs = (hass) => {
  const m = hass && resolve(hass);
  return m ? m.envs.map((e) => ({ value: e.id, label: e.name })) : [];
};

const findEnv = (hass, config) => {
  const m = resolve(hass);
  if (!m) return { error: "no_registry" };
  if (!m.envs.length) return { error: "no_env" };
  if (!config.environment) return { env: m.envs[0] };
  const env = m.envs.find((e) => e.id === config.environment || e.name === config.environment);
  return env ? { env } : { error: "unknown_env" };
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --dh-orange: #f26b21; --dh-ok: var(--success-color, #43a047); --dh-warn: var(--warning-color, #ffa600);
          --dh-crit: var(--error-color, #db4437); --dh-idle: var(--disabled-text-color, #9e9e9e); }
  ha-card { overflow: hidden; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--dh-ok); } .warn { --c: var(--dh-warn); } .crit { --c: var(--dh-crit); } .idle { --c: var(--dh-idle); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--dh-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--dh-ok)) 15%, transparent); color: var(--c, var(--dh-ok)); }
  .bar { height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--dh-orange)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  .logo { height: 40px; width: 40px; object-fit: contain; flex: none; }
  a.logo-link { display: flex; flex: none; }
  .titles { flex: 1; min-width: 0; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: var(--dh-warn); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px;
          border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
`;

// In-card confirmation popup, as in the other ha-* cards (ha-vacuum-card, ha-system-monitor-card): a backdrop
// over the card with a small dialog at the top of the card, so it stays in view when the card is long.
// window.confirm() is blocking and silently neutralised in some webviews; this popup is neither.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 150px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .modal-actions .btn { border: none; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                        background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal-actions .btn.primary { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); color: var(--primary-color, #03a9f4); }
  .modal-actions .btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
`;

// After the confirmation popup closes, clicks on the card are ignored for this long: the second click of a
// double click on OK would otherwise land on what lies under the button.
const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

class DockhandBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the confirmation popup (as Cancel). Listened on the window while the popup is open:
    // a re-render or a click on its text can take the focus out of the card.
    // Tab and Shift+Tab stay on the popup's two buttons while it is open.
    this._onKey = (ev) => {
      if (!this._confirm) return;
      if (ev.key === "Tab") {
        const btns = [...(this.shadowRoot.querySelectorAll?.(".modal .btn") || [])];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Render only when a state the card shows has changed, not on every state change of Home Assistant.
    const sig = this._signature();
    if (sameSig(sig, this._sig)) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  // A click elsewhere on the page folds the sections back to their defaults (as in ha-carburants-france).
  // A click, not a pointerdown: folding on press would shift the layout under the pointer before the click.
  connectedCallback() {
    this._onOutside ??= (ev) => {
      const foldsOpen = this._folds && Object.keys(this._folds).length;
      if ((!foldsOpen && !this._confirm) || ev.composedPath().includes(this) || inDialog(ev)) return;
      // Closed by a click elsewhere on the page: the focus goes where that click put it.
      if (this._confirm) this._closeConfirm(false);
      if (foldsOpen) {
        this._folds = {};
        this._update();
      }
    };
    document.addEventListener("click", this._onOutside, true);
    // Reattached with the popup still open (view switch, editor): Escape keeps closing it.
    if (this._confirm) window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onOutside, true);
    window.removeEventListener("keydown", this._onKey);
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._folds = {};
    this._html = "";
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // What the render depends on: registries, language and the states of the environment, its stacks
  // and its containers.
  _signature() {
    const h = this._hass;
    const sig = [h.entities, h.devices, h.language, h.locale?.language];
    const { env } = findEnv(h, this._config);
    if (!env) return sig;
    for (const group of [env, ...env.stacks, ...env.containers]) for (const id of Object.values(group.entities)) sig.push(h.states[id]);
    return sig;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    this._sig = sig ?? this._signature();
    let html = this._render();
    if (this._confirm)
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
  }

  // Service call whose failure is logged (Home Assistant already shows a toast) instead of left unhandled.
  _call(domain, service, data) {
    return Promise.resolve()
      .then(() => this._hass.callService(domain, service, data))
      .catch((err) => console.error(`dockhand-card: ${domain}.${service} failed`, err));
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    // Just closed: the rest of a double click on OK does nothing.
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    // Confirmation popup open: only its buttons and the backdrop itself (outside the dialog) act.
    if (this._confirm) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "confirm_ok") {
        const { run } = this._confirm;
        this._closeConfirm();
        run();
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
        this._closeConfirm();
      }
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, label } = el.dataset;
    if (action === "fold") {
      this._folds = { ...this._folds, [el.dataset.section]: !this._isOpen(el.dataset.section) };
      this._update();
    } else if (action === "restart") {
      this._openConfirm(
        {
          text: this._t("confirm_restart", { name: label }),
          ok: this._t("restart"),
          run: () => this._call("button", "press", { entity_id: entity }),
        },
        { action, entity }
      );
    } else if (action === "toggle") {
      const state = this._s(entity)?.state;
      // Unavailable or unknown: nothing to start or stop (the button is disabled, keyboard included).
      if (state !== "on" && state !== "off") return;
      if (state === "off") this._call("switch", "turn_on", { entity_id: entity });
      else
        this._openConfirm(
          {
            text: this._t("confirm_stop", { name: label }),
            ok: this._t("stop"),
            run: () => this._call("switch", "turn_off", { entity_id: entity }),
          },
          { action, entity }
        );
    } else if (entity) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
    }
  }

  // In-card confirmation before stopping or restarting (see DIALOG_STYLE): Cancel, Escape, the backdrop
  // and a click outside the card all close it without acting.
  // `from` is the button that opened it: the focus goes back to it when the popup closes.
  _openConfirm(confirm, from) {
    this._confirm = { ...confirm, from };
    window.addEventListener("keydown", this._onKey);
    this._update();
    // preventScroll: opening the popup must not bring a scrolled page back to the card.
    this.shadowRoot.querySelector?.(".modal .primary")?.focus({ preventScroll: true });
  }

  _closeConfirm(restoreFocus = true) {
    const from = this._confirm?.from;
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    // Looked up again after the render: the opening button may have been re-created meanwhile (entity ids
    // hold only [a-z0-9_.], safe in the selector).
    if (restoreFocus && from)
      this.shadowRoot
        .querySelector?.(`[data-action="${from.action}"][data-entity="${from.entity}"]`)
        ?.focus({ preventScroll: true });
  }

  _confirmHtml() {
    const c = this._confirm;
    return `<div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="msg">${esc(c.text)}</div>
        <div class="modal-actions">
          <button type="button" class="btn" data-action="confirm_cancel">${esc(this._t("cancel"))}</button>
          <button type="button" class="btn primary" data-action="confirm_ok">${esc(c.ok)}</button>
        </div>
      </div>
    </div>`;
  }

  // Logo target: dockhand_url option, else the Dockhand web UI advertised by the integration
  // (environment device configuration_url, minus its settings deep link), else the project website.
  _dockhandUrl(env) {
    // Only http(s) addresses: any other scheme (javascript:…) would run on a click on the logo.
    if (/^https?:\/\//i.test(this._config.dockhand_url || "")) return this._config.dockhand_url;
    const conf = this._hass.devices?.[env.id]?.configuration_url;
    if (conf) return conf.replace(/\/settings(?:[/?#].*)?$/, "") || conf;
    return DOCKHAND_SITE;
  }

  _header(env) {
    const c = this._config;
    const online = this._s(env.entities.online);
    const isOnline = !online || online.state === "on";
    const docker = this._s(env.entities.host_docker_version)?.state;
    const platform = this._s(env.entities.host_platform)?.state;
    const conn = this._s(env.entities.connection_type)?.state;
    const sub = [docker && docker !== "unknown" ? `Docker ${docker}` : null, platform, conn].filter((v) => v && v !== "unknown" && v !== "unavailable");
    return `
      <div class="header">
        ${
          c.show_logo !== false
            ? `<a class="logo-link" href="${esc(this._dockhandUrl(env))}" target="_blank" rel="noopener noreferrer" title="Dockhand"><img class="logo" src="${IMG_LOGO}" alt="Dockhand"></a>`
            : ""
        }
        <div class="titles">
          <div class="name">${esc(c.title || env.name)}</div>
          ${sub.length ? `<div class="sub">${esc(sub.join(" · "))}</div>` : ""}
        </div>
        ${
          online
            ? `<span class="chip clickable ${isOnline ? "ok" : "crit"}" role="button" tabindex="0" data-entity="${esc(online.entity_id)}"><span class="dot"></span>${this._t(
                isOnline ? "online" : "offline"
              )}</span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
  }

  // Button at the far right of the header: only the mini card has one.
  _zoomButton() {
    return "";
  }

  _error(key) {
    return `<style>${BASE_STYLE}${DIALOG_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_env" ? `${this._t(key)}: ${this._config.environment}` : this._t(key)
    )}</div></ha-card>`;
  }

  _containerStats(env) {
    const s = this._s(env.entities.containers);
    const total = num(s);
    const a = s?.attributes || {};
    // An unknown or unavailable sensor has no attributes: its pending updates are unknown (a dash), not 0.
    const known = !!s && s.state !== "unknown" && s.state !== "unavailable";
    return {
      entity: env.entities.containers,
      total,
      running: a.running ?? null,
      unhealthy: a.unhealthy ?? 0,
      updates: known ? (a.pending_updates_total ?? a.pending_updates ?? 0) : null,
    };
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const ring = (pct) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.fold { cursor: pointer; user-select: none; }
  .section-title .chevron { transition: transform .2s ease; }
  .section-title.closed { margin-bottom: 0; }
  .section-title.closed .chevron { transform: rotate(-90deg); }
  .gauges { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .gauge { display: flex; flex-direction: column; align-items: center; position: relative; }
  .ring { width: 60px; height: 60px; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--dh-orange)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .gauge .val { position: absolute; top: 0; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .gauge .val b { font-size: 14px; font-weight: 500; }
  .gauge .val .icon { width: 12px; height: 12px; color: var(--secondary-text-color); }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 0; text-align: center; line-height: 1.35; }
  .gauge .lbl small { display: block; font-size: 11px; opacity: .85; }
  .counts { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 6px; }
  .count-tile { display: flex; flex-direction: column; align-items: center; gap: 0; padding: 6px 4px; border-radius: 10px;
                background: var(--secondary-background-color, rgba(127,127,127,.08)); min-width: 0; text-align: center; }
  .count-tile .top { display: flex; align-items: center; gap: 6px; }
  .count-tile .icon { color: var(--c, var(--secondary-text-color)); }
  .count-tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .count-tile .v { font-size: 14px; font-weight: 500; }
  .count-tile.has-updates { --c: var(--dh-orange); }
  .count-tile.has-updates .v { color: var(--dh-orange); }
  .list { display: flex; flex-direction: column; }
  .item { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.15)); min-width: 0; }
  .item:last-child { border-bottom: none; }
  .item .main { flex: 1; min-width: 0; }
  .item .title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .item .title span:first-child { overflow: hidden; text-overflow: ellipsis; }
  .item .detail { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tag { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--secondary-text-color); flex: none; display: inline-flex; align-items: center; gap: 3px; }
  .tag .icon { width: 12px; height: 12px; }
  .tag.alert { background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); }
  .badge-update { color: var(--dh-orange); }
  .badge-update .icon { width: 18px; height: 18px; }
  .ctrl { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: none;
          background: transparent; color: var(--secondary-text-color); cursor: pointer; flex: none; padding: 0; }
  .ctrl:hover:not(:disabled) { background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .ctrl:disabled { opacity: .4; cursor: default; }
  .ctrl.on { color: var(--dh-ok); }
  .ctrl .icon { width: 20px; height: 20px; }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 4px 0; }
`;

class DockhandCard extends DockhandBase {
  static getConfigElement() {
    return document.createElement("dockhand-card-editor");
  }

  static getStubConfig(hass) {
    const env = listEnvs(hass)[0];
    return env ? { environment: env.value } : {};
  }

  // Rows of about 50 px: header, gauges, counter tiles, then each list title and, when the list is
  // open, its rows — the ones actually listed: only_problems filters them (as _section does), down to
  // a single "nothing to report" line when none needs attention.
  getCardSize() {
    const c = this._config || {};
    let size = 1 + (c.show_stats !== false ? 2 : 0) + (c.show_counts !== false ? 1 : 0);
    const env = this._hass && this._config ? findEnv(this._hass, c).env : null;
    for (const [key, shown, problem] of [
      ["stacks", c.show_stacks !== false, (st) => this._stackProblem(st)],
      ["containers", c.show_containers === true, (ct) => this._containerProblem(ct)],
    ]) {
      const all = env ? env[key].length : 0;
      const n = env && c.only_problems ? Math.max(env[key].filter(problem).length, all ? 1 : 0) : all;
      if (shown && (all || !env)) size += 1 + (this._isOpen(key) ? n : 0);
    }
    return size;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const c = this._config;
    const parts = [];
    if (c.show_stats !== false) parts.push(this._stats(env));
    if (c.show_counts !== false) parts.push(this._counts(env));
    if (c.show_stacks !== false) parts.push(this._stacks(env));
    if (c.show_containers === true) parts.push(this._containers(env));
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _gauge(id, label, icon, pct, display, cls) {
    return `<div class="gauge clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}">
      ${ring(pct)}
      <div class="val">${svgIcon(icon)}<b>${display}</b></div>
      <div class="lbl">${label}</div>
    </div>`;
  }

  _stats(env) {
    const cpuS = this._s(env.entities.cpu_usage);
    const memS = this._s(env.entities.memory_usage);
    const cpu = num(cpuS);
    const mem = num(memS);
    const cores = cpuS?.attributes?.cpu_count;
    const used = memS?.attributes?.memory_used_bytes;
    const total = memS?.attributes?.memory_total_bytes;
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const memLabel = used && total ? `${this._t("memory")}<small>${fmtBytesPair(used, total)}</small>` : this._t("memory");
    return `<div class="gauges">
      ${this._gauge(
        env.entities.cpu_usage,
        cores ? `${this._t("cpu")}<small>${esc(cores)} ${this._t("cores")}</small>` : this._t("cpu"),
        ICONS.cpu,
        cpu,
        cpu === null ? "—" : `${cpu < 10 ? cpu.toFixed(1) : Math.round(cpu)}%`,
        level(cpu, 70, 90)
      )}
      ${this._gauge(env.entities.memory_usage, memLabel, ICONS.ram, mem, mem === null ? "—" : `${Math.round(mem)}%`, level(mem, 80, 95))}
      ${this._gauge(
        cs.entity,
        `${this._t("containers")}<small>${this._t("running")}</small>`,
        ICONS.container,
        runPct,
        cs.total === null ? "—" : `${esc(cs.running ?? "?")}/${cs.total}`,
        cs.unhealthy > 0 || (runPct !== null && runPct < 100) ? "warn" : "ok"
      )}
    </div>`;
  }

  _counts(env) {
    const e = env.entities;
    const cs = this._containerStats(env);
    const tile = (id, icon, label, value, cls = "") =>
      id && this._s(id)
        ? `<div class="count-tile clickable ${cls}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}"><div class="top">${svgIcon(icon)}<span class="v">${esc(
            value
          )}</span></div><div class="k">${esc(label)}</div></div>`
        : "";
    const v = (id) => countText(this._s(id));
    const tiles = [
      tile(e.stacks, ICONS.stack, this._t("stacks"), v(e.stacks)),
      tile(e.image_count, ICONS.image, this._t("images"), v(e.image_count)),
      tile(e.volume_count, ICONS.volume, this._t("volumes"), v(e.volume_count)),
      tile(e.network_count, ICONS.network, this._t("networks"), v(e.network_count)),
      tile(cs.entity, ICONS.update, this._t("updates"), cs.updates ?? "—", cs.updates > 0 ? "has-updates" : ""),
    ].filter(Boolean);
    return tiles.length ? `<div class="counts">${tiles.join("")}</div>` : "";
  }

  _controls(entities, label) {
    if (this._config.show_controls === false) return "";
    const sw = entities._switch && this._s(entities._switch);
    const out = [];
    if (entities.restart && this._s(entities.restart))
      out.push(
        `<button type="button" class="ctrl" title="${esc(this._t("restart"))}" data-key="restart" data-action="restart" data-entity="${esc(entities.restart)}" data-label="${esc(
          label
        )}">${svgIcon(ICONS.restart)}</button>`
      );
    // An unavailable or unknown switch cannot be started or stopped: its button is shown disabled.
    if (sw)
      out.push(
        `<button type="button" class="ctrl ${sw.state === "on" ? "on" : ""}" title="${esc(this._t("start_stop"))}" data-key="toggle" data-action="toggle" data-entity="${
          esc(sw.entity_id)
        }" data-label="${esc(label)}"${sw.state === "on" || sw.state === "off" ? "" : " disabled"}>${svgIcon(ICONS.power)}</button>`
      );
    return out.join("");
  }

  _stateLabel(state) {
    const k = `state_${String(state || "").toLowerCase()}`;
    const l = this._t(k);
    return l === k ? state : l;
  }

  // Needs attention: not running, update available or Git sync error — what only_problems keeps.
  _stackProblem(st) {
    const e = st.entities;
    return (
      stateClass(this._s(e.status)?.state) !== "ok" ||
      this._s(e.stack_updates_available)?.state === "on" ||
      this._s(e.git_stack_sync_error)?.state === "on"
    );
  }

  _containerProblem(ct) {
    const e = ct.entities;
    return stateClass(this._s(e.state)?.state) !== "ok" || this._s(e._update)?.state === "on" || this._s(e.health)?.state === "unhealthy";
  }

  _stacks(env) {
    const rows = env.stacks.map((st) => {
      const e = st.entities;
      const status = this._s(e.status);
      // A count only: an unknown or unavailable sensor (or attribute) leaves it out of the detail line.
      const attrCount = parseFloat(status?.attributes?.container_count);
      const count = num(this._s(e.containers_in_stack)) ?? (Number.isFinite(attrCount) ? attrCount : null);
      const upd = this._s(e.stack_updates_available);
      const hasUpd = upd?.state === "on";
      const syncErr = this._s(e.git_stack_sync_error)?.state === "on";
      const cls = stateClass(status?.state);
      const problem = this._stackProblem(st);
      const isGit = /^Git/.test(st.type || "");
      const detail = [
        status ? this._stateLabel(status.state) : null,
        count !== null ? `${count} ${this._t(count === 1 ? "container_lc" : "containers_lc")}` : null,
      ].filter(Boolean);
      return {
        problem,
        html: `<div class="item" data-key="${esc(st.id)}">
          <span class="dot ${cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(e.status || "")}">
            <div class="title"><span>${esc(st.name)}</span>
              ${isGit ? `<span class="tag">${svgIcon(ICONS.git)}git</span>` : ""}
              ${syncErr ? `<span class="tag alert crit">${esc(this._t("sync_error"))}</span>` : ""}
            </div>
            <div class="detail">${esc(detail.join(" · "))}</div>
          </div>
          ${
            hasUpd
              ? `<span class="badge-update clickable" role="button" tabindex="0" title="${esc(this._t("update_available"))}" data-key="update" data-entity="${esc(upd.entity_id)}">${svgIcon(
                  ICONS.update
                )}</span>`
              : ""
          }
          ${this._controls(e, st.name)}
        </div>`,
      };
    });
    return this._section("stacks", ICONS.stack, this._t("stacks"), rows);
  }

  _containers(env) {
    const rows = env.containers.map((ct) => {
      const e = ct.entities;
      const state = this._s(e.state);
      const health = this._s(e.health);
      const upd = this._s(e._update);
      const hasUpd = upd?.state === "on";
      const cls = stateClass(state?.state);
      const unhealthy = health?.state === "unhealthy";
      const problem = this._containerProblem(ct);
      const status = state?.attributes?.status || (state ? this._stateLabel(state.state) : "");
      const image = state?.attributes?.image;
      return {
        problem,
        html: `<div class="item" data-key="${esc(ct.id)}">
          <span class="dot ${unhealthy ? "crit" : cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(e.state || "")}">
            <div class="title"><span>${esc(state?.attributes?.name || ct.name)}</span>
              ${unhealthy ? `<span class="tag alert crit">${esc(this._t("unhealthy"))}</span>` : ""}
            </div>
            <div class="detail">${esc([status, image].filter(Boolean).join(" · "))}</div>
          </div>
          ${
            hasUpd
              ? `<span class="badge-update clickable" role="button" tabindex="0" title="${esc(this._t("update_available"))}" data-key="update" data-entity="${esc(upd.entity_id)}">${svgIcon(
                  ICONS.update
                )}</span>`
              : ""
          }
          ${this._controls(e, ct.name)}
        </div>`,
      };
    });
    return this._section("containers", ICONS.container, this._t("containers"), rows);
  }

  // Stacks and containers lists are collapsed until clicked, unless expand_<key> is set.
  _isOpen(key) {
    return this._folds?.[key] ?? this._config[`expand_${key}`] === true;
  }

  _section(key, icon, title, rows) {
    if (!rows.length) return "";
    const shown = this._config.only_problems ? rows.filter((r) => r.problem) : rows;
    // Items needing attention first.
    shown.sort((a, b) => Number(b.problem) - Number(a.problem));
    const open = this._isOpen(key);
    return `<div>
      <div class="section-title fold ${open ? "" : "closed"}" role="button" tabindex="0" aria-expanded="${open}" data-action="fold" data-section="${key}">${svgIcon(icon)}${esc(
        title
      )}<span class="count">${shown.length}/${rows.length}</span>${svgIcon(ICONS.chevron, "chevron")}</div>
      ${open ? `<div class="list">${shown.length ? shown.map((r) => r.html).join("") : `<div class="empty">✓ ${esc(this._t("all_ok"))}</div>`}</div>` : ""}
    </div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .logo { height: 32px; width: 32px; }
  /* Top-aligned: the two title lines are a little taller than the 32 px logo. */
  a.logo-link { align-self: flex-start; }
  .name { font-size: 16px; }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .metric { display: grid; grid-template-columns: 18px 86px 1fr 52px; align-items: center; gap: 8px; font-size: 13px; }
  .metric .icon { color: var(--secondary-text-color); }
  /* Fixed label column (the bars line up across rows): a longer translation is cut, never drawn over the bar. */
  .metric .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .metric .v { text-align: right; font-weight: 500; }
  .foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; flex-wrap: wrap; }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .upd { color: var(--dh-orange); }
`;

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content, same configuration, and back; a click anywhere outside the card brings it back too.
class DockhandMiniCard extends DockhandCard {
  static getConfigElement() {
    return document.createElement("dockhand-mini-card-editor");
  }

  static getStubConfig(hass) {
    return DockhandCard.getStubConfig(hass);
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev));
    // A click outside the card, and not in a dialog opened from it, brings it back to the compact view.
    this._onUnzoom = (ev) => {
      if (this._zoomed && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onUnzoom, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onUnzoom, true);
  }

  // A config change (the editor, say) starts over from the compact view: the preview would
  // otherwise stay zoomed in.
  setConfig(config) {
    this._zoomed = false;
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
  }

  // A click on the detail button: never a tap on anything else of the card.
  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    // Keyboard use (Enter / Space: no click count) keeps the focus on the button.
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus();
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    return `<button type="button" class="zoom" title="${esc(this._t(z ? "zoom_out" : "zoom_in"))}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _metric(id, icon, label, pct, display, cls) {
    return `<div class="metric clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}">
      ${svgIcon(icon)}<span class="lbl">${label}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v">${display}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const e = env.entities;
    const cpu = num(this._s(e.cpu_usage));
    const mem = num(this._s(e.memory_usage));
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const rows = [
      this._metric(e.cpu_usage, ICONS.cpu, this._t("cpu"), cpu, cpu === null ? "—" : `${cpu < 10 ? cpu.toFixed(1) : Math.round(cpu)}%`, level(cpu, 70, 90)),
      this._metric(e.memory_usage, ICONS.ram, this._t("memory"), mem, mem === null ? "—" : `${Math.round(mem)}%`, level(mem, 80, 95)),
      this._metric(
        cs.entity,
        ICONS.container,
        this._t("containers"),
        runPct,
        cs.total === null ? "—" : `${esc(cs.running ?? "?")}/${cs.total}`,
        cs.unhealthy > 0 || (runPct !== null && runPct < 100) ? "warn" : "ok"
      ),
    ];
    const foot = [];
    const stacks = this._s(e.stacks);
    if (stacks) foot.push(`<span class="clickable" role="button" tabindex="0" data-key="${esc(e.stacks)}" data-entity="${esc(e.stacks)}">${svgIcon(ICONS.stack)}${esc(countText(stacks))} ${esc(this._t("stacks_lc"))}</span>`);
    const images = this._s(e.image_count);
    if (images)
      foot.push(`<span class="clickable" role="button" tabindex="0" data-key="${esc(e.image_count)}" data-entity="${esc(e.image_count)}">${svgIcon(ICONS.image)}${esc(countText(images))} ${esc(this._t("images_lc"))}</span>`);
    if (this._config.show_updates !== false && cs.entity)
      foot.push(
        `<span class="clickable ${cs.updates > 0 ? "upd" : ""}" role="button" tabindex="0" data-key="${esc(cs.entity)}" data-entity="${esc(cs.entity)}">${svgIcon(ICONS.update)}${esc(cs.updates ?? "—")} ${esc(
          this._t("updates_lc")
        )}</span>`
      );
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">
          ${rows.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class DockhandEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema(envs = listEnvs(this._hass)) {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "environment", selector: { select: { mode: "dropdown", options: envs } } },
      { name: "title", selector: { text: {} } },
      { name: "dockhand_url", selector: { text: { type: "url" } } },
      {
        type: "grid",
        name: "",
        schema: [["show_logo", true], ...this.constructor.toggles].map(([name]) => ({ name, selector: { boolean: {} } })),
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: tr("lang_auto") },
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
              { value: "es", label: "Español" },
            ],
          },
        },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = [["show_logo", true], ...this.constructor.toggles];
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = Object.fromEntries(toggles);
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default.
          if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    const envs = listEnvs(this._hass);
    if (!data.environment) data.environment = envs[0]?.value;
    this._form.hass = this._hass;
    // hass is pushed on every state change of Home Assistant while the editor is open: reassign data and
    // schema (the schema only depends on the environments and the language) only when they changed, so
    // ha-form is not re-rendered for unrelated state changes.
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
    const schemaKey = JSON.stringify([envs, lang(this._hass, this._config)]);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = this._schema(envs);
    }
  }
}

class DockhandCardEditor extends DockhandEditorBase {
  static get toggles() {
    return [
      ["show_stats", true],
      ["show_counts", true],
      ["show_stacks", true],
      ["show_containers", false],
      ["show_controls", true],
      ["only_problems", false],
      ["expand_stacks", false],
      ["expand_containers", false],
    ];
  }
}

class DockhandMiniCardEditor extends DockhandEditorBase {
  static get toggles() {
    return [
      ["show_updates", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("dockhand-card", DockhandCard);
define("dockhand-mini-card", DockhandMiniCard);
define("dockhand-card-editor", DockhandCardEditor);
define("dockhand-mini-card-editor", DockhandMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "dockhand-card",
    name: "Dockhand Card",
    description: "Monitor and control a Dockhand Docker environment: CPU, memory, containers, stacks and updates.",
  },
  {
    type: "dockhand-mini-card",
    name: "Dockhand Mini Card",
    description: "Compact Dockhand environment overview: CPU, memory, containers and updates.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-dockhand-card" });
}

console.info(
  `%c DOCKHAND-CARD %c v${VERSION} `,
  "color: white; background: #f26b21; font-weight: 700;",
  "color: #f26b21; background: white; font-weight: 700;"
);
