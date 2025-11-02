// SPDX-License-Identifier: GPL-3.0-only
// Event Hooks Plugin
// Provides event hook management and processing functionality for the OpenCode ecosystem

/**
 * Event Hooks Plugin - Provides event hook management and processing functionality
 * Dynamically imports the plugin from opencode-client to avoid circular dependencies
 */
export const EventHooksPlugin = async (pluginContext: any) => {
  const { EventHooksPlugin: ClientPlugin } = await import('@promethean-os/opencode-client');
  return await ClientPlugin(pluginContext);
};

export default EventHooksPlugin;
