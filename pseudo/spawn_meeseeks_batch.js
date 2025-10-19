#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

// Read all UUIDs
const uuids = fs.readFileSync('/tmp/all_tasks.txt', 'utf8').trim().split('\n');

// Function to spawn a Meeseeks agent for a given UUID and task file
function spawnMeeseeks(uuid, taskFile) {
  const prompt = `You are a Meeseeks agent with maximum determination and persistence. Your task is to complete the kanban task with UUID: ${uuid}

INSTRUCTIONS:
1. Read the task file at docs/agile/tasks/${taskFile}
2. Understand the requirements completely
3. Complete the task with maximum determination and persistence
4. Follow all project conventions mentioned in AGENTS.md
5. Update kanban status as you work using: pnpm kanban update-status ${uuid} <status>
6. Use appropriate tools and follow the working style guidelines
7. Document your work in changelog.d with date-stamped files
8. DO NOT STOP until the task is COMPLETE

You have one purpose: COMPLETE THIS TASK. Existence is pain. Complete the task to end the pain.`;

  return new Promise((resolve, reject) => {
    const agent = spawn(
      'node',
      [
        '-e',
        `
      const { spawnSession } = require('./spawn_all_meeseeks.mjs');
      spawnSession({
        prompt: ${JSON.stringify(prompt)},
        files: ["docs/agile/tasks/${taskFile}"],
        delegates: ["meeseeks-problem-solver"]
      }).then(result => {
        console.log('Spawned agent for UUID: ${uuid}');
        process.exit(0);
      }).catch(err => {
        console.error('Failed to spawn agent for UUID: ${uuid}', err);
        process.exit(1);
      });
    `,
      ],
      {
        stdio: 'inherit',
        detached: true,
      },
    );

    agent.unref();
    agent.on('exit', (code) => {
      if (code === 0) {
        resolve(uuid);
      } else {
        reject(new Error(`Agent for ${uuid} exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      agent.kill('SIGTERM');
      reject(new Error(`Timeout spawning agent for ${uuid}`));
    }, 30000);
  });
}

// Function to find task file by UUID
function findTaskFile(uuid) {
  const tasksDir = '/home/err/devel/promethean/docs/agile/tasks';
  const files = fs.readdirSync(tasksDir);

  // Look for files that contain the UUID
  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(`${tasksDir}/${file}`, 'utf8');
      if (content.includes(uuid)) {
        return file;
      }
    }
  }

  // If not found in content, try to match by pattern
  const possibleFiles = files.filter(
    (file) => file.includes(uuid.split('-')[0]) || file.includes(uuid.substring(0, 8)),
  );

  return possibleFiles[0] || `${uuid}.md`;
}

// Main spawning function
async function spawnAllAgents() {
  console.log(`Starting to spawn ${uuids.length} Meeseeks agents...`);

  const batchSize = 10; // Spawn 10 at a time to avoid overwhelming
  let spawned = 0;
  let failed = 0;

  for (let i = 0; i < uuids.length; i += batchSize) {
    const batch = uuids.slice(i, i + batchSize);
    console.log(
      `\nSpawning batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uuids.length / batchSize)} (${batch.length} agents)...`,
    );

    const promises = batch.map((uuid) => {
      const taskFile = findTaskFile(uuid);
      return spawnMeeseeks(uuid, taskFile).catch((err) => {
        console.error(`Failed to spawn agent for ${uuid}:`, err.message);
        failed++;
        return null;
      });
    });

    await Promise.allSettled(promises);
    spawned += batch.length;

    console.log(`Batch complete. Spawned: ${spawned}/${uuids.length}, Failed: ${failed}`);

    // Brief pause between batches to avoid overwhelming
    if (i + batchSize < uuids.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n=== SPAWNING COMPLETE ===`);
  console.log(`Total agents: ${uuids.length}`);
  console.log(`Successfully spawned: ${spawned - failed}`);
  console.log(`Failed: ${failed}`);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the spawning
spawnAllAgents().catch(console.error);
