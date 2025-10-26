// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides unified context search and OpenCode functionality as tools within the OpenCode ecosystem

/**
 * OpenCode Interface Plugin - Provides OpenCode functionality as tools
 * Dynamically imports the plugin from opencode-client to avoid circular dependencies
 */
export const OpencodeInterfacePlugin = async (pluginContext: any) => {
  const { OpencodeInterfacePlugin: ClientPlugin } = await import('@promethean-os/opencode-client');
  return await ClientPlugin(pluginContext);
};

export default OpencodeInterfacePlugin;
