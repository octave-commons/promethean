export * from './types.js';
export * from './hook-registry.js';
export * from './plugin-manager.js';

// Convenience exports
export { DefaultHookRegistry as HookRegistry } from './hook-registry.js';
export { DefaultPluginManager as PluginManager } from './plugin-manager.js';

// Example plugins
export * from './examples/logger-plugin.js';
export * from './examples/metrics-plugin.js';
