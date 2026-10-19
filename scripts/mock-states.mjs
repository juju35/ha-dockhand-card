// Mock Home Assistant registries and states shaped like the Dockhand integration,
// used to render screenshots. Entity ids are in French on purpose: the cards never rely on them.
export const states = {};
export const entities = {};
export const devices = {};

const device = (id, name, model, via) => (devices[id] = { id, name, model, via_device_id: via || null, name_by_user: null });
const entity = (entity_id, device_id, translation_key, state, attributes = {}) => {
  entities[entity_id] = { entity_id, device_id, platform: "dockhand", translation_key: translation_key || null };
  states[entity_id] = { entity_id, state: String(state), attributes };
};

device("env", "Docker host", "Environment");
device("grp_c", "Docker host – Containers", "Environment Group", "env");
device("grp_s", "Docker host – Stacks", "Environment Group", "env");

entity("binary_sensor.host_en_ligne", "env", "online", "on", { name: "Docker host", device_class: "connectivity" });
entity("sensor.host_utilisation_cpu", "env", "cpu_usage", "12.4", { cpu_count: 12, unit_of_measurement: "%" });
entity("sensor.host_utilisation_memoire", "env", "memory_usage", "38.2", {
  memory_used_bytes: 25652436582,
  memory_total_bytes: 67150643200,
  unit_of_measurement: "%",
});
entity("sensor.host_conteneurs", "env", "containers", "12", {
  running: 11, stopped: 1, paused: 0, restarting: 0, unhealthy: 1, pending_updates: 1, pending_updates_total: 2,
});
entity("sensor.host_stacks", "env", "stacks", "8", { running: 7, partial: 0, stopped: 1 });
entity("sensor.host_nombre_d_images", "env", "image_count", "13");
entity("sensor.host_nombre_de_volumes", "env", "volume_count", "6");
entity("sensor.host_nombre_de_reseaux", "env", "network_count", "10");
entity("sensor.host_version_de_docker", "env", "host_docker_version", "27.5.1");
entity("sensor.host_type_de_connexion", "env", "connection_type", "socket");

const stacks = [
  ["auth", "Git Stack", "running", ["auth-server", "auth-worker", "auth-db", "auth-cache"], false],
  ["monitoring", "Git Stack", "running", ["grafana", "prometheus"], false],
  ["dashboard", "Git Stack", "running", ["dashboard"], false],
  ["media", "Git Stack", "running", ["media-server"], true],
  ["status-page", "Git Stack", "stopped", ["status-page"], false],
  ["proxy", "Git Stack", "running", ["reverse-proxy"], false],
  ["dockhand", "Untracked Stack", "running", ["dockhand"], false],
];
for (const [name, model, status, containers, upd] of stacks) {
  const id = `stack_${name}`;
  const slug = name.replace(/-/g, "_");
  device(id, `Docker host – Stacks – ${name}`, model, "grp_s");
  entity(`sensor.host_stacks_${slug}_statut`, id, "status", status, { name, container_count: containers.length, container_names: containers });
  entity(`sensor.host_stacks_${slug}_conteneurs`, id, "containers_in_stack", containers.length);
  entity(`binary_sensor.host_stacks_${slug}_mises_a_jour_disponibles`, id, "stack_updates_available", upd ? "on" : "off");
  entity(`button.host_stacks_${slug}_redemarrer`, id, "restart", "unknown");
  entity(`switch.host_stacks_${slug}`, id, null, status === "running" ? "on" : "off");
  for (const c of containers) {
    const cid = `ct_${c}`;
    const cslug = c.toLowerCase().replace(/-/g, "_");
    const stopped = status === "stopped";
    device(cid, `Docker host – Containers – ${c}`, "Container", "grp_c");
    entity(`sensor.host_containers_${cslug}_etat`, cid, "state", stopped ? "exited" : "running", {
      name: c,
      status: stopped ? "Exited (0) 2 hours ago" : "Up 10 days",
      image: `example/${c}:latest`,
    });
    if (!stopped) entity(`sensor.host_containers_${cslug}_sante`, cid, "health", c === "auth-cache" ? "unhealthy" : "healthy");
    entity(`button.host_containers_${cslug}_redemarrer`, cid, "restart", "unknown");
    entity(`switch.host_containers_${cslug}`, cid, null, stopped ? "off" : "on");
    entity(`update.host_containers_${cslug}`, cid, null, c === "media-server" || c === "dockhand" ? "on" : "off");
  }
}
