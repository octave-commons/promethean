import type { HookRegistry, HookRegistration, HookContext, HookName, PluginName } from './types.js';

export class DefaultHookRegistry implements HookRegistry {
  private hooks = new Map<HookName, HookRegistration[]>();
  private hooksByPlugin = new Map<PluginName, Set<HookName>>();

  register<T, R>(registration: HookRegistration<T, R>): void {
    const { hookName, pluginName } = registration;

    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const hookList = this.hooks.get(hookName)!;
    hookList.push(registration as HookRegistration);

    // Sort by priority (higher priority first)
    hookList.sort((a, b) => b.priority - a.priority);

    // Track plugin hooks
    if (!this.hooksByPlugin.has(pluginName)) {
      this.hooksByPlugin.set(pluginName, new Set());
    }
    this.hooksByPlugin.get(pluginName)!.add(hookName);
  }

  unregister(pluginName: PluginName, hookName: HookName): void {
    const hookList = this.hooks.get(hookName);
    if (!hookList) return;

    const index = hookList.findIndex(
      (reg) => reg.pluginName === pluginName && reg.hookName === hookName,
    );

    if (index !== -1) {
      hookList.splice(index, 1);
    }

    // Clean up empty hook lists
    if (hookList.length === 0) {
      this.hooks.delete(hookName);
    }

    // Update plugin tracking
    const pluginHooks = this.hooksByPlugin.get(pluginName);
    if (pluginHooks) {
      pluginHooks.delete(hookName);
      if (pluginHooks.size === 0) {
        this.hooksByPlugin.delete(pluginName);
      }
    }
  }

  async execute<T, R>(hookName: HookName, data: T, context?: Partial<HookContext>): Promise<R[]> {
    return this.executeWithPriority(hookName, data, context);
  }

  async executeWithPriority<T, R>(
    hookName: HookName,
    data: T,
    context?: Partial<HookContext>,
  ): Promise<R[]> {
    const hookList = this.hooks.get(hookName);
    if (!hookList || hookList.length === 0) {
      return [];
    }

    const results: R[] = [];
    const baseContext: HookContext = {
      pluginName: '',
      hookName,
      ...context,
    };

    for (const registration of hookList) {
      try {
        const hookContext: HookContext = {
          ...baseContext,
          pluginName: registration.pluginName,
        };

        const result = await Promise.resolve(registration.handler(data, hookContext));

        if (result.success && result.data !== undefined) {
          results.push(result.data as R);
        }

        // Stop execution if handler indicates it
        if (result.shouldStop) {
          break;
        }
      } catch (error) {
        console.error(
          `Error executing hook ${hookName} for plugin ${registration.pluginName}:`,
          error,
        );
      }
    }

    return results;
  }

  getRegisteredHooks(hookName?: HookName): HookRegistration[] {
    if (hookName) {
      return this.hooks.get(hookName) || [];
    }

    const allHooks: HookRegistration[] = [];
    for (const hookList of this.hooks.values()) {
      allHooks.push(...hookList);
    }
    return allHooks;
  }

  hasHook(hookName: HookName): boolean {
    const hookList = this.hooks.get(hookName);
    return hookList !== undefined && hookList.length > 0;
  }

  getPluginHooks(pluginName: PluginName): HookName[] {
    const pluginHooks = this.hooksByPlugin.get(pluginName);
    return pluginHooks ? Array.from(pluginHooks) : [];
  }

  clear(): void {
    this.hooks.clear();
    this.hooksByPlugin.clear();
  }
}
