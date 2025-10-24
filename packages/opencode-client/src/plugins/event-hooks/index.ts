// SPDX-License-Identifier: GPL-3.0-only
// Event Hooks Plugin for @promethean-os/opencode-client

import type { HookablePlugin } from '../../types/plugin-hooks.js';
import {
  hookManager,
  registerBeforeHook,
  registerAfterHook,
  createHookRegistration,
} from '../../hooks/tool-execute-hooks.js';

export class EventHooksPlugin implements HookablePlugin {
  id = 'event-hooks';
  name = 'Event Hooks Plugin';
  version = '1.0.0';
  hookManager = hookManager;

  constructor(public options: Record<string, unknown> = {}) {}

  async init(): Promise<void> {
    // No-op for now. Plugin can be initialized with options if needed.
  }

  async shutdown(): Promise<void> {
    // Clear any registered hooks owned by this plugin if needed.
    // We intentionally do not clear all hooks here to avoid impacting other plugins
    // unless explicitly requested by the runtime.
  }

  /** Convenience API to register a before hook */
  registerBefore(id: string, hook: any, opts: Partial<any> = {}): void {
    registerBeforeHook(id, hook, opts);
  }

  /** Convenience API to register an after hook */
  registerAfter(id: string, hook: any, opts: Partial<any> = {}): void {
    registerAfterHook(id, hook, opts);
  }

  /** Create a HookRegistration object without registering it */
  createRegistration(id: string, hook: any, opts: Partial<any> = {}) {
    return createHookRegistration(id, hook, opts);
  }
}

export default EventHooksPlugin;
