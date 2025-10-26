// SPDX-License-Identifier: GPL-3.0-only
// Plugin exports for @promethean/opencode-client

export { OpencodeInterfacePlugin } from './opencode-interface/index.js';
export { default as OpencodeInterfacePluginDefault } from './opencode-interface/index.js';

export { RealtimeCapturePlugin } from './realtime-capture/index.js';
export { default as RealtimeCapturePluginDefault } from './realtime-capture/index.js';

// Re-export for convenience
export { OpencodeInterfacePlugin as default } from './opencode-interface/index.js';
