# Clojure Package Structure Guide

## Overview

This document defines the standard structure for Clojure packages within the Promethean framework. All Clojure packages should follow this structure to ensure consistency, maintainability, and proper integration with the broader TypeScript/JavaScript monorepo.

## Standard Package Structure

```
packages/<package-name>/
├── src/
│   └── <namespace_path>/
│       ├── core.clj                 # Main namespace, package entry point
│       ├── cli.clj                  # Command-line interface (if applicable)
│       ├── config.clj               # Configuration management
│       └── ...                      # Other domain-specific namespaces
├── test/
│   └── <namespace_path>/
│       ├── core_test.clj            # Main namespace tests
│       ├── cli_test.clj             # CLI tests (if applicable)
│       └── ...                      # Other test files
├── docs/                            # Package-specific documentation
│   ├── README.md                    # Package overview and usage
│   ├── API.md                       # API documentation
│   └── ...                          # Other documentation files
├── resources/                       # Static resources (if needed)
│   ├── templates/                   # Template files
│   ├── config/                      # Default configuration files
│   └── ...                          # Other resources
├── .serena/                         # Serena project configuration (optional)
│   └── project.yml
├── deps.edn                         # Clojure dependencies
├── bb.edn                          # Babashka tasks (optional)
├── shadow-cljs.edn                  # ClojureScript configuration (if needed)
├── package.json                     # npm package integration
├── project.json                     # Additional project metadata
└── README.md                        # Package overview (links to docs/README.md)
```

## Required Files

### 1. `deps.edn` - Dependencies Configuration

```clojure
{:paths ["src" "resources" "test"]

 :deps {org.clojure/clojure {:mvn/version "1.11.1"}
        org.clojure/clojurescript {:mvn/version "1.11.60"}
        ;; Add other dependencies here
        }

 :aliases {:test {:extra-paths ["test"]
                  :extra-deps {io.github.cognitect-labs/test-runner
                               {:git/url "https://github.com/cognitect-labs/test-runner.git"
                                :git/tag "v0.5.1"
                                :git/sha "dfb30dd6605cb6c0efc275e1df1736e6379e87ac"}}
                  :main-opts ["-m" "cognitect.test-runner"]
                  :exec-fn cognitect.test-runner.api/test}

           :build {:deps {io.github.seancorfield/build-clj
                          {:git/tag "v0.9.2"
                           :git/sha "9c9f078"}}
                   :ns-default build}

           :repl {:main-opts ["-m" "nrepl.cmdline" "--port" "65536"]}}}
```

### 2. `package.json` - npm Integration

```json
{
  "name": "@promethean/<package-name>",
  "version": "1.0.0",
  "description": "<Package description>",
  "main": "src/<namespace_path>/core.clj",
  "scripts": {
    "test": "clojure -M:test",
    "repl": "clojure -M:repl",
    "build": "clojure -M:build",
    "clean": "rm -rf target"
  },
  "keywords": ["clojure", "promethean"],
  "author": "Promethean Team",
  "license": "MIT",
  "devDependencies": {
    "@promethean/eslint-config": "workspace:*"
  }
}
```

### 3. `README.md` - Package Overview

````markdown
# @promethean/<package-name>

## Description

Brief description of the package purpose and functionality.

## Usage

```clojure
(require '[<namespace-path>.core :as core])

;; Example usage
(core.some-function)
```
````

## Development

### Prerequisites

- Clojure CLI
- Node.js (for monorepo integration)

### Running Tests

```bash
pnpm --filter @promethean/<package-name> test
```

### Starting REPL

```bash
pnpm --filter @promethean/<package-name> repl
```

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## License

MIT

````

## Namespace Conventions

### 1. Naming Structure

All namespaces should follow the pattern: `promethean.<package-name>.<domain>`

Examples:
- `promethean.agent-generator.core`
- `promethean.clj-hacks.mcp.core`
- `promethean.frontend-service.dsl-macros`

### 2. Core Namespace Requirements

Every package must have a `core` namespace that:
- Provides the main public API
- Includes comprehensive documentation
- Defines the package's primary purpose
- Includes version information

```clojure
(ns promethean.package-name.core
  "Main namespace for <package-name> package.

   This package provides <brief description of functionality>.

   Key features:
   - Feature 1
   - Feature 2
   - Feature 3"

  (:require [some.required.ns :as req])
  (:gen-class))

(def ^:const version "1.0.0")

(defn main-function
  "Primary function that demonstrates the package's core functionality."
  [args]
  ;; Implementation
  )
````

### 3. CLI Namespace (Optional)

If the package provides command-line functionality:

```clojure
(ns promethean.package-name.cli
  "Command-line interface for <package-name>."

  (:require [clojure.tools.cli :as cli]
            [promethean.package-name.core :as core]))

(def cli-options
  [["-p" "--port PORT" "Port number"
    :default 3000
    :parse-fn #(Integer/parseInt %)
    :validate [#(< 0 % 65536) "Must be a number between 0 and 65536"]]
   ["-h" "--help" "Show help"]])

(defn -main
  "Main entry point for CLI application."
  [& args]
  (let [{:keys [options arguments errors summary]}
        (cli/parse-opts args cli-options)]
    ;; Handle CLI logic
    ))
```

## Testing Structure

### 1. Test Organization

- Test files should mirror the source structure
- Use `_test.clj` suffix for test files
- Each namespace should have corresponding test namespace

### 2. Test Requirements

```clojure
(ns promethean.package-name.core-test
  "Tests for core namespace."

  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [promethean.package-name.core :as core]))

(deftest test-main-function
  (testing "Main function works correctly"
    (is (= expected (core.main-function input)))))
```

### 3. Test Configuration

Use `cognitect-labs/test-runner` for consistent test execution across all packages.

## Documentation Standards

### 1. Code Documentation

- All public functions must have docstrings
- Include parameter descriptions and return value information
- Provide usage examples for complex functions

### 2. API Documentation

Create `docs/API.md` with:

- Function signatures
- Parameter descriptions
- Return value specifications
- Usage examples
- Error handling information

### 3. Architecture Documentation

For complex packages, include:

- `docs/ARCHITECTURE.md` - High-level design
- `docs/CONFIGURATION.md` - Configuration options
- `docs/EXAMPLES.md` - Detailed usage examples

## Integration with Monorepo

### 1. Workspace Configuration

Packages are automatically included in the monorepo via `pnpm-workspace.yaml`.

### 2. Cross-Package Dependencies

For dependencies on other packages in the monorepo:

```clojure
{:deps {promethean/other-package {:local/root "../other-package"}}}
```

### 3. Build Integration

Use standard npm scripts that integrate with the monorepo's build system.

## ClojureScript Support

If the package needs ClojureScript support:

### 1. `shadow-cljs.edn` Configuration

```clojure
{:source-paths ["src"]
 :dependencies [[org.clojure/clojurescript "1.11.60"]]
 :builds
 {:app {:target :node-script
        :output-to "target/main.js"
        :main promethean.package-name.core/main
        :compiler-options {:main promethean.package-name.core/main}}}}
```

### 2. Shared Code Structure

- Place shared code in `src/`
- Use reader conditionals for platform-specific code
- Test both JVM and JS targets

## Best Practices

### 1. Code Organization

- Keep namespaces focused and small
- Use clear, descriptive names
- Follow functional programming principles
- Minimize side effects

### 2. Error Handling

- Use `ex-info` for structured exceptions
- Provide meaningful error messages
- Include context in error data

### 3. Configuration

- Use environment variables for deployment config
- Provide sensible defaults
- Support configuration files for complex setups

### 4. Performance

- Profile critical paths
- Use lazy sequences appropriately
- Consider memory usage for large datasets

## Package Creation Checklist

- [ ] Create package directory structure
- [ ] Set up `deps.edn` with proper dependencies
- [ ] Create `package.json` with npm integration
- [ ] Implement `core.clj` with main namespace
- [ ] Add comprehensive tests
- [ ] Create documentation files
- [ ] Set up CI/CD configuration if needed
- [ ] Add package to workspace
- [ ] Test integration with monorepo

## Examples

See existing packages for reference:

- `packages/agent-generator` - Full-featured agent generation system
- `packages/clj-hacks` - Utility functions and MCP adapters
- `packages/frontend-service` - ClojureScript DSL macros

## Migration Guide

For existing code that needs to be restructured:

1. Identify main functionality and create `core.clj`
2. Organize code into logical namespaces
3. Create corresponding test structure
4. Add proper documentation
5. Update dependencies and build configuration
6. Test thoroughly before and after migration
