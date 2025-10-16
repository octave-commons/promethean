## Opencode-Specific Tools

### 🚨 Process Management

**ALWAYS use these tools for long-running processes** - using regular `bash` for servers, watchers, or long installs will stall your session:

#### Basic Process Management

- `process_start` - Start background processes (servers, watchers, etc.)
- `process_stop` - Stop running processes
- `process_list` - List all active processes
- `process_status` - Check process status
- `process_tail` - View process stdout
- `process_err` - View process stderr

#### PM2 Production Process Management

- `pm2_startProcess` - Start processes with configuration options
- `pm2_stopProcess` - Stop running PM2 processes
- `pm2_restartProcess` - Restart PM2 processes
- `pm2_deleteProcess` - Remove processes from PM2 list
- `pm2_reloadProcess` - Zero-downtime reload
- `pm2_gracefulReload` - Graceful reload with connection waiting
- `pm2_scaleProcess` - Scale cluster processes
- `pm2_killPM2` - Kill PM2 daemon and all processes

#### PM2 Monitoring & Information

- `pm2_listProcesses` - List all PM2 processes with optional detailed info
- `pm2_showProcessInfo` - Detailed information for specific process
- `pm2_describeProcess` - Process configuration description
- `pm2_getPM2Status` - PM2 daemon status and overview
- `pm2_monitor` - Real-time monitoring
- `pm2_getPM2Version` - Version and system information

#### PM2 Log Management

- `pm2_showLogs` - View logs with filtering options
- `pm2_flushLogs` - Flush log files
- `pm2_reloadLogs` - Reload all log files
- `pm2_resetMetadata` - Reset process metadata

#### PM2 System Management

- `pm2_startup` - Setup PM2 startup script
- `pm2_generateStartupScript` - Generate startup script without execution
- `pm2_saveProcessList` - Save current process list
- `pm2_resurrectProcesses` - Restore saved processes

**Common Usage Patterns:**

```javascript
// Development server
process_start({ command: 'pnpm', args: ['kanban', 'ui', '--port', '4173'], cwd });

// Production app with PM2
pm2_startProcess({
  script: 'server.js',
  name: 'web-app',
  instances: 'max',
  exec_mode: 'cluster',
  env: { NODE_ENV: 'production' },
});

// Zero-downtime deployment
pm2_reloadProcess({ nameOrId: 'web-app' });
```

### Web & Browser Automation

- `playwright_*` tools - web testing, navigation, screenshots, form filling
- `webfetch` - retrieve web content
- `web-search-prime_webSearch` - web search functionality

### AI Vision & Media Analysis

- `zai-mcp-server_analyze_image` - image analysis (PNG, JPG, JPEG, max 5MB)
- `zai-mcp-server_analyze_video` - video analysis (MP4, MOV, M4V, max 8MB)

### Ollama LLM Job Queue

**Asynchronous LLM processing** - Submit background jobs to Ollama and check status later:

- `ollama-queue_submitJob` - Submit new LLM jobs (generate, chat, embedding)
- `ollama-queue_getJobStatus` - Check status of specific job by ID
- `ollama-queue_getJobResult` - Retrieve completed job results
- `ollama-queue_listJobs` - List jobs with filtering (by status, agent, etc.)
- `ollama-queue_cancelJob` - Cancel pending jobs
- `ollama-queue_listModels` - List available Ollama models
- `ollama-queue_getQueueInfo` - Get queue statistics and processor status

**Job Types:** Generate (single prompt), Chat (multi-turn), Embedding (text embeddings)
**Priority Levels:** `low`, `medium`, `high`, `urgent`
**Job Status:** `pending`, `running`, `completed`, `failed`, `canceled`

**Usage Examples:**

```javascript
// Submit code generation job
ollama -
  queue_submitJob({
    jobName: 'code-review',
    modelName: 'qwen3-codex:latest',
    jobType: 'generate',
    prompt: 'Review this TypeScript code...',
    priority: 'high',
    options: { temperature: 0.2 },
  });

// Check job status and get result
ollama - queue_getJobStatus({ jobId: 'uuid-here' });
ollama - queue_getJobResult({ jobId: 'uuid-here' });
```

### Serena Tools (Advanced Code Analysis)

**File Operations:**

- `serena_read_file`, `serena_create_text_file` - File reading/writing
- `serena_list_dir`, `serena_find_file` - Directory navigation and file discovery

**Code Structure Analysis:**

- `serena_get_symbols_overview` - Get high-level understanding of code symbols
- `serena_find_symbol` - Find specific symbols/classes/methods
- `serena_find_referencing_symbols` - Find all references to a symbol

**Code Editing & Manipulation:**

- `serena_replace_symbol_body` - Replace function/method bodies
- `serena_insert_after_symbol`, `serena_insert_before_symbol` - Insert code around symbols
- `serena_replace_regex` - Pattern-based code replacements
- `serena_search_for_pattern` - Advanced pattern searching in code

**Project & Memory Management:**

- `serena_execute_shell_command` - Enhanced shell execution
- `serena_activate_project`, `serena_switch_modes` - Project configuration
- `serena_check_onboarding_performed`, `serena_onboarding` - Project setup
- `serena_write_memory`, `serena_read_memory`, `serena_list_memories` - Persistent memory

### Clojure Development Tools

- `clj-kondo-mcp_lint_clojure` - Lint Clojure/ClojureScript/EDN content using clj-kondo

### Core Development Tools

- **File Operations**: `read`, `write`, `edit`, `glob`, `grep`, `list` - file manipulation and searching
- **Shell Execution**: `bash` - running commands and scripts
- **Task Management**: `todowrite`, `todoread` - track work items
- **Agent Spawning**: `task` - spawn specialized sub-agents for complex tasks

### Project-Specific Integrations

- Access to Promethean Framework's agent ecosystem
- Integration with project's kanban board management
- Direct access to project-specific tools and utilities
