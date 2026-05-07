// Central module registry. Modules self-register by calling registerModule() at
// import time. The shell reads getModules() to render nav and content — no
// changes needed to the shell when adding a new module.
//
// To add a module:
//   1. Create the module file and call registerModule() at the bottom.
//   2. Add one import line to components/modules/index.js.

const _registry = new Map();

export function registerModule(config) {
  _registry.set(config.id, config);
}

export function getModules() {
  return [..._registry.values()];
}

export function getModule(id) {
  return _registry.get(id) ?? null;
}
