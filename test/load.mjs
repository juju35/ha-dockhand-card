// Test loader: evaluates the card source (a plain script, as shipped in dist/) in an isolated context
// with minimal browser stubs, and returns the requested top-level bindings. The bundle is unchanged.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export const load = (file, names) => {
  const src = readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = { addEventListener() {}, innerHTML: "" };
      return this.shadowRoot;
    }
    dispatchEvent() {}
  }
  const registry = new Map();
  const context = {
    HTMLElement,
    customElements: { get: (n) => registry.get(n), define: (n, c) => registry.set(n, c) },
    window: {},
    document: { addEventListener() {}, removeEventListener() {} },
    console: { info() {}, error() {}, log() {} },
    CustomEvent: class {},
    Intl,
    Date,
  };
  vm.createContext(context);
  return vm.runInContext(`${src}\n;({ ${names.join(", ")} })`, context);
};
