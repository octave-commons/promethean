import path from 'node:path';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import test from 'ava';
import { createTask, loadBoard } from '../lib/kanban.js';
import { withTempDir, makeBoard } from '../test-utils/helpers.js';
test('createTask is idempotent - same title returns existing task', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'Test Task for Idempotency';
    const taskContent = 'This is a test task content';
    // Create first task
    const firstTask = await createTask(board, 'todo', { title: taskTitle, content: taskContent }, tasksDir, boardPath);
    // Create second task with same title
    const secondTask = await createTask(board, 'todo', { title: taskTitle, content: taskContent }, tasksDir, boardPath);
    // Should return the same task (idempotent)
    t.is(firstTask.uuid, secondTask.uuid, 'Should return existing task UUID');
    t.is(firstTask.title, secondTask.title, 'Titles should match');
    t.is(firstTask.status, secondTask.status, 'Status should match');
});
test('createTask prevents duplicate titles with different content', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'Duplicate Test Task';
    // Create first task
    const firstTask = await createTask(board, 'todo', { title: taskTitle, content: 'First content' }, tasksDir, boardPath);
    // Attempt to create second task with same title but different content
    const secondTask = await createTask(board, 'todo', { title: taskTitle, content: 'Different content' }, tasksDir, boardPath);
    // Should return the first task, not create a duplicate
    t.is(firstTask.uuid, secondTask.uuid, 'Should return existing task UUID');
    t.is(firstTask.content, secondTask.content, 'Should preserve original content');
});
test('createTask allows same title in different columns', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'Multi-Column Task';
    // Create task in todo column
    const todoTask = await createTask(board, 'todo', { title: taskTitle, content: 'Todo content' }, tasksDir, boardPath);
    // Create task with same title in ready column
    const readyTask = await createTask(board, 'ready', { title: taskTitle, content: 'Ready content' }, tasksDir, boardPath);
    // Should create different tasks for different columns
    t.not(todoTask.uuid, readyTask.uuid, 'Different columns should have different tasks');
    t.is(todoTask.title, readyTask.title, 'Titles should be the same');
    t.is(todoTask.status, 'todo', 'First task should be in todo');
    t.is(readyTask.status, 'ready', 'Second task should be in ready');
});
test('createTask handles case-insensitive title matching', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    // Create task with lowercase title
    const firstTask = await createTask(board, 'todo', { title: 'case sensitive task', content: 'First' }, tasksDir, boardPath);
    // Create task with uppercase title
    const secondTask = await createTask(board, 'todo', { title: 'CASE SENSITIVE TASK', content: 'Second' }, tasksDir, boardPath);
    // Should treat as duplicate (case-insensitive)
    t.is(firstTask.uuid, secondTask.uuid, 'Should handle case-insensitive matching');
});
test('createTask trims whitespace for title matching', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    // Create task with normal title
    const firstTask = await createTask(board, 'todo', { title: 'Whitespace Task', content: 'First' }, tasksDir, boardPath);
    // Create task with extra whitespace
    const secondTask = await createTask(board, 'todo', { title: '  Whitespace Task  ', content: 'Second' }, tasksDir, boardPath);
    // Should treat as duplicate after trimming
    t.is(firstTask.uuid, secondTask.uuid, 'Should trim whitespace for matching');
});
test('board regeneration does not create duplicate tasks', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'Regeneration Test Task';
    // Create initial task
    const originalTask = await createTask(board, 'todo', { title: taskTitle, content: 'Original content' }, tasksDir, boardPath);
    // Count files before regeneration
    const filesBefore = await readdir(tasksDir);
    const fileCountBefore = filesBefore.length;
    // Regenerate board (simulates the operation that was causing duplicates)
    const regeneratedBoard = await loadBoard(boardPath, tasksDir);
    // Count files after regeneration
    const filesAfter = await readdir(tasksDir);
    const fileCountAfter = filesAfter.length;
    // Should not create new files during regeneration
    t.is(fileCountBefore, fileCountAfter, 'Regeneration should not create new files');
    // Should still find the original task
    const todoColumn = regeneratedBoard.columns.find((col) => col.name === 'todo');
    const regeneratedTask = todoColumn?.tasks.find((task) => task.title === taskTitle);
    t.truthy(regeneratedTask, 'Original task should still exist after regeneration');
    if (regeneratedTask) {
        t.is(originalTask.uuid, regeneratedTask.uuid, 'Task UUID should be preserved');
    }
});
test('multiple rapid createTask calls do not create duplicates', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'Rapid Creation Test';
    // Create multiple tasks rapidly (simulates concurrent operations)
    const tasks = await Promise.all([
        createTask(board, 'todo', { title: taskTitle, content: 'Content 1' }, tasksDir, boardPath),
        createTask(board, 'todo', { title: taskTitle, content: 'Content 2' }, tasksDir, boardPath),
        createTask(board, 'todo', { title: taskTitle, content: 'Content 3' }, tasksDir, boardPath),
        createTask(board, 'todo', { title: taskTitle, content: 'Content 4' }, tasksDir, boardPath),
        createTask(board, 'todo', { title: taskTitle, content: 'Content 5' }, tasksDir, boardPath),
    ]);
    // All should return the same task
    const firstUuid = tasks[0].uuid;
    for (const task of tasks) {
        t.is(task.uuid, firstUuid, 'All rapid calls should return same task');
    }
    // Should only have one file created
    const files = await readdir(tasksDir);
    const taskFiles = files.filter((file) => file.includes('.md'));
    t.is(taskFiles.length, 1, 'Should only create one task file');
});
test('createTask with UUID uses existing task if title matches', async (t) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    await mkdir(tasksDir, { recursive: true });
    await writeFile(boardPath, '', 'utf8');
    const board = makeBoard([]);
    const taskTitle = 'UUID Test Task';
    const specificUuid = 'specific-test-uuid-12345';
    // Create task with specific UUID
    const firstTask = await createTask(board, 'todo', { title: taskTitle, content: 'First', uuid: specificUuid }, tasksDir, boardPath);
    // Create task with same title but different UUID
    const secondTask = await createTask(board, 'todo', { title: taskTitle, content: 'Second', uuid: 'different-uuid-67890' }, tasksDir, boardPath);
    // Should return the existing task, ignore the new UUID
    t.is(firstTask.uuid, secondTask.uuid, 'Should use existing task UUID');
    t.is(firstTask.uuid, specificUuid, 'Should preserve original UUID');
});
