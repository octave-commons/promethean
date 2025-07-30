import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { join } from 'path';
import { writeFile } from 'fs/promises';

const repoRoot = join(__dirname, '..', '..');

function runPython(script: string, capture = false): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [script], { cwd: repoRoot });
    let data = '';

    proc.stdout.on('data', chunk => {
      if (capture) {
        data += chunk.toString();
      } else {
        process.stdout.write(chunk);
      }
    });
    proc.stderr.on('data', chunk => process.stderr.write(chunk));
    proc.on('close', code => {
      if (code === 0) {
        resolve(capture ? data : undefined);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

async function updateFromBoard() {
  try {
    await runPython(join('scripts', 'kanban_to_hashtags.py'));
  } catch (err) {
    console.error('kanban_to_hashtags failed', err);
  }
}

async function updateBoard() {
  try {
    const output = await runPython(join('scripts', 'hashtags_to_kanban.py'), true);
    const boardPath = join(repoRoot, 'docs', 'agile', 'boards', 'kanban.md');
    if (typeof output === 'string') {
      await writeFile(boardPath, output);
    }
  } catch (err) {
    console.error('hashtags_to_kanban failed', err);
  }
}

const boardPath = join(repoRoot, 'docs', 'agile', 'boards', 'kanban.md');
const tasksPath = join(repoRoot, 'docs', 'agile', 'tasks');

chokidar.watch(boardPath, { ignoreInitial: true }).on('change', () => {
  console.log('Board changed, syncing hashtags...');
  updateFromBoard();
});

chokidar.watch(tasksPath, { ignoreInitial: true }).on('change', () => {
  console.log('Task file changed, regenerating board...');
  updateBoard();
});

console.log('File watcher running...');
