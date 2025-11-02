// SPDX-License-Identifier: GPL-3.0-only
// Realtime Capture Plugin
// Provides real-time indexing and capture functionality for the OpenCode ecosystem

/**
 * Realtime Capture Plugin - Provides real-time indexing and capture functionality
 * Dynamically imports the plugin from opencode-client to avoid circular dependencies
 */
export const RealtimeCapturePlugin = async (pluginContext: any) => {
  const { RealtimeCapturePlugin: ClientPlugin } = await import('@promethean-os/opencode-client');
  return await ClientPlugin(pluginContext);
};

export default RealtimeCapturePlugin;
