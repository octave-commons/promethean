import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import test from "ava";

import { EventLogManager } from "../board/event-log.js";
import { withTempDir } from "../test-utils/helpers.js";

const makeConfig = async (repo: string) => {
  const cachePath = path.join(repo, ".cache");
  await mkdir(cachePath, { recursive: true });
  const tasksDir = path.join(repo, "tasks");
  await mkdir(tasksDir, { recursive: true });
  return {
    repo,
    tasksDir,
    indexFile: path.join(repo, "index.jsonl"),
    boardFile: path.join(repo, "board.md"),
    cachePath,
    exts: new Set([".md"]),
    requiredFields: ["title", "status", "priority"],
    statusValues: new Set(["todo", "in_progress", "done"]),
    priorityValues: new Set(["P1", "P2", "P3"]),
    wipLimits: {},
  } as const;
};

test("EventLogManager records and retrieves transitions", async (t) => {
  const repo = await withTempDir(t);
  const config = await makeConfig(repo);
  const manager = new EventLogManager(config);

  const taskId = randomUUID();
  await manager.logTransition(
    taskId,
    "todo",
    "in_progress",
    "human",
    "started",
    { priority: "P1" },
  );
  await manager.logTransition(taskId, "in_progress", "done", "system");

  const history = await manager.getTaskHistory(taskId);
  t.is(history.length, 2);
  t.deepEqual(history.map((event) => event.toStatus), ["in_progress", "done"]);

  const replay = await manager.replayTaskTransitions(taskId, "todo");
  t.true(replay.isValid);
  t.is(replay.finalStatus, "done");
  t.truthy(replay.lastValidEvent);

  const allEvents = await manager.readEventLog();
  t.is(allEvents.length, 2);
  t.deepEqual(
    new Set(allEvents.map((event) => event.taskId)),
    new Set([taskId]),
  );
});

test("EventLogManager clears the log and reports statistics", async (t) => {
  const repo = await withTempDir(t);
  const config = await makeConfig(repo);
  const manager = new EventLogManager(config);

  const firstTask = randomUUID();
  const secondTask = randomUUID();

  await manager.logTransition(firstTask, "incoming", "accepted", "human");
  await manager.logTransition(secondTask, "accepted", "breakdown", "agent");

  const stats = await manager.getLogStats();
  t.is(stats.totalEvents, 2);
  t.is(stats.uniqueTasks, 2);
  t.truthy(stats.dateRange.earliest);
  t.truthy(stats.dateRange.latest);

  const logFile = path.join(config.cachePath, "event-log.jsonl");
  const beforeClear = await readFile(logFile, "utf8");
  t.true(beforeClear.length > 0);

  await manager.clearLog();
  const afterClear = await readFile(logFile, "utf8");
  t.is(afterClear, "");

  const emptyStats = await manager.getLogStats();
  t.is(emptyStats.totalEvents, 0);
  t.is(emptyStats.uniqueTasks, 0);
  t.deepEqual(emptyStats.dateRange, { earliest: null, latest: null });
});
