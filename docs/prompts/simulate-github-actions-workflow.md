
### 🧠 **Agent Prompt: Finish the Babashka CI Simulation**

The `bb simulate-ci` task currently prints a stub message. Your assignment is to
finish the native GitHub Actions simulation that `bb` should launch so local
runs match CI without relying on Docker or `act`.

#### 📘 Reference

GitHub Actions workflows are defined in `.github/workflows/*.yml`.

---

### 🛠️ **Goal**

Wire up `bb simulate-ci` so it:

1. **Parses the `.github/workflows/` YAML files.**
$$
2. **Finds the `pull_request` event jobs.**
$$
3. **Collects the `run` steps for each job.**
4. **Executes those steps locally in sequence, with environment variables and working directories appropriately handled.**

---

### 💡 Implementation Hints

* Use the existing Python module stub at `scripts/simulate_ci.py` $called by
  `bb simulate-ci`$. It should:

  * Loads and parses the YAML.
  * Filters for `on.pull_request` jobs.
  * Extracts each job's `steps[].run` entries.
  * Emulates the job environment $`env`, `run`, `working-directory`$.
  * Resolves relative paths from the repo root.
  * Ignores GitHub-only features like `uses:` or container runners unless trivial to handle.
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
Keep the implementation aligned with
$[Babashka + Nx Automation Reference|../notes/automation/bb-nx-cli.md]$ and
notify the CI owners for review when the workflow changes.

