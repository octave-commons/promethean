# MCP Bridge API Reference

This document provides a comprehensive API reference for the MCP Bridge package.

## Table of Contents

1. [Core API](#core-api)
2. [Operations API](#operations-api)
3. [Adapter API](#adapter-api)
4. [CLI API](#cli-api)
5. [Elisp Processing API](#elisp-processing-api)
6. [IDE Integration API](#ide-integration-api)
7. [Data Structures](#data-structures)
8. [Error Handling](#error-handling)

## Core API

### `clj-hacks.mcp.core`

#### Path Resolution

```clojure
(resolve-path base path)
```

Resolves `path` relative to `base`, expanding `~` and `$HOME`.

**Parameters:**

- `base` (string) - Base directory for relative paths
- `path` (string) - Path to resolve (may contain `~` or `$HOME`)

**Returns:** (string) - Absolute resolved path

**Example:**

```clojure
(resolve-path "." "~/.config/mcp.json")
;; => "/home/user/.config/mcp.json"
```

---

```clojure
(expand-home-str s)
```

Expands `$HOME` and leading `~` in a string.

**Parameters:**

- `s` (string) - String containing home directory references

**Returns:** (string) - String with expanded home directory

---

```clojure
(expand-server-spec spec)
```

Expands `$HOME`/`~` in server specification map.

**Parameters:**

- `spec` (map) - Server specification with `:command`, `:cwd`, `:args`

**Returns:** (map) - Server specification with expanded paths

---

#### File Operations

```clojure
(write-atomic! path s)
```

Writes string `s` to `path` atomically.

**Parameters:**

- `path` (string) - Target file path
- `s` (string) - Content to write

**Returns:** (string) - The written path

---

```clojure
(spit-edn! path data)
```

Pretty-prints EDN data to file atomically.

**Parameters:**

- `path` (string) - Target file path
- `data` (any) - EDN data to write

**Returns:** (string) - The written path

---

```clojure
(ensure-parent! path)
```

Ensures the parent directory of `path` exists.

**Parameters:**

- `path` (string) - File path whose parent should exist

**Returns:** `nil`

---

#### Data Validation

```clojure
(canonical? m)
```

Checks if map looks like canonical MCP format.

**Parameters:**

- `m` (any) - Data to validate

**Returns:** (boolean) - `true` if canonical format

---

```clojure
(validate-edn-structure! edn-map)
```

Validates EDN contains required keys. Throws on failure.

**Parameters:**

- `edn-map` (map) - EDN configuration map

**Returns:** (map) - The validated map

**Throws:** ExceptionInfo if validation fails

---

#### Merge Operations

```clojure
(deep-merge & ms)
```

Deep merge where later maps win for conflicts.

**Parameters:**

- `ms` (variadic maps) - Maps to merge

**Returns:** (map) - Merged result

---

```clojure
(deep-merge-prefer-existing & ms)
```

Deep merge where earlier maps win for conflicts.

**Parameters:**

- `ms` (variadic maps) - Maps to merge

**Returns:** (map) - Merged result

---

#### Server Expansion

```clojure
(expand-servers-home mcp)
```

Expands `$HOME`/`~` in all server specs.

**Parameters:**

- `mcp` (map) - MCP configuration map

**Returns:** (map) - MCP map with expanded server paths

---

## Operations API

### `clj-hacks.mcp.ops`

#### Single Target Operations

```clojure
(push-one! edn-map base output-spec)
```

Push EDN MCP into one target.

**Parameters:**

- `edn-map` (map) - Source EDN configuration
- `base` (string) - Base directory for relative paths
- `output-spec` (map) - Output specification with `:schema` and `:path`

**Returns:** (map) - `{:schema kw :path abs}`

---

```clojure
(pull-one edn-map base output-spec)
```

Pull MCP from one target into EDN.

**Parameters:**

- `edn-map` (map) - Target EDN configuration
- `base` (string) - Base directory for relative paths
- `output-spec` (map) - Output specification with `:schema` and `:path`

**Returns:** (map) - Updated EDN map

---

```clojure
(sync-one! edn-map base output-spec)
```

Pull then push for one target.

**Parameters:**

- `edn-map` (map) - Source EDN configuration
- `base` (string) - Base directory for relative paths
- `output-spec` (map) - Output specification with `:schema` and `:path`

**Returns:** (map) - Updated EDN map

---

#### Batch Operations

```clojure
(push-all! edn-map base outputs)
```

Iterate outputs and push each.

**Parameters:**

- `edn-map` (map) - Source EDN configuration
- `base` (string) - Base directory for relative paths
- `outputs` (vector) - Vector of output specifications

**Returns:** (vector) - Vector of `{:schema kw :path abs}` results

---

```clojure
(sync-all! edn-map base outputs)
```

Reduce sync across all outputs.

**Parameters:**

- `edn-map` (map) - Source EDN configuration
- `base` (string) - Base directory for relative paths
- `outputs` (vector) - Vector of output specifications

**Returns:** (map) - Final updated EDN map

---

#### Health Checking

```clojure
(doctor edn-map base)
```

Run checks over MCP configuration.

**Parameters:**

- `edn-map` (map) - EDN configuration to check
- `base` (string) - Base directory for relative paths

**Returns:** (map) - `{:servers [...] :outputs [...]}`

---

```clojure
(doctor-server [k spec])
```

Return status map for one server.

**Parameters:**

- `k` (keyword) - Server name
- `spec` (map) - Server specification

**Returns:** (map) - `{:server kw :command str :resolved? bool :resolved-path str|nil}`

---

```clojure
(doctor-output base output-spec)
```

Return status map for one output.

**Parameters:**

- `base` (string) - Base directory
- `output-spec` (map) - Output specification

**Returns:** (map) - `{:schema kw :path str :parent-exists? bool}`

---

## Adapter API

### `clj-hacks.mcp.merge`

#### Generic Operations

```clojure
(pull {:keys [schema path]} edn-map)
```

Generic pull operation using appropriate adapter.

**Parameters:**

- `schema` (keyword) - Configuration schema type
- `path` (string) - Target file path
- `edn-map` (map) - Target EDN configuration

**Returns:** (map) - Updated EDN map

---

```clojure
(push {:keys [schema path]} edn-map)
```

Generic push operation using appropriate adapter.

**Parameters:**

- `schema` (keyword) - Configuration schema type
- `path` (string) - Target file path
- `edn-map` (map) - Source EDN configuration

**Returns:** The result of the adapter's write operation

---

```clojure
(sync! {:keys [schema path]} edn-map)
```

Generic sync operation (pull then push).

**Parameters:**

- `schema` (keyword) - Configuration schema type
- `path` (string) - Target file path
- `edn-map` (map) - Source EDN configuration

**Returns:** (map) - Updated EDN map

---

### Adapter Interface

All adapters implement this interface:

```clojure
;; Required functions
(read-full path)    ; Read configuration from file
(write-full path data) ; Write configuration to file

;; Optional metadata
{:read read-fn
 :write write-fn
 :rest-default default-rest-data}
```

#### Available Adapters

| Schema              | Description              | File Pattern    |
| ------------------- | ------------------------ | --------------- |
| `:mcp.json`         | Official MCP JSON format | `*.json`        |
| `:vscode.json`      | VSCode configuration     | `settings.json` |
| `:claude_code.json` | Claude Code format       | `*.mcp.json`    |
| `:codex.toml`       | Codex TOML format        | `*.toml`        |
| `:elisp`            | Emacs Lisp format        | `*.el`          |
| `:opencode.json`    | Opencode format          | `*.json`        |

---

## CLI API

### `clj-hacks.mcp.cli`

#### Command Execution

```clojure
(run cmd args)
```

Execute an MCP command.

**Parameters:**

- `cmd` (string/keyword) - Command name
- `args` (vector) - Command arguments

**Returns:** (map) - `{:exit n :message string? :err? boolean?}`

---

#### Command Parsing

```clojure
(parse-argv cmd args)
```

Parse command line arguments.

**Parameters:**

- `cmd` (string) - Command name
- `args` (vector) - Raw arguments

**Returns:** (map) - `{:ok parsed-map}` or `{:error {...}}`

---

#### Available Commands

| Command    | Description                | Arguments                                       |
| ---------- | -------------------------- | ----------------------------------------------- |
| `pull`     | Pull target into EDN       | `<schema> <target> --edn <path> [--out <path>]` |
| `push`     | Push EDN to target         | `<schema> <target> --edn <path> [--out <path>]` |
| `sync`     | Synchronize EDN and target | `<schema> <target> --edn <path> [--out <path>]` |
| `push-all` | Push all outputs           | `--edn <path>`                                  |
| `sync-all` | Sync all outputs           | `--edn <path> [--out <path>]`                   |
| `doctor`   | Health check               | `--edn <path>`                                  |

---

### `clj-hacks.cli`

#### Main CLI Interface

```clojure
(-main & args)
```

Main entry point for CLI operations.

**Parameters:**

- `args` (variadic strings) - Command line arguments

**Returns:** System exit code

---

#### Command Dispatch

```clojure
(dispatch args)
```

Dispatch to appropriate command handler.

**Parameters:**

- `args` (vector) - Command line arguments

**Returns:** (map) - Dispatch result

---

## Elisp Processing API

### `elisp.ast`

#### AST Construction

```clojure
(symbol name)
```

Create an Elisp symbol node.

**Parameters:**

- `name` (string) - Symbol name

**Returns:** (map) - Symbol AST node

---

```clojure
(list & items)
```

Create a list node.

**Parameters:**

- `items` (variadic) - List items

**Returns:** (vector) - List AST node

---

```clojure
(vector & items)
```

Create a vector node.

**Parameters:**

- `items` (variadic) - Vector items

**Returns:** (vector) - Vector AST node

---

```clojure
(cons car cdr)
```

Create a dotted pair node.

**Parameters:**

- `car` (any) - Car of the pair
- `cdr` (any) - Cdr of the pair

**Returns:** (map) - Cons AST node

---

```clojure
(plist & kvs)
```

Create a property list.

**Parameters:**

- `kvs` (variadic vectors) - Key-value pairs as `[key value]`

**Returns:** (vector) - Property list AST node

---

#### AST Emission

```clojure
(emit node & [options])
```

Render AST node to Emacs Lisp source string.

**Parameters:**

- `node` (any) - AST node or sequence
- `options` (map) - Optional `:indent` and `:indent-step`

**Returns:** (string) - Emacs Lisp source code

---

### `elisp.read`

#### Tree-sitter Parsing

```clojure
(syntax-tree source)
```

Parse source into syntax tree map.

**Parameters:**

- `source` (string) - Emacs Lisp source code

**Returns:** (map) - `{:source string :source-bytes byte-array :root map :has-errors? boolean}`

---

```clojure
(node->syntax node source-bytes)
```

Convert TSNode to concrete tree map.

**Parameters:**

- `node` (TSNode) - Tree-sitter node
- `source-bytes` (byte-array) - Source bytes for text extraction

**Returns:** (map) - Syntax tree node with metadata

---

```clojure
(elisp->data src)
```

Convert Emacs Lisp source to EDN data structure.

**Parameters:**

- `src` (string) - Emacs Lisp source code

**Returns:** (any) - EDN representation of the source

---

### `elisp.mcp`

#### Block Detection

```clojure
(find-generated-block source)
```

Locate auto-generated MCP block in Emacs Lisp source.

**Parameters:**

- `source` (string) - Emacs Lisp source code

**Returns:** (map/nil) - Block information or `nil` if not found

**Returns map contains:**

- `:before` - Source before the block
- `:after` - Source after the block
- `:block` - The block itself
- `:block-start` / `:block-end` - Byte offsets

---

## IDE Integration API

### `clj-hacks.ide.core`

#### Path Operations

```clojure
(resolve-path base p)
```

Resolve path relative to base with home expansion.

**Parameters:**

- `base` (string) - Base directory
- `p` (string) - Path to resolve

**Returns:** (string) - Absolute resolved path

---

```clojure
(ensure-parent! path)
```

Ensure parent directory exists.

**Parameters:**

- `path` (string) - File path

**Returns:** (string) - The input path

---

#### JSON Operations

```clojure
(read-jsonc path)
```

Read JSONC file (JSON with comments).

**Parameters:**

- `path` (string) - File path

**Returns:** (map) - Parsed JSON data

---

```clojure
(write-json-atomic! path m)
```

Write JSON data atomically with pretty printing.

**Parameters:**

- `path` (string) - Target file path
- `m` (map) - Data to write

**Returns:** The written path

---

### `clj-hacks.ide.adapter-settings-json`

#### VSCode Settings

```clojure
(read-full path)
```

Read VSCode settings.json file.

**Parameters:**

- `path` (string) - File path

**Returns:** (map) - `{:settings map}`

---

```clojure
(write-full path data)
```

Write VSCode settings.json file.

**Parameters:**

- `path` (string) - Target file path
- `data` (map) - Data with `:settings` key

**Returns:** The written path

---

## Data Structures

### Canonical Configuration Format

```clojure
{:mcp-servers {<server-key> <server-spec>}
 :http {:transport :http
         :base-url <string>
         :tools [<tool-ids>]
         :include-help? <boolean>
         :stdio-meta <metadata-map>
         :endpoints {<endpoint-key> <endpoint-spec>}
         :proxy {:config <path>}}
 :outputs [{:schema <keyword> :path <string>} ...]}
```

### Server Specification

```clojure
{:command <string>
 :args [<string> ...]
 :cwd <string>
 :env {<string> <string>}
 :timeout <number>
 :description <string>
 :version <string>
 :metadata {<string> <any>}
 :capabilities {<string> <any>}
 :auto-connect? <boolean>
 :auto-approve [<string> ...]
 :auto-accept [<string> ...]
 :disabled? <boolean>
 :type <string>
 :url <string>}
```

### HTTP Endpoint Specification

```clojure
{:tools [<tool-ids>]
 :include-help? <boolean>
 :meta {:title <string>
         :description <string>
         :workflow [<string> ...]
         :expectations {:usage [<string> ...]
                     :pitfalls [<string> ...]
                     :prerequisites [<string> ...]}}}
```

### Output Specification

```clojure
{:schema <keyword>  ; One of the supported schemas
 :path <string>}    ; Target file path
```

## Error Handling

### Exception Types

#### Validation Errors

```clojure
(ex-info "EDN missing required :mcp-servers key"
         {:edn edn-map :missing-key :mcp-servers})
```

#### Adapter Errors

```clojure
(ex-info "Unknown :schema :unknown.format"
         {:known [:mcp.json :vscode.json ...]})
```

#### File System Errors

```clojure
(ex-info "Failed reading configuration file"
         {:path file-path :cause ex})
```

### Error Recovery Patterns

#### Graceful Degradation

```clojure
(try
  (adapter/write-full path data)
  (catch java.io.IOException e
    (logger/warn "Write failed, retrying" {:path path})
    (Thread/sleep 1000)
    (adapter/write-full path data)))
```

#### Validation with Defaults

```clojure
(defn safe-read-config [path]
  (try
    (validate-edn-structure! (read-string (slurp path)))
    (catch Exception e
      (logger/error "Invalid config, using defaults" {:path path})
      default-config)))
```

## Configuration Policies

### Merge Policies

```clojure
;; Push policy: EDN overrides target
(def ^:dynamic *push-policy*
  {:mcp-merge deep-merge
   :rest-policy :preserve})

;; Pull policy: Target fills gaps, EDN wins on conflict
(def ^:dynamic *pull-policy*
  {:mcp-merge deep-merge-prefer-existing})
```

### Custom Policies

```clojure
(defn custom-merge [existing new]
  ;; Custom merge logic
  (merge-with merge-fn existing new))

(binding [*push-policy* {:mcp-merge custom-merge}]
  (push {:schema :mcp.json :path target} config))
```

## Utility Functions

### Schema Normalization

```clojure
(normalize-schema s)
```

Normalize schema string/keyword to keyword.

**Parameters:**

- `s` (string/keyword) - Schema identifier

**Returns:** (keyword) - Normalized schema keyword

---

### Path Utilities

```clojure
(edn-base edn-path)
```

Get base directory for EDN file.

**Parameters:**

- `edn-path` (string) - Path to EDN file

**Returns:** (string) - Base directory

---

```clojure
(abs-target base path)
```

Get absolute target path.

**Parameters:**

- `base` (string) - Base directory
- `path` (string) - Relative path

**Returns:** (string) - Absolute path

---

This API reference provides comprehensive documentation for all public functions and data structures in the MCP Bridge package.
