// SPDX-License-Identifier: GPL-3.0-only
// State Composable - Manages indexer state persistence

import { join } from 'path';
import type { IndexerState } from '../indexer-types.js';
import { createStateManager } from '../indexer-types.js';

export type StateConfig = {
  readonly stateFile?: string;
};

export type StateManager = {
  readonly loadState: () => Promise<Readonly<IndexerState>>;
  readonly saveState: (state: Readonly<IndexerState>) => Promise<void>;
};

export const createStateManagerComposable = (config: StateConfig = {}): StateManager => {
  const stateFile = config.stateFile || join(process.cwd(), '.indexer-state.json');
  const { loadState, saveState } = createStateManager(stateFile);

  return { loadState, saveState };
};
