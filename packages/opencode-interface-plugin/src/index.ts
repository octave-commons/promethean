// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides unified context search and OpenCode functionality as tools within the OpenCode ecosystem

import { OpencodeInterfacePlugin as ClientPlugin } from '@promethean-os/opencode-client';

/**
 * OpenCode Interface Plugin - Provides OpenCode functionality as tools
 * This is a re-export of the plugin from opencode-client for independent use
 */
export const OpencodeInterfacePlugin = ClientPlugin;

export default OpencodeInterfacePlugin;
