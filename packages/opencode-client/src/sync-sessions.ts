#!/usr/bin/env node

/**
 * Bridge to sync sessions from Promethean MongoDB storage to opencode-ai file storage
 */

import { DualStoreManager } from '@promethean/persistence';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const OPENCODE_STORAGE_DIR = `${process.env.HOME}/.local/share/opencode/storage/session`;

async function syncSessions() {
  try {
    console.log('🔄 Starting session sync...');

    // Initialize Promethean session store
    const sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');

    // Get all sessions from Promethean storage
    const sessions = await sessionStore.getMostRecent(1000);
    console.log(`📦 Found ${sessions.length} sessions in Promethean storage`);

    // Ensure opencode storage directory exists
    if (!existsSync(OPENCODE_STORAGE_DIR)) {
      mkdirSync(OPENCODE_STORAGE_DIR, { recursive: true });
      console.log(`📁 Created opencode storage directory: ${OPENCODE_STORAGE_DIR}`);
    }

    // Get the main session directory (usually a hash)
    const sessionDirs = readdirSync(OPENCODE_STORAGE_DIR);
    const mainSessionDir =
      sessionDirs.find((dir: string) => dir.length === 40 && dir !== 'global') || 'global';
    const targetDir = join(OPENCODE_STORAGE_DIR, mainSessionDir);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    let syncedCount = 0;

    for (const sessionEntry of sessions) {
      try {
        let sessionData;
        try {
          sessionData = JSON.parse(sessionEntry.text);
        } catch (error) {
          console.log(`⚠️  Skipping malformed session: ${sessionEntry.id}`);
          continue;
        }

        // Create opencode-ai compatible session format
        const opencodeSession = {
          id: sessionData.id,
          title: sessionData.title || 'Untitled Session',
          createdAt: sessionData.createdAt || new Date().toISOString(),
          updatedAt: sessionData.lastActivityTime || sessionData.createdAt,
          messages: [], // Start with empty messages
          metadata: {
            source: 'promethean-sync',
            originalId: sessionEntry.id,
            activityStatus: sessionData.activityStatus || 'active',
            isAgentTask: sessionData.isAgentTask || false,
          },
        };

        // Write session to opencode-ai format
        const sessionFile = join(targetDir, `${sessionData.id}.json`);
        writeFileSync(sessionFile, JSON.stringify(opencodeSession, null, 2));

        syncedCount++;
        console.log(`✅ Synced session: ${sessionData.title} (${sessionData.id})`);
      } catch (error) {
        console.error(
          `❌ Failed to sync session ${sessionEntry.id}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    console.log(`\n🎉 Sync complete! ${syncedCount} sessions synced to opencode-ai storage`);
    console.log(`📂 Sessions stored in: ${targetDir}`);
    console.log(`\n💡 Restart the opencode-ai TUI to see the synced sessions`);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncSessions().catch(console.error);
