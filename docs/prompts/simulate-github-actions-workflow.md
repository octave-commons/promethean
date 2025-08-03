
### 🧠 **Agent Prompt: Replace `act` with Native CI Simulation**

The `simulate-ci` Makefile target previously used `act` to simulate GitHub Actions workflows. However, `act` requires Docker and cannot be used in this environment. Your task is to **replace this dependency** by **natively simulating the GitHub Actions pipeline**.

#### 📘 Reference

GitHub Actions workflows are defined in `.github/workflows/*.yml`.

---

### 🛠️ **Goal**

Create a `simulate-ci` Makefile target that:

1. **Parses the `.github/workflows/` YAML files.**
2. **Finds the `pull_request` event jobs.**
3. **Collects the `run` steps for each job.**
4. **Executes those steps locally in sequence, with environment variables and working directories appropriately handled.**

---

### 💡 Implementation Hints

* Use a script (e.g. `scripts/simulate_ci.ts` or `.py`) that:

  * Loads and parses the YAML.
  * Filters for `on.pull_request` jobs.
  * Extracts each job's `steps[].run` entries.
  * Emulates the job environment (`env`, `run`, `working-directory`).
  * Resolves relative paths from the repo root.
  * Ignores GitHub-only features like `uses:` or container runners unless trivial to handle.
* Update the Makefile to run this simulation script:

  ```make
  simulate-ci:
    node scripts/simulate_ci.js
  ```
* Ensure the script prints clearly when:

  * A step begins execution.
  * A command fails.
  * A job is skipped due to unsupported features.

---

### 📎 Optional Enhancements

* Add a `--job <name>` flag to simulate a specific job.
* Support matrix builds in a simplified way.
* Add a check that warns if Docker-only features are present.

---

### 📢 Important

Do **not** use `act`. This is a native simulation. It must work without Docker.

