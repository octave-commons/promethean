# Data Source Integration

## Overview

This document describes the integration points between the data collection system and existing Promethean Framework components. It provides detailed API documentation, configuration requirements, and security considerations for each data source.

## Integration Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Agent Gen     │    │  Data Collection│    │  Data Sources   │
│   System        │◄──►│    Layer        │◄──►│  (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Templates     │    │   Validation    │    │  Error Handling │
│   Engine        │    │     Layer       │    │   & Fallbacks   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Collection Request**: Agent generation system requests data
2. **Source Integration**: Data collection layer integrates with external sources
3. **Validation**: Collected data is validated against schemas
4. **Error Handling**: Failures are handled with fallback mechanisms
5. **Response**: Validated data returned to agent generation system

## Environment Variables Integration

### Integration Point

**Target**: Java System Properties and OS Environment Variables

**API**: `System/getenv` and `System/getProperties`

### Configuration Requirements

```clojure
;; Environment collector configuration
{:environment {:variables ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "NODE_ENV"]
               :case-sensitive false
               :include-system-properties true
               :prefix-filter "AGENT_"}}
```

### Security Considerations

- **Access Control**: Only read access to environment variables
- **Sensitive Data**: Filter out passwords, tokens, and secrets
- **Sanitization**: Remove or mask sensitive information

```clojure
;; Security configuration
{:environment {:security {:exclude-patterns #["PASSWORD" "TOKEN" "SECRET" "KEY"]
                         :mask-patterns #["API_KEY" "AUTH"]
                         :allowed-prefixes ["AGENT_" "ENV_" "DEBUG_"]}}}
```

### Integration Examples

```clojure
;; Basic environment collection
(def env-data (collect-environment-data {}))

;; Custom variable collection
(def custom-env (collect-environment-data
                  {:variables ["CUSTOM_VAR" "APP_CONFIG"]}))

;; Secure collection with filtering
(def secure-env (collect-environment-data
                  {:security {:exclude-patterns #["SECRET" "PASSWORD"]}}))
```

### Error Scenarios

| Scenario          | Error Type               | Fallback       | Recovery                 |
| ----------------- | ------------------------ | -------------- | ------------------------ |
| Permission denied | SecurityException        | Default values | Check permissions        |
| Variable not set  | MissingField             | Optional field | Set environment variable |
| Invalid encoding  | CharacterCodingException | Empty string   | Check system encoding    |

## Kanban Board Integration

### Integration Point

**Target**: `@promethean/kanban` CLI tool

**API**: Command-line interface with JSON output

### Configuration Requirements

```clojure
;; Kanban collector configuration
{:kanban {:command "pnpm kanban"
          :subcommand "list"
          :format "json"
          :timeout 30000
          :retry-attempts 3
          :working-directory "."}}
```

### API Documentation

#### Command Structure

```bash
# Basic kanban data retrieval
pnpm kanban list --json

# Task-specific queries
pnpm kanban list --status ready --json

# Board information
pnpm kanban board --json

# WIP limits
pnpm kanban limits --json
```

#### Response Format

```json
{
  "tasks": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Example Task",
      "status": "ready",
      "priority": "P1",
      "labels": ["bug", "frontend"],
      "created_at": "2025-10-18T10:00:00Z",
      "updated_at": "2025-10-18T11:00:00Z"
    }
  ],
  "columns": ["incoming", "ready", "in_progress", "done"],
  "wip_limits": {
    "incoming": 100,
    "ready": 75,
    "in_progress": 50,
    "done": 100
  },
  "metadata": {
    "total_tasks": 25,
    "board_version": "1.0.0"
  }
}
```

### Authentication & Security

- **No Authentication**: Local CLI tool access
- **File Permissions**: Read access to kanban data files
- **Command Injection**: Validate and sanitize command parameters

```clojure
;; Security configuration
{:kanban {:security {:validate-command true
                    :allowed-commands ["pnpm kanban"]
                    :working-directory-restricted true
                    :timeout-enforced true}}}
```

### Integration Examples

```clojure
;; Standard kanban collection
(def kanban-data (collect-kanban-data {}))

;; Custom command configuration
(def custom-kanban (collect-kanban-data
                     {:kanban-command "custom-kanban-cli"
                      :timeout 60000}))

;; Filtered task collection
(def filtered-tasks (collect-kanban-data
                      {:kanban-command "pnpm kanban list --status ready --json"}))
```

### Error Scenarios

| Scenario          | Error Type        | Fallback                | Recovery                   |
| ----------------- | ----------------- | ----------------------- | -------------------------- |
| Command not found | IOException       | Default board structure | Install pnpm/kanban        |
| Invalid JSON      | ParseException    | Empty task list         | Check kanban output format |
| Timeout           | TimeoutException  | Cached data             | Increase timeout           |
| Permission denied | SecurityException | Read-only mode          | Check file permissions     |

## File System Integration

### Integration Point

**Target**: Local file system and project structure

**API**: Java File I/O operations

### Configuration Requirements

```clojure
;; File index collector configuration
{:file-index {:base-path "."
               :scan-dirs ["packages" "scripts" "tools" "configs"]
               :file-types [".clj" ".cljs" ".js" ".ts" ".json" ".md"]
               :exclude-patterns [".git" "node_modules" ".cache"]
               :max-depth 5
               :follow-symlinks false}}
```

### API Documentation

#### Directory Scanning

```clojure
;; Scan specific directories
(scan-directories ["packages" "scripts"] base-path)

;; Filter by file type
(filter-files file-types directory-contents)

;; Extract metadata
(extract-file-metadata file-path)
```

#### File Metadata Extraction

```clojure
{:path "packages/agent-generator/src/core.clj"
 :name "core.clj"
 :type "file"
 :size 12345
 :last-modified 1234567890
 :content-type "text/x-clojure"
 :dependencies ["clojure.core" "promethean.core"]
 :exports ["promethean.agent-generator.core"]
 :metadata {:namespace "promethean.agent-generator.core"
            :functions 15
            :macros 3}}
```

### Security Considerations

- **Path Traversal**: Validate and sanitize file paths
- **Access Control**: Restrict to allowed directories
- **Resource Limits**: Limit scan depth and file count
- **Sensitive Files**: Exclude configuration files with secrets

```clojure
;; Security configuration
{:file-index {:security {:allowed-paths ["/home/err/devel/promethean"]
                         :blocked-patterns [".env" ".secret" "config"]
                         :max-files-scanned 10000
                         :max-file-size 10485760 ; 10MB
                         :validate-paths true}}}
```

### Integration Examples

```clojure
;; Standard file index collection
(def file-data (collect-file-index-data {}))

;; Custom scan configuration
(def custom-scan (collect-file-index-data
                   {:base-path "./packages"
                    :scan-dirs ["agent-generator" "kanban"]
                    :file-types [".clj" ".cljs"]}))

;; Restricted scan with security
(def secure-scan (collect-file-index-data
                   {:security {:allowed-paths ["/safe/path"]
                              :max-files-scanned 1000}}))
```

### Error Scenarios

| Scenario            | Error Type             | Fallback             | Recovery                  |
| ------------------- | ---------------------- | -------------------- | ------------------------- |
| Directory not found | FileNotFoundException  | Empty directory list | Check path configuration  |
| Permission denied   | SecurityException      | Skip directory       | Check permissions         |
| Too many files      | ResourceLimitException | Partial results      | Increase limits or filter |
| Invalid path        | InvalidPathException   | Skip file            | Validate path format      |

## Cross-Platform Compatibility

### Platform-Specific Considerations

#### Windows

- **Path Separators**: Use `\` vs `/`
- **Command Execution**: `cmd.exe` vs shell
- **File Permissions**: Different permission model
- **Environment Variables**: Case-insensitive

#### macOS/Linux

- **Path Separators**: Use `/`
- **Command Execution**: Shell environment
- **File Permissions**: Unix permissions
- **Environment Variables**: Case-sensitive

### Compatibility Layer

```clojure
;; Platform detection
(def platform (detect-platform))
;; => {:os "linux" :arch "x86_64" :version "5.15.0"}

;; Platform-specific configuration
(def platform-config
  (case (:os platform)
    :windows windows-config
    :macos macos-config
    :linux linux-config))

;; Path normalization
(defn normalize-path [path]
  (if (= :windows (:os platform))
    (str/replace path "/" "\\")
    path))
```

## Performance Optimization

### Caching Strategy

```clojure
;; Cache configuration
{:cache {:enabled true
         :ttl 300000           ; 5 minutes
         :max-size 1000        ; Max cached items
         :eviction-policy :lru}}
```

### Concurrent Collection

```clojure
;; Parallel data collection
(defn collect-all-parallel [config]
  (let [futures (doall
                 (for [collector [:environment :kanban :file-index]]
                   (future (collect-collector collector config)))]
    (zipmap [:environment :kanban :file-index]
            (map deref futures))))
```

### Resource Management

```clojure
;; Resource limits
{:resource-limits {:max-memory 536870912     ; 512MB
                   :max-threads 4
                   :timeout 30000
                   :max-file-size 10485760}} ; 10MB
```

## Monitoring & Observability

### Metrics Collection

```clojure
;; Collection metrics
{:metrics {:collection-time {:environment 150
                            :kanban 2000
                            :file-index 500}
           :success-rate {:environment 1.0
                         :kanban 0.8
                         :file-index 1.0}
           :error-count {:environment 0
                        :kanban 2
                        :file-index 0}}}
```

### Health Checks

```clojure
;; Health check endpoints
(defn health-check []
  {:status "healthy"
   :timestamp (System/currentTimeMillis)
   :collectors {:environment (check-collector-health :environment)
                :kanban (check-collector-health :kanban)
                :file-index (check-collector-health :file-index)}})
```

### Logging Configuration

```clojure
;; Logging levels and destinations
{:logging {:level :info
           :destinations [:console :file]
           :file-path "/var/log/agent-generator/data-collection.log"
           :format :json
           :include-stack-trace true}}
```

## Testing Integration

### Mock Data Sources

```clojure
;; Mock environment for testing
(def mock-environment {"AGENT_NAME" "test-agent"
                       "ENVIRONMENT" "test"})

;; Mock kanban response
(def mock-kanban-response {:tasks []
                          :columns ["incoming" "ready"]
                          :wip-limits {"incoming" 100}})

;; Mock file system
(def mock-file-system {"packages/agent-generator" {:type :directory}
                      "packages/agent-generator/src" {:type :directory}})
```

### Integration Tests

```clojure
(deftest test-kanban-integration
  (testing "Kanban CLI integration"
    (with-mock-kanban mock-kanban-response
      (let [result (collect-kanban-data {})]
        (is (true? (:success result)))
        (is (= mock-kanban-response (:data result)))))))

(deftest test-file-system-integration
  (testing "File system scanning"
    (with-temp-directory [temp-dir "/tmp/test"]
      (create-test-files temp-dir)
      (let [result (collect-file-index-data {:base-path temp-dir})]
        (is (true? (:success result)))
        (is (> (count (get-in result [:data :packages])) 0))))))
```

## Troubleshooting

### Common Integration Issues

#### 1. Kanban Command Not Found

```
Error: Cannot run program "pnpm"
Cause: pnpm not in PATH
Solution: Install pnpm or update PATH environment variable
```

#### 2. File Access Denied

```
Error: Permission denied accessing /restricted/path
Cause: Insufficient file system permissions
Solution: Check directory permissions or run with appropriate user
```

#### 3. Environment Variable Access

```
Error: SecurityException accessing environment variables
Cause: Security manager restrictions
Solution: Configure security policy or run with reduced security
```

### Debug Tools

```clojure
;; Debug configuration
(defn debug-integration [collector-name config]
  (println "Debugging collector:" collector-name)
  (println "Configuration:" config)
  (println "System properties:" (System/getProperties))
  (println "Environment:" (System/getenv))
  (println "Working directory:" (System/getProperty "user.dir")))

;; Test connectivity
(defn test-connectivity []
  {:kanban (test-kanban-connectivity)
   :file-system (test-file-system-access)
   :environment (test-environment-access)})
```

## Best Practices

### Integration Design

1. **Loose Coupling**: Minimize dependencies between collectors
2. **Fail Fast**: Detect and report errors quickly
3. **Graceful Degradation**: Provide fallbacks for all failure modes
4. **Configuration Driven**: Make behavior configurable without code changes

### Security

1. **Principle of Least Privilege**: Request only necessary permissions
2. **Input Validation**: Validate all external inputs
3. **Output Sanitization**: Sanitize collected data
4. **Audit Logging**: Log all data access operations

### Performance

1. **Lazy Loading**: Load data only when needed
2. **Caching**: Cache expensive operations
3. **Parallel Processing**: Use concurrent operations where possible
4. **Resource Management**: Clean up resources properly

### Maintainability

1. **Clear Interfaces**: Well-defined APIs between components
2. **Comprehensive Testing**: Unit and integration tests
3. **Documentation**: Keep integration documentation current
4. **Version Compatibility**: Handle API version changes gracefully

This integration documentation provides the foundation for reliable, secure, and maintainable data source integration within the Promethean Framework.
