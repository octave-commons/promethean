import test from 'ava';
import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';

import { executeCommand, type CliContext } from '../cli/command-handlers.js';
import { withTempDir } from '../test-utils/helpers.js';

test('e2e - complete workflow with move operations', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Phase 1: Create initial tasks
  const task1 = (await executeCommand(
    'create',
    ['Initial Task 1', '--status=Todo'],
    context,
  )) as any;
  const task2 = (await executeCommand(
    'create',
    ['Initial Task 2', '--status=Todo'],
    context,
  )) as any;
  const task3 = (await executeCommand(
    'create',
    ['Initial Task 3', '--status=Todo'],
    context,
  )) as any;

  // Verify initial board state
  const initialBoardContent = await readFile(boardPath, 'utf8');
  t.true(initialBoardContent.includes('## Todo'));
  t.true(initialBoardContent.includes('Initial Task 1'));
  t.true(initialBoardContent.includes('Initial Task 2'));
  t.true(initialBoardContent.includes('Initial Task 3'));

  // Phase 2: Move tasks around
  // Move task3 to top
  const move1Result = (await executeCommand('move_up', [task3.uuid], context)) as any;
  t.truthy(move1Result);
  t.is(move1Result.rank, 1);

  // Move task3 to top again
  const move2Result = (await executeCommand('move_up', [task3.uuid], context)) as any;
  t.truthy(move2Result);
  t.is(move2Result.rank, 0);

  // Move task1 to bottom
  const move3Result = (await executeCommand('move_down', [task1.uuid], context)) as any;
  t.truthy(move3Result);
  t.is(move3Result.rank, 2);

  const move4Result = (await executeCommand('move_down', [task1.uuid], context)) as any;
  t.truthy(move4Result);
  t.is(move4Result.rank, 2);

  // Phase 3: Add more tasks to different columns
  const task4 = (await executeCommand(
    'create',
    ['Progress Task 1', '--status=In Progress'],
    context,
  )) as any;
  const task5 = (await executeCommand('create', ['Done Task 1', '--status=Done'], context)) as any;

  // Phase 4: Move tasks in different columns
  const progressMove = (await executeCommand('move_up', [task4.uuid], context)) as any;
  t.truthy(progressMove);
  t.is(progressMove.column, 'In Progress');

  const doneMove = (await executeCommand('move_up', [task5.uuid], context)) as any;
  t.truthy(doneMove);
  t.is(doneMove.column, 'Done');

  // Phase 5: Verify final board state
  const finalBoardContent = await readFile(boardPath, 'utf8');
  t.true(finalBoardContent.includes('## Todo'));
  t.true(finalBoardContent.includes('## In Progress'));
  t.true(finalBoardContent.includes('## Done'));

  // Verify all tasks are present
  t.true(finalBoardContent.includes('Initial Task 1'));
  t.true(finalBoardContent.includes('Initial Task 2'));
  t.true(finalBoardContent.includes('Initial Task 3'));
  t.true(finalBoardContent.includes('Progress Task 1'));
  t.true(finalBoardContent.includes('Done Task 1'));

  // Phase 6: Test board persistence by creating new context
  const newContext: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Should still be able to move tasks
  const persistenceMove = (await executeCommand('move_down', [task2.uuid], newContext)) as any;
  t.truthy(persistenceMove);
});

test('e2e - large scale move operations', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create 50 tasks
  const tasks: any[] = [];
  for (let i = 0; i < 50; i++) {
    const task = (await executeCommand(
      'create',
      [`Task ${i + 1}`, '--status=Todo'],
      context,
    )) as any;
    tasks.push(task);
  }

  // Perform various move operations
  // Move last task to front
  const lastTask = tasks[tasks.length - 1];
  for (let i = 0; i < 49; i++) {
    const result = (await executeCommand('move_up', [lastTask.uuid], context)) as any;
    t.truthy(result);
  }

  // Move first task (originally last) to end
  for (let i = 0; i < 49; i++) {
    const result = (await executeCommand('move_down', [lastTask.uuid], context)) as any;
    t.truthy(result);
  }

  // Verify board file is still valid
  const boardContent = await readFile(boardPath, 'utf8');
  t.true(boardContent.includes('## Todo'));

  // Count occurrences of "Task" to ensure all tasks are present
  const taskMatches = boardContent.match(/Task \d+/g);
  t.is(taskMatches?.length, 50);
});

test('e2e - move operations with task updates', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create tasks
  await executeCommand('create', ['Original Task 1', '--status=Todo'], context);
  const task2 = (await executeCommand(
    'create',
    ['Original Task 2', '--status=Todo'],
    context,
  )) as any;
  await executeCommand('create', ['Original Task 3', '--status=Todo'], context);

  // Move task2 up
  const moveResult = (await executeCommand('move_up', [task2.uuid], context)) as any;
  t.truthy(moveResult);
  t.is(moveResult.rank, 0);

  // Update task content
  await executeCommand('update', [task2.uuid, '--title=Updated Task 2'], context);

  // Move task2 down
  const moveDownResult = (await executeCommand('move_down', [task2.uuid], context)) as any;
  t.truthy(moveDownResult);

  // Verify final state
  const boardContent = await readFile(boardPath, 'utf8');
  t.true(boardContent.includes('Updated Task 2'));
  t.true(boardContent.includes('Original Task 1'));
  t.true(boardContent.includes('Original Task 3'));
});

test('e2e - move operations across workflow transitions', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create task and move through workflow
  const task = (await executeCommand('create', ['Workflow Task', '--status=Todo'], context)) as any;

  // Move within Todo (no-op since single task)
  const todoMove = (await executeCommand('move_up', [task.uuid], context)) as any;
  t.truthy(todoMove);
  t.is(todoMove.column, 'Todo');

  // Move to In Progress
  await executeCommand('update-status', [task.uuid, 'In Progress'], context);

  // Move within In Progress (no-op since single task)
  const progressMove = (await executeCommand('move_up', [task.uuid], context)) as any;
  t.truthy(progressMove);
  t.is(progressMove.column, 'In Progress');

  // Add another task to In Progress
  const task2 = (await executeCommand(
    'create',
    ['Another Task', '--status=In Progress'],
    context,
  )) as any;

  // Now moves should work within In Progress
  const progressMove2 = (await executeCommand('move_up', [task2.uuid], context)) as any;
  t.truthy(progressMove2);
  t.is(progressMove2.column, 'In Progress');

  // Move to Done
  await executeCommand('update-status', [task.uuid, 'Done'], context);

  // Move within Done (no-op since single task)
  const doneMove = (await executeCommand('move_up', [task.uuid], context)) as any;
  t.truthy(doneMove);
  t.is(doneMove.column, 'Done');

  // Verify final board state
  const boardContent = await readFile(boardPath, 'utf8');
  t.true(boardContent.includes('## Todo'));
  t.true(boardContent.includes('## In Progress'));
  t.true(boardContent.includes('## Done'));
  t.true(boardContent.includes('Workflow Task'));
  t.true(boardContent.includes('Another Task'));
});
