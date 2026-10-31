// The README captures rendered by scripts/screenshots.mjs: one entry per PNG (`shots`) and per GIF (`gifs`).
// Kept apart from the renderer so the tests can check them without a browser.

export const shots = [
  { file: "card", type: "dockhand-card", theme: "light", width: 460, config: {} },
  { file: "card-dark", type: "dockhand-card", theme: "dark", width: 460, config: { show_containers: true, only_problems: true, expand_stacks: true, expand_containers: true } },
  { file: "card-containers", type: "dockhand-card", theme: "light", width: 460, config: { show_stats: false, show_counts: false, show_stacks: false, show_containers: true, expand_containers: true } },
  { file: "card-containers-dark", type: "dockhand-card", theme: "dark", width: 460, config: { show_stats: false, show_counts: false, show_stacks: false, show_containers: true, expand_containers: true } },
  { file: "mini-card", type: "dockhand-mini-card", theme: "light", width: 380, config: {} },
  { file: "mini-card-dark", type: "dockhand-mini-card", theme: "dark", width: 380, config: {} },
  { file: "mini-card-zoom", type: "dockhand-mini-card", theme: "light", width: 460, config: {}, zoom: true },
  { file: "mini-card-zoom-dark", type: "dockhand-mini-card", theme: "dark", width: 460, config: {}, zoom: true },
];

// One looping GIF per animation. Each scenario replays `events` (a click on a card element, or a state
// update) at fixed times; every animation is paused and stepped frame by frame from the event that started
// it, so the GIF is identical whatever the machine's speed. `measure` is clicked once beforehand to size
// the frame on the tallest state of the card. Every animation is recorded in both themes: each light GIF
// gets a `-dark` twin with the exact same setup.
const lightGifs = [
  {
    file: "card-sections",
    type: "dockhand-card",
    theme: "light",
    width: 460,
    config: {},
    seconds: 4,
    measure: ['[data-section="stacks"]'],
    events: [
      { at: 0.5, click: '[data-section="stacks"]' },
      { at: 2.9, click: '[data-section="stacks"]' },
    ],
  },
  {
    file: "card-gauges",
    type: "dockhand-card",
    theme: "light",
    width: 460,
    config: { show_stacks: false, show_containers: false },
    seconds: 4,
    events: [
      {
        at: 0.5,
        states: {
          "sensor.host_utilisation_cpu": { state: "67.3" },
          "sensor.host_utilisation_memoire": { state: "82.6", attributes: { memory_used_bytes: 55466431283 } },
        },
      },
      {
        at: 2.2,
        states: {
          "sensor.host_utilisation_cpu": { state: "12.4" },
          "sensor.host_utilisation_memoire": { state: "38.2", attributes: { memory_used_bytes: 25652436582 } },
        },
      },
    ],
  },
  {
    file: "mini-card-zoom",
    type: "dockhand-mini-card",
    theme: "light",
    width: 460,
    config: {},
    seconds: 4,
    measure: [".zoom"],
    events: [
      { at: 0.6, click: ".zoom" },
      { at: 2.9, click: ".zoom" },
    ],
  },
];
export const gifs = [...lightGifs, ...lightGifs.map((g) => ({ ...g, file: `${g.file}-dark`, theme: "dark" }))];
