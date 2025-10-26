#!/usr/bin/env node

// Test CLI command directly
import { spawn } from 'child_process';

async function testCLICommand() {
  console.log('Testing: opencode-client ollama list');

  const child = spawn('pnpm', ['opencode-client', 'ollama', 'list'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // Set a timeout
  const timeout = setTimeout(() => {
    console.log('\n⏰ Command timed out after 10 seconds, killing...');
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 2000);
  }, 10000);

  child.on('close', (code) => {
    clearTimeout(timeout);
    console.log(`\nCommand exited with code: ${code}`);
    if (code === 0) {
      console.log('✓ Command completed successfully');
    } else {
      console.log('✗ Command failed');
    }
  });

  child.on('error', (error) => {
    clearTimeout(timeout);
    console.error('Failed to start command:', error.message);
  });
}

testCLICommand();
