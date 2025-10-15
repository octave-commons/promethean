#!/usr/bin/env node

import path from "node:path";
import { loadKanbanConfig } from "./config.js";
import { createTaskCache } from "./task-cache.js";
import { createTaskOperations } from "./task-operations.js";
import { fileURLToPath } from "node:url";

const isCliExecution =   : boolean => {
  const entry = process.argv[1];
  if  typeof entry !== "string" || entry.length === 0  {
    return false;
  }
  const modulePath = fileURLToPath import.meta.url ;
  return path.resolve entry  === modulePath;
};

const testCachePerformance = async   : Promise<void> => {
  console.log "Testing cache performance..." ;

  const { config } = await loadKanbanConfig  ;
  const cache = await createTaskCache {
    path: config.cachePath,
    namespace: "kanban",
    defaultTtlMs: 24 * 60 * 60 * 1000,
  } ;

  try {
    const taskOps = createTaskOperations cache ;

    // Test 1: Get task count
    const totalTasks = await taskOps.getTotalTaskCount  ;
    console.log `✓ Total tasks in cache: ${totalTasks}` ;

    // Test 2: Get tasks by status  streaming 
    console.log "✓ Testing streaming tasks by status..." ;
    const todoTasks = await taskOps.getTasksByStatus 'todo', { limit: 10 } ;
    console.log `✓ Found ${todoTasks.length} todo tasks  showing first 3 ` ;
    todoTasks.slice 0, 3 .forEach task => {
      console.log `  - ${task.title}  ${task.priority} ` ;
    } ;

    // Test 3: Search tasks
    console.log "✓ Testing task search..." ;
    const searchResults = await taskOps.searchTasks "test", { limit: 5 } ;
    console.log `✓ Found ${searchResults.length} tasks matching "test"` ;

    // Test 4: Get statistics
    console.log "✓ Getting task statistics..." ;
    const stats = await taskOps.getTaskStatistics  ;
    console.log `✓ Statistics: ${stats.total} total tasks` ;
    Object.entries stats.byStatus .forEach  [status, count]  => {
      if  count > 0  {
        console.log `  - ${status}: ${count}` ;
      }
    } ;

    console.log "✅ Cache performance test completed successfully!" ;

  } finally {
    await cache.close  ;
  }
};

if  isCliExecution    {
  testCachePerformance  .catch  err  => {
    console.error "Cache test failed:", err ;
    process.exit 1 ;
  } ;
}