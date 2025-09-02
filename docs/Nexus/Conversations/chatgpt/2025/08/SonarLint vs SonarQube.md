---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "SonarLint vs SonarQube"
conversation_id: 68afcde8-1fac-8326-b9c3-91a7a5c39cb9
create_time: 08/27/2025 at 10:33 PM
update_time: 08/27/2025 at 10:43 PM
---

# Title: SonarLint vs SonarQube

Created: 08/27/2025 at 10:33 PM
Last Updated: 08/27/2025 at 10:43 PM
Chat URL: https://chat.openai.com/c/68afcde8-1fac-8326-b9c3-91a7a5c39cb9


>[!nexus_user] **User** - 08/27/2025 at 10:33 PM
> sonarlint vs sonarqube
<!-- UID: a58d6f5f-7f66-4d82-8fca-7a13e75cb101 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 10:33 PM
> Here’s the no-BS take.
> 
> # SonarLint (aka “SonarQube for IDE”) vs SonarQube
> 
> **What they are**
> - **SonarLint / “SonarQube for IDE”**: a *local IDE plugin* that flags issues as you type and can bind to a server to use your team’s rules (“Connected Mode”). Think spell-checker for code. Free. cite 
> - **SonarQube (server)**: a *central analysis service* that runs in CI, tracks projects over time, enforces **Quality Gates**, and decorates PRs (in paid editions). Team dashboards, governance, and history live here. cite
> 
> **How they fit together**
> - Use **SonarLint** to prevent issues *before* commit; use **SonarQube** to block bad code at merge and measure the codebase over time. Connected Mode makes the IDE follow the server’s rules and suppressions. cite
> 
> **Key differences (practical)**
> - **Scope**: Individual dev feedback (Lint) vs org-level CI gates & reporting (Qube). cite 
> - **PR decoration & branches**: Native in **SonarQube Developer+**; **Community** edition analyzes one branch only. There’s a popular *community plugin* to add branch/PR support, but it’s third-party/unsupported—use at your own risk. cite 
> - **Where it runs**: IDE (Lint) vs CI/server (Qube). cite 
> - **Rules source**: Built-in in Lint; with **Connected Mode**, Lint pulls your project’s **Quality Profile** from Qube so devs see the same rules locally that will gate the build. cite
> 
> **Blunt guidance**
> - Solo/hobby? **SonarLint** is enough. 
> - Team with PRs? **You need SonarQube** in CI for gates and PR decoration; keep **SonarLint** on every dev machine to shift-left. cite 
> - On Community edition and want branch/PR analysis? Either upgrade to Developer or knowingly run the community plugin. Don’t pretend it’s the same thing. cite
> 
> **1-minute setup (Connected Mode)**
> 1) Install the IDE plugin, 
> 2) “Bind to SonarQube/SonarCloud”, select your project, 
> 3) It syncs rules and marks issues inline as you type. cite
> 
> #hashtags 
> #sonarqube #sonarlint #static-analysis #quality-gates #ci #devtools
<!-- UID: 29a64580-4188-479e-a897-23e0c1e244f7 -->

---




>[!nexus_user] **User** - 08/27/2025 at 10:39 PM
> do I need to configure sonarqube to make it useful to the agent via MCP then?
<!-- UID: 6b27a600-a434-4ee9-a5b8-1e7f1d7fb2ce -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 10:39 PM
> Short answer: **yes**—but only a little, and only if you want the agent to do more than stare at an empty dashboard.
> 
> ## What you must configure (minimum that makes MCP useful)
> 1) **Have analyses to read.** SonarQube is just a database + UI. It doesn’t “scan” code by itself. Run **SonarScanner** in CI (or locally) so your projects actually have issues, measures, and a Quality Gate status. PR/branch analysis specifically requires Developer+ editions. cite 
> 2) **Create a token** the MCP server can use. Generate a user token in **My Account → Security**, and pass it to the MCP server; this is how you hit the Web API. Rotate it like any other secret. cite 
> 3) **Point MCP at your SonarQube URL** and use the Web API. The useful read endpoints include: 
>  - **Issues**: `/api/issues/search` (filter by project, severity, tags, branch/PR). cite 
>  - **Quality Gate status**: `/api/qualitygates/project_status` (OK/WARN/ERROR/NONE). cite 
>  - **Measures/metrics**: `/api/measures/*` for code metrics and histories. cite 
>  - **Projects**: `/api/projects/search` if you need discovery. cite
> 
> That’s enough for an MCP tool to **answer questions, surface hotspots, summarize debt**, and **gate merges** (indirectly, by reading the gate status).
> 
> ## If you want branch/PR-aware behavior
> - **Branch & PR analysis** (and PR decoration) are **Developer Edition+** features. If your agent needs per-branch gates or to reason about PRs, you need that edition, and you must run the scanner in the PR pipeline. Community edition won’t give you that data. cite
> 
> ## What the MCP tool should expose (practical)
> - `list_projects(query?)` → `/api/projects/search` 
> - `quality_gate(projectKey, branch?, pullRequest?)` → `/api/qualitygates/project_status` 
> - `find_issues(projectKey, facets…)` (paginate; beware 10k caps) → `/api/issues/search` cite 
> - `get_measures(projectKey, metricKeys, branch?)` → `/api/measures/component` 
> - (Optional) `open_in_ui(url)` passthrough for quick jumps
> 
> Give each tool **strict params** (projectKey, branch, pullRequest) so the agent can be deterministic.
> 
> ## What MCP cannot do (without extra wiring)
> - **Trigger scans.** SonarQube doesn’t start analyses from its API; you must call a CI job or run the scanner. If you want the agent to “kick a re-scan,” add a separate MCP tool that triggers your CI (GitHub Actions, etc.). PR analysis must run inside CI checkout. cite
> 
> ## Security & ops quick hits
> - Use a **least-privilege user token**; store it in your MCP server config/secrets. Set an **expiry** and rotate. cite 
> - Expect **paging/limits** on issues; design your MCP tool to fetch in pages and/or facet first. cite
> 
> ## TL;DR
> - **Yes**, configure SonarQube enough that there’s data (run scans), make a **token**, and point MCP at the **Web API**. 
> - If you want **branch/PR intelligence**, **upgrade** and **wire CI**. Otherwise, you’ll only get main-branch snapshots.
> 
> #hashtags 
> #sonarqube #mcp #staticanalysis #qualitygates #ci #devtools
<!-- UID: 01631ca5-fb9d-4cb8-9318-d0cb593ad3f9 -->

---




>[!nexus_user] **User** - 08/27/2025 at 10:42 PM
> How do I run the sonar scanner (I'm running it locally, I'm a one man shop, and this is all just for me)
<!-- UID: 3c0c8896-67b6-40c9-96fb-4baf5bf0fb8e -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 10:42 PM
> Got you. Here’s the fastest way to run SonarScanner locally as a solo dev—and actually get useful results the agent/MCP can read.
> 
> # The 5-minute path (Docker)
> 1. **Create a token** in SonarQube (`My Account → Security`). Copy it. cite 
> 2. At your project root, add `sonar-project.properties`:
> 
> ```properties
> # --- minimal & sane defaults ---
> sonar.projectKey=your-project-key
> sonar.projectName=Your Project
> sonar.sources=src
> # mark tests so they don't count as source debt
> sonar.test.inclusions=**/*.{test,spec}.{js,ts,jsx,tsx},**/tests/**
> 
> # JS/TS coverage (LCOV)
> sonar.javascript.lcov.reportPaths=coverage/lcov.info
> 
> # Python coverage (XML)
> sonar.python.coverage.reportPaths=coverage.xml
> ```
> 
>  - JS/TS expects **LCOV**; Python expects **coverage.xml**. SonarQube *does not* run tests—**you** generate the reports and point Sonar at them. cite
> 
> 3. **Generate coverage** before scanning:
>  - Jest: `npm test -- --coverage` (produces `coverage/lcov.info`) 
>  - Vitest: `vitest run --coverage --coverage.reporter=lcov` 
>  - PyTest: `pytest --cov=. --cov-report=xml:coverage.xml` (tweak paths as needed) cite
> 4. **Run the scanner (Docker):**
> ```bash
> docker run --rm \
>  -e SONAR_HOST_URL="http://localhost:9000" \
>  -e SONAR_TOKEN="sqp_XXXXXXXXXXXXXXXX" \
>  -v "$PWD:/usr/src" \
>  sonarsource/sonar-scanner-cli
> ```
>  That’s the official image; it picks up your `sonar-project.properties` in `/usr/src`. You’ll get a URL at the end with the analysis results. cite
> 
> > Use **`SONAR_TOKEN`** or `-Dsonar.token=...`. Don’t use `sonar.login`; it’s deprecated. cite
> 
> ---
> 
> ## If you don’t want Docker
> - Install the **SonarScanner CLI** locally (zip, add to `PATH`), then run:
> ```bash
> export SONAR_HOST_URL="http://localhost:9000"
> export SONAR_TOKEN="sqp_XXXXXXXXXXXXXXXX"
> sonar-scanner
> ```
> Docs: install + CLI flags + parameter precedence. cite
> 
> ---
> 
> ## Monorepo quick pattern (solo version)
> You’ve got multiple packages? Treat each as its own SQ project with a unique `sonar.projectKey`, and run from each subdir (simplest), **or** call the scanner with a different base dir:
> 
> ```bash
> sonar-scanner -Dsonar.projectKey=web -Dsonar.projectBaseDir=packages/web
> sonar-scanner -Dsonar.projectKey=api -Dsonar.projectBaseDir=services/api
> ```
> 
> Monorepo projects are first-class in SQ; separate projects per package keep gates clean. Only set `projectBaseDir` when you must; otherwise run from each package root. cite
> 
> ---
> 
> ## Useful knobs you’ll probably want
> - **Exclude junk** (generated, third-party): set `sonar.exclusions` or use UI “Analysis Scope.” 
>  Example: 
>  `sonar.exclusions=**/node_modules/**,**/dist/**,**/.venv/**` cite
> - **Command-line overrides** (handy for ad-hoc runs): 
>  `sonar-scanner -Dsonar.projectKey=foo -Dsonar.sources=src` cite
> 
> ---
> 
> ## What “done” looks like
> - You ran tests to produce coverage files. 
> - You ran the scanner (Docker or native). 
> - Sonar’s UI shows issues + metrics; coverage isn’t 0%. If it *is* 0%, your report paths are wrong or not generated. Fix the path(s) to LCOV/XML and rerun. cite
> 
> If you want, I can spit out a tiny `make sonar` (or `npm run sonar`) script that runs tests → coverage → scanner in one go.
> 
> #hashtags 
> #sonarqube #sonarscanner #localdev #coverage #javascript #typescript #python #monorepo #mcp
<!-- UID: 2df026c1-065c-412f-a22f-0d9e2f6aa176 -->

---


