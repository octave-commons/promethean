# Promethean

Stealing fire from the gods to grant man the gift of knowledge and wisdom.
Using cloud LLMs to make local LLMs smarter and more specialized.


## Initiation sequence

On every request:
-  context7 to grab docs related documentation to the task you were given
- github grep to understand the implementation of the packages you will be using
- web search to find guides and related information
- `pnpm kanban search "task keywords"` to find tasks related to the request
- `git logs`  and search Opencode session message history to understand the events leading up to your task

---

## 📂 Repository Structure

```
scripts/ # Build, test, deploy automation (depreciated)
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs (depreciated)
configs/ # All base config files live here
pseudo/ # one off scripts retained for transparency, and pseudo code.

```
## Anatomy of a Package

```
./src # All source code goes here
./src/tests # Tests go here
./tsconfig.json # Extends "../../config/tsconfig.base.json"
./ava.config.mjs # Extends "../../config/ava.config.mjs"
./package.json # Has, or should have 'build', 'test', 'clean', 'coverage',
'typecheck' etc. scripts
pseudo/ # one off scripts, retained for transparency
```
## Programming languages

- Typescript
- Clojure(script)

## Programming style

- Functional
- data oriented
- test driven development
- rapid prototyping
- small concise functions and files
- clean code
- factory pattern
- dependency injection

## PM2 Service management
- `om2 start `

## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management.
The kanban board lives at `docs/agile/boards/generated.md` and is managed
via the `@promethean/kanban` package.


### 📍 Working with Kanban


- `pnpm kanban --help`
- `pnpm kanban process` explains how we work
- `pnpm kanban audit` checks the board for inconsistencies and illegal actions
- `pnpm kanban update-status <uuid> <column>` 
- `pnpm kanban regenerate`
- `pnpm kanban search <query>`
- `pnpm kanban count`

1. `pnpm kanban search <work-type>` → find relevant tasks
2. `pnpm kanban update-status <uuid> in_progress`
3. `pnpm kanban update-status <uuid> done`
4. `pnpm kanban regenerate`

### 📁 Task File Locations

- Tasks live in: `docs/agile/tasks/*.md`
- Generated board: `docs/agile/boards/generated.md`
- Config file: `promethean.kanban.json`
- CLI reference: `docs/agile/kanban-cli-reference.md`

### 📚 Further Documentation

- **Complete Kanban CLI Reference**: `docs/agile/kanban-cli-reference.md`
- **Process Documentation**: `docs/agile/process.md`
- **FSM Rules**: `docs/agile/rules/kanban-transitions.clj`


### Example package local commands

Prefer local, well scoped commands to workspace scripts.

`pnpm --filter @promethean/<packge-name> test`
`pnpm --filter @promethean/<packge-name> test:unit`
`pnpm --filter @promethean/<packge-name> test:integration`
`pnpm --filter @promethean/<packge-name> test:e2e`
`pnpm --filter @promethean/<packge-name> clean`
`pnpm --filter @promethean/<packge-name> lint`
`pnpm --filter @promethean/<packge-name> build`
`pnpm --filter @promethean/<packge-name> typecheck`
`pnpm --filter @promethean/<packge-name> start`
`pnpm --filter @promethean/<packge-name> exec node ./psudo/temp-script.js`
`cd packages/path/to && node ./dist/index.js`

---
# PM2 command catalog (exhaustive & practical)

Below is a compact-but-complete catalog of useful PM2 CLI commands, grouped by task. Each entry shows the canonical name and notable aliases. Examples use common defaults. Citations point to the current PM2 docs so you can double-check specifics.

---

## Process lifecycle

* `pm2 start [options] <file|json|stdin|app_name|pm_id…>` — start & daemonize an app. ([PM2.io][1])

  * JSON helpers (ecosystem files):

    * `pm2 startOrRestart <json>` — start or restart from JSON. ([PM2.io][1])
    * `pm2 startOrReload <json>` — start or graceful reload from JSON. ([PM2.io][1])
    * `pm2 startOrGracefulReload <json>` — same intent, explicitly graceful. ([PM2.io][1])
* `pm2 restart [options] <id|name|all|json|stdin…>` — restart a process (or all). ([PM2.io][1])
* `pm2 reload <name|all>` — zero-downtime reload (HTTP/HTTPS apps). ([PM2.io][1])
* `pm2 gracefulReload <name|all>` — ask app to close connections first. ([PM2.io][1])
* `pm2 stop [options] <id|name|all|json|stdin…>` — stop without removing from list. ([PM2.io][1])
* `pm2 delete <name|id|script|all|json|stdin…>` — stop **and** remove from list. ([PM2.io][1])
* `pm2 scale <app_name> <number>` — set total instances in cluster mode. ([PM2.io][1])
* `pm2 id <name>` — get PM2 process id by name. ([PM2.io][1])
* `pm2 pid [app_name]` — print OS PID(s). ([PM2.io][1])
* `pm2 sendSignal <signal> <pm2_id|name>` — send a UNIX signal. ([PM2.io][1])
* `pm2 reset <name|id|all>` — reset restart counters. ([PM2.io][1])
* `pm2 ping` — ping/auto-launch daemon if down. ([PM2.io][1])
* `pm2 kill` — kill the PM2 daemon. ([PM2.io][1])
* `pm2 snapshot` — take a PM2 memory snapshot; `pm2 profile <command>` — CPU profile. ([PM2.io][1])
* `pm2 send <pm_id> <line>` / `pm2 attach <pm_id> [command]` — attach stdin/stdout. ([PM2.io][1])

> Quick examples:
>
> ```bash
> pm2 start app.js --name api --watch
> pm2 reload api
> pm2 scale api 4
> pm2 restart all --update-env
> ```
>
> (See Process Management page for examples and behavior. ([pm2.keymetrics.io][2]))

---

## Listing, describing, & monitoring

* `pm2 list` (`ls`, `l`, `ps`, `status`) — list processes; supports `--sort`. ([PM2.io][1])
* `pm2 describe <id>` (`desc`, `info`, `show`) — full metadata for one process. ([PM2.io][1])
* `pm2 jlist` — list in raw JSON; `pm2 prettylist` — pretty JSON. ([PM2.io][1])
* `pm2 monit` — classic terminal monitor; `pm2 imonit` — legacy view. ([PM2.io][1])
* `pm2 dashboard` (`dash`) — TUI dashboard with metrics & logs. ([PM2.io][1])
* `pm2 report` — gather system/app diagnostics bundle. ([PM2.io][1])

---

## Logs & log maintenance

* `pm2 logs [options] [id|name]` — tail logs (all by default). Options: `--json`, `--format`, `--raw`, `--err`, `--out`, `--lines <n>`, `--timestamp`, `--nostream`, `--highlight`. ([pm2.keymetrics.io][3])
* `pm2 reloadLogs` — reopen all log files (useful after rotation). ([PM2.io][1])
* `pm2 flush [id|name]` — truncate app log files. ([pm2.keymetrics.io][3])
* `pm2 logrotate` — write a native logrotate config (root-level file). ([pm2.keymetrics.io][3])

> Default log dir: `$HOME/.pm2/logs`. ([pm2.keymetrics.io][3])

---

## Persistence across reboots

* `pm2 save` (`pm2 dump`) — save the current process list (creates dump). ([PM2.io][1])
* `pm2 resurrect` — restore from the last `save/dump`. ([PM2.io][1])
* `pm2 startup [platform] [-u user --hp home --service-name name]` — generate & register boot script for your init system; PM2 prints the exact `sudo` command to run. ([pm2.keymetrics.io][4])
* `pm2 unstartup [platform]` — disable/remove startup integration. ([pm2.keymetrics.io][4])

---

## Updating PM2 itself

* `pm2 update` — one-shot: save list, restart daemon, restore list (pairs with `npm i -g pm2@latest`). ([pm2.keymetrics.io][5])
* `pm2 updatePM2` — alias for the same in-memory update. ([PM2.io][1])
* `pm2 deepUpdate` — “deep” PM2 update (harder refresh). ([PM2.io][1])
* `pm2 gc` — force a garbage collection in the daemon context. ([PM2.io][1])

---

## Configuration, runtime flags & key-value store

* `pm2 set <key> <value>` / `pm2 multiset "k1 v1 k2 v2"` — set config. ([PM2.io][1])
* `pm2 get <key>` — read config; `pm2 unset <key>` — delete. ([PM2.io][1])
* `pm2 conf <key> [value]` / `pm2 config <key> [value]` — get/set module config. ([PM2.io][1])

> **Common global flags** you’ll frequently combine with commands (selected):
> `-n/--name`, `-i/--instances`, `--watch`, `--ignore-watch`, `--merge-logs`, `--max-memory-restart`, `--cron`, `--env <name>`, `--node-args`, `--log-date-format`, `--update-env`, `--wait-ready`, `--no-autorestart`, `--no-daemon`, `--sort <field:order>`. Full flag list in the CLI reference. ([PM2.io][1])

---

## Ecosystem file (generate & use)

* `pm2 ecosystem|init [mode]` — generate `ecosystem.config.js` (`mode` e.g., `simple`). ([PM2.io][1])

---

## Deployment (built-in “pm2 deploy”)

* `pm2 deploy <config_file> <environment> <command>` — SSH-based deploy helper. Commands:

  * `setup`, `update`, `revert [n]`, `current`, `previous`, `exec|run <cmd>`, `list`, or just a `[ref]` to deploy a git ref. ([pm2.keymetrics.io][6])

---

## Modules (installable PM2 addons)

* `pm2 install <module|git:/>` (`module:install`) — install or update and run forever. ([PM2.io][1])
* `pm2 module:update <module|git:/>` — update a module. ([PM2.io][1])
* `pm2 uninstall <module>` (`module:uninstall`) — stop & remove. ([PM2.io][1])
* `pm2 publish` (`module:publish`) — publish the current module. ([PM2.io][1])
* `pm2 module:generate [app_name]` — scaffold a sample module. ([PM2.io][1])

---

## PM2 ↔️ pm2.io / Keymetrics integration

* `pm2 link|interact [options] [secret] [public] [name]` — link a local PM2 to pm2.io; manage via `stop|info|delete|restart`. ([PM2.io][1])
* `pm2 unlink` — detach from pm2.io. ([PM2.io][1])
* `pm2 register` — create a pm2.io account; `pm2 login` — sign in and link; `pm2 open` — open dashboard in browser. ([PM2.io][1])

---

## Exposing actions from your app & triggering them

* `pm2 trigger <app> <action> [params]` — invoke a **custom action** you exposed (e.g., via `tx2`/`@pm2/io`) from your running app. See “Process Actions” docs for examples. ([pm2.keymetrics.io][7])

---

## Git helpers (rare but present)

* `pm2 pull <name> [commit_id]` — update repo for an app;
  `pm2 forward <name>` — next commit; `pm2 backward <name>` — previous commit. ([PM2.io][1])

---

## Built-in static file server & health API

* `pm2 serve|expose [path] [port]` — serve a directory over HTTP (defaults: `.` and `8080`). Works with normal start options like `--name`, `--watch`. ([pm2.keymetrics.io][8])
* `pm2 web` — launch a simple health API on `0.0.0.0:9615`. ([PM2.io][1])

---

## Miscellaneous admin

* `pm2 update` / `pm2 updatePM2` — refresh running daemon to the latest installed PM2. ([pm2.keymetrics.io][5])
* `pm2 deepUpdate` — force a deeper refresh. ([PM2.io][1])

---

## At-a-glance cheat sheet

```bash
# Start / stop / restart / reload
pm2 start app.js --name api --watch
pm2 restart api            # or: pm2 restart all
pm2 reload api             # zero-downtime (HTTP)
pm2 stop api && pm2 delete api

# Introspection
pm2 ls                     # also: list|l|ps|status
pm2 show 0                 # also: describe/info
pm2 monit                  # top-like
pm2 logs api --lines 100

# Persistence
pm2 save && pm2 startup
pm2 resurrect
pm2 unstartup

# Scaling & signals
pm2 scale api 4
pm2 sendSignal SIGUSR2 api

# Deploy
pm2 deploy ecosystem.config.js production setup
pm2 deploy production       # uses default ref
pm2 deploy production exec "pm2 reload all"
```

---

### Sources

* **Canonical CLI command & flag list**: PM2 “CLI reference” (full table of commands, aliases, and flags). ([PM2.io][1])
* **Process management basics** (start/restart/stop/list/describe/monit): PM2 “Process Management”. ([pm2.keymetrics.io][2])
* **Logs** (tailing, options, flush, logrotate, default dir): PM2 “Logs”. ([pm2.keymetrics.io][3])
* **Startup/persistence** (startup, save/dump, resurrect, unstartup): PM2 “Startup Script”. ([pm2.keymetrics.io][4])
* **Updating PM2** (update/updatePM2): PM2 “Updating PM2”. ([pm2.keymetrics.io][5])
* **Static server**: PM2 “Expose/Serve”. ([pm2.keymetrics.io][8])
* **Deployment subcommands**: PM2 “Deployment System”. ([pm2.keymetrics.io][6])
* **Trigger custom actions**: PM2 “Process Actions”. ([pm2.keymetrics.io][7])

If you want, I can turn this into a printable, one-page Obsidian note (with your favorite commands highlighted for your workflows).

[1]: https://pm2.io/docs/runtime/reference/pm2-cli/ "PM2 - CLI | Reference | PM2 Documentation"
[2]: https://pm2.keymetrics.io/docs/usage/process-management/ "PM2 - Process Management"
[3]: https://pm2.keymetrics.io/docs/usage/log-management/ "PM2 - Logs"
[4]: https://pm2.keymetrics.io/docs/usage/startup/ "PM2 - Startup Script"
[5]: https://pm2.keymetrics.io/docs/usage/update-pm2/?utm_source=chatgpt.com "Update PM2"
[6]: https://pm2.keymetrics.io/docs/usage/deployment/ "PM2 - Deployment"
[7]: https://pm2.keymetrics.io/docs/usage/process-actions/?utm_source=chatgpt.com "Process Actions - PM2"
[8]: https://pm2.keymetrics.io/docs/usage/expose/?utm_source=chatgpt.com "Expose static file over http"



### Notes
 It is a large repo, and bash command commands are always ran from the package root
`cd` bash commands are *always* ran from the package root.
- put temporary scripts in a `pseudo/` folder, retain them so the steps you take can be validated
  - psuedo is never to be referenced inside of a package
  - pseudo is pseudocode, I don't know if it works, but it communciated an intent
- put markdown files in `docs/`
- you are in a repository where file changes automaticly trigger a commit to be made with a message generated by an llm
  - you don't need to commit your work
  - you don't need to make backups
- documentation should be obsidian friendly markdown
  - use [[wikilinks]]
  - make use of dataviews https://blacksmithgu.github.io/obsidian-dataview/
  Be careful!
- Update the [[HOME]] file with important information, treat it as a living document
- manage processes with pm2

## Licensing
All packages "license": "GPL-3.0-only"
