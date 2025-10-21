#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function debugWIP() {
  try {
    console.log('Testing pnpm kanban count...');
    const { stdout: countOutput } = await execAsync('pnpm kanban count');
    console.log('Count output:', countOutput);

    console.log('\nTesting pnpm kanban count --json...');
    const { stdout: jsonOutput } = await execAsync('pnpm kanban count --json');
    console.log('JSON output:', jsonOutput);

    console.log('\nTesting pnpm kanban getColumn todo...');
    const { stdout: todoOutput } = await execAsync('pnpm kanban getColumn todo');
    console.log('Todo output length:', todoOutput.length);

    console.log('\nTesting pnpm kanban getColumn in_progress...');
    const { stdout: inProgressOutput } = await execAsync('pnpm kanban getColumn in_progress');
    console.log('In progress output length:', inProgressOutput.length);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stdout:', error.stdout);
    console.error('Stderr:', error.stderr);
  }
}

debugWIP();