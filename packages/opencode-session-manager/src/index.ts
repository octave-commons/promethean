/**
 * OpenCode Session Manager
 *
 * A web components-based session management interface for OpenCode
 * built with ClojureScript and Reagent.
 */

// Main entry point for the package
export * from './opencode/client.js';
export * from './types.js';

// Web components are registered automatically via ClojureScript
// but can be accessed through the global customElements registry
