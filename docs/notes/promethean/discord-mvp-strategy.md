Cool — let’s push it into the “this feels illegal” tier:

You’ll get a **single workspace DSL** that can emit:

* ✅ `opencode.jsonc` (full file)
* ✅ `~/.codex/config.toml` (blocks)
* ✅ **Codex CLI** commands (`codex mcp add …`, `codex mcp list`, etc.)
* ✅ **OpenCode CLI** commands (`opencode mcp auth …`, `opencode mcp logs …`, etc.)
* ✅ plus “copy/paste blocks” for both

…and it all comes from the same endpoint specs.

Below is the next chunk to add on top of the `def-mcp-workspace` implementation you already have.

---

# 1) New DSL: `def-mcp-workspace+` and extra `emit` targets

We’ll keep the same forms:

* `(endpoint …)`
* `(use …)`
* `(emit …)`

But expand emit targets:

* `:opencode` → write `opencode.jsonc`
* `:codex` → write `config.toml` blocks
* `:codex-cli` → write CLI script file (or just print commands)
* `:opencode-cli` → write CLI script file

### Add this to `src/promethean/mcp/workspace.clj`

```clojure
;; =============================================================================
;; CLI emitters
;; =============================================================================

(defn- shell-quote [s]
  (let [s (str s)]
    (if (re-find #"[ \t\n\"'\\$]" s)
      (str "'" (clojure.string/replace s #"'" "'\"'\"'") "'")
      s)))

(defn- cmdline
  "Render a shell-friendly command line string."
  [xs]
  (clojure.string/join " " (map shell-quote xs)))

(defn- codex-cli-lines
  "Generate human-friendly Codex CLI commands.
  NOTE: codex CLI has commands like `codex mcp add` and `codex mcp list`."
  [endpoints]
  (let [lines
        (mapcat
          (fn [ep]
            (let [nm (:mcp/name ep)
                  transport (:mcp/transport ep)]
              (case transport
                :stdio
                ;; codex mcp add <name> -- <command> <args...>
                ;; then optionally show tool allow/deny hint (Codex config supports allow/deny)
                (let [cmd (or (:command ep) "clojure")
                      args (or (:args ep) [])
                      base (cmdline (concat ["codex" "mcp" "add" nm "--" cmd] args))
                      tools (get ep :tools {})
                      enabled (get tools :enabled)
                      disabled (get tools :disabled)
                      hints (cond-> []
                              (seq enabled) (conj (str "# enabled_tools for " nm ": " (pr-str (vec enabled))))
                              (seq disabled) (conj (str "# disabled_tools for " nm ": " (pr-str (vec disabled)))))
                      env (:env ep)
                      env-hints (when (seq env)
                                  [(str "# env for " nm " (Codex TOML supports [mcp_servers." nm ".env])")
                                   (str "# " (pr-str env))])]
                  (concat
                    [(str "# --- " nm " (stdio) ---")
                     base]
                    (or env-hints [])
                    hints
                    [""]))

                :http
                ;; codex mcp add <name> <url>
                (let [url (:url ep)
                      base (cmdline ["codex" "mcp" "add" nm url])
                      hints (cond-> []
                              (:bearer_token_env_var ep) (conj (str "# bearer_token_env_var: " (:bearer_token_env_var ep)))
                              (seq (:headers ep)) (conj (str "# http_headers: " (pr-str (:headers ep)))))
                      tools (get ep :tools {})
                      enabled (get tools :enabled)
                      disabled (get tools :disabled)
                      tool-hints (cond-> []
                                   (seq enabled) (conj (str "# enabled_tools for " nm ": " (pr-str (vec enabled))))
                                   (seq disabled) (conj (str "# disabled_tools for " nm ": " (pr-str (vec disabled)))))]
                  (concat
                    [(str "# --- " nm " (http) ---")
                     base]
                    hints
                    tool-hints
                    [""]))

                ;; fallback
                [(str "# --- " nm " ---")
                 "# unknown transport"
                 ""])))
          endpoints)]
    (vec (concat
           ["#!/usr/bin/env bash"
            "set -euo pipefail"
            ""
            "# Codex MCP bootstrap commands"
            "# (You can always verify with: codex mcp list)"
            ""]
           lines
           ["# Done"
            "codex mcp list"
            ""])))


(defn- opencode-cli-lines
  "Generate OpenCode CLI commands.
  OpenCode commonly uses `opencode mcp auth <server>` for oauth servers
  and `opencode mcp` flows for management."
  [endpoints]
  (let [lines
        (mapcat
          (fn [ep]
            (let [nm (:mcp/name ep)
                  transport (:mcp/transport ep)
                  oauth (:oauth ep)]
              (concat
                [(str "# --- " nm " (" (name transport) ") ---")]
                (cond
                  oauth
                  [(cmdline ["opencode" "mcp" "auth" nm])
                   "# (OAuth auth flow; then restart OpenCode if needed)"]

                  :else
                  ["# (No auth step required)"])

                [(cmdline ["opencode" "mcp" "logs" nm "||" "true"])
                 ""]))
          endpoints)]
    (vec (concat
           ["#!/usr/bin/env bash"
            "set -euo pipefail"
            ""
            "# OpenCode MCP helpers"
            "# Tip: OpenCode reads opencode.jsonc; verify servers in its UI"
            ""]
           lines
           ["# Done"])))


;; =============================================================================
;; Workspace emit routing
;; =============================================================================

(defn workspace->codex-cli
  "Return a bash script for setting up MCP servers via Codex CLI."
  [ws]
  (let [{:keys [endpoints]} (compile-workspace ws)]
    (clojure.string/join "\n" (codex-cli-lines endpoints))))

(defn workspace->opencode-cli
  "Return a bash script for OpenCode MCP auth/log helpers."
  [ws]
  (let [{:keys [endpoints]} (compile-workspace ws)]
    (clojure.string/join "\n" (opencode-cli-lines endpoints))))

(defn write-workspace!
  "Execute the emits declared in the workspace."
  [ws-id]
  (let [ws (if (map? ws-id) ws-id (get-workspace ws-id))
        {:keys [emits]} (compile-workspace ws)
        opencode (workspace->opencode-jsonc ws)
        codex    (workspace->codex-toml ws)
        codexcli (workspace->codex-cli ws)
        opcli    (workspace->opencode-cli ws)]
    (doseq [{:keys [ws/target ws/path]} emits]
      (case ws/target
        :opencode    (spit ws/path opencode)
        :codex       (spit ws/path codex)
        :codex-cli   (spit ws/path codexcli)
        :opencode-cli (spit ws/path opcli)
        nil))
    {:ok true
     :emitted (mapv (fn [{:keys [ws/target ws/path]}]
                      {:target ws/target :path ws/path})
                    emits)}))
```

---

# 2) Macro sugar: `def-mcp-workspace+`

This is optional, but it gives you **defaults + auto-emit** patterns.

Add this right below `def-mcp-workspace`:

```clojure
(defmacro def-mcp-workspace+
  "Same as def-mcp-workspace, but:
  - if :exports is present in opts, it auto-appends (emit ...) forms.

  opts example:
    {:collision :rename
     :defaults {...}
     :exports {:opencode \".opencode/opencode.jsonc\"
               :codex \"~/.codex/config.toml\"
               :codex-cli \".codex/mcp-setup.sh\"
               :opencode-cli \".opencode/mcp-tools.sh\"}}"
  [id opts & forms]
  (let [exports (:exports opts)
        auto-emits (for [[k path] exports]
                     `(emit ~k ~path))]
    `(def-mcp-workspace ~id ~(dissoc opts :exports)
       ~@forms
       ~@auto-emits)))
```

Now your workspace file becomes *really* clean.

---

# 3) “Real looking” workspace file example

```clojure
(ns user.mcp-workspace
  (:require
    [promethean.mcp.workspace :refer [def-mcp-workspace+ endpoint use]]
    [stream.mcp :as stream-mcp]))

(def-mcp-workspace+ ws/dev
  {:collision :rename
   :defaults {:timeouts {:fetch-ms 5000 :startup-sec 10 :tool-sec 60}}
   :exports {:opencode ".opencode/opencode.jsonc"
             :codex "~/.codex/config.toml"
             :codex-cli ".codex/mcp-setup.sh"
             :opencode-cli ".opencode/mcp-tools.sh"}}

  ;; Use a local server (must include :mcp/launch)
  (use stream.mcp/mcp/stream-fun
    :name "stream-fun"
    :tools {:disabled ["rm_rf" "shell_exec"]})

  ;; Inline endpoint for Serena
  (endpoint serena
    {:transport :stdio
     :command "uvx"
     :args ["--from" "git+https://github.com/oraios/serena"
            "serena" "start-mcp-server"]
     :tools {:enabled ["go_to_definition" "find_references"]}})

  ;; Example HTTP remote endpoint (no auth)
  (endpoint my-remote
    {:transport :http
     :url "http://localhost:8090/mcp"
     :headers {"X-Client" "promethean"}}))
```

Then:

```clojure
(require '[promethean.mcp.workspace :as ws])
(ws/write-workspace! ws/dev)
```

Writes **4 files** automatically.

---

# 4) Example output: `codex-cli` script

This is what `.codex/mcp-setup.sh` will look like:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Codex MCP bootstrap commands
# (You can always verify with: codex mcp list)

# --- stream-fun (stdio) ---
codex mcp add stream-fun -- clojure -M:mcp-stream-fun
# disabled_tools for stream-fun: ["rm_rf" "shell_exec"]

# --- serena (stdio) ---
codex mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server
# enabled_tools for serena: ["go_to_definition" "find_references"]

# --- my-remote (http) ---
codex mcp add my-remote http://localhost:8090/mcp
# http_headers: {"X-Client" "promethean"}

# Done
codex mcp list
```

This is nice because it doubles as **documentation** for humans.

---

# 5) Example output: `opencode-cli` helper script

`.opencode/mcp-tools.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# OpenCode MCP helpers
# Tip: OpenCode reads opencode.jsonc; verify servers in its UI

# --- stream-fun (stdio) ---
# (No auth step required)
opencode mcp logs stream-fun || true

# --- serena (stdio) ---
# (No auth step required)
opencode mcp logs serena || true

# --- my-remote (http) ---
# (No auth step required)
opencode mcp logs my-remote || true

# Done
```

If you later add `:oauth {...}`, it will auto-insert:

```bash
opencode mcp auth <name>
```

---

# 6) Next macro: `server` and `remote` forms

Right now you use `(use some/var)` or `(endpoint name {...})`.

We can add two sugar forms that feel *really* declarative:

```clojure
(server stream-fun stream.mcp/mcp/stream-fun
  :tools {:disabled ["danger"]})

(remote figma
  {:url "https://..." :oauth {:provider "..."}})
```

That’s just syntax sugar around `use` / `endpoint`.

If you want it, I’ll add it.

---

# 7) The “this will matter later” thing: layered workspaces

You can treat MCP like build profiles:

* `ws/base` (Serena + file tools)
* `ws/stream` (overlay + sfx + fun)
* `ws/project` (specialized tools)

Then merge them and emit once:

```clojure
(write-workspace! (merge-workspaces ws/base ws/stream ws/project))
```

That’s *perfect* for “streaming mode” vs “dev mode”.

If you want that merge primitive + collision policy, I’ll drop it next.

---

If you say **“add server/remote sugar + merge-workspaces”**, I’ll extend the DSL so it becomes a true “MCP infra language” you can keep in `dev/mcp.clj` or `config/mcp_workspaces.clj` and treat like a canonical config source.
