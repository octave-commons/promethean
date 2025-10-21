# Data Collection Interfaces

## Overview

The data collection interfaces provide a unified way to collect information from various sources within the Promethean Framework. This system enables agent generation by gathering context from environment variables, kanban boards, and file system analysis.

## Architecture

### Core Components

1. **Data Collectors** - Specialized collectors for different data sources
2. **Validation Layer** - Schema-based data validation and sanitization
3. **Error Handling** - Graceful degradation with fallback mechanisms
4. **Collection Manager** - Orchestrates multiple collectors

### Data Sources

#### Environment Variables

- **Target Variables**: `AGENT_NAME`, `ENVIRONMENT`, `DEBUG_LEVEL`, `NODE_ENV`
- **Custom Variables**: Support for user-defined environment variables
- **Fallback**: Default values when variables are missing

#### Kanban Board Integration

- **Integration**: `@promethean/kanban` CLI interface
- **Data Points**: Tasks, columns, WIP limits, workflow status
- **Fallback**: Default board structure when kanban unavailable

#### File Index Analysis

- **Scan Directories**: `packages`, `scripts`, `tools`, `configs`
- **File Types**: `.clj`, `.cljs`, `.js`, `.ts`, `.json`, `.md`
- **Analysis**: Project structure, available tools, API surfaces

## API Reference

### Simple Data Collection API

#### Environment Data Collection

```clojure
;; Collect default environment variables
(collect-environment-data {})

;; Collect custom variables
(collect-environment-data {:variables ["PATH" "HOME"]})

;; Returns:
{:success true
 :data {:agent-name "test-agent"
         :environment "development"
         :debug-level "info"
         :node-env "development"
         :collection-method "environment-variables"
         :timestamp 1234567890}
 :source "environment"
 :timestamp 1234567890}
```

#### Kanban Data Collection

```clojure
;; Collect kanban board data
(collect-kanban-data {})

;; Custom kanban command
(collect-kanban-data {:kanban-command "custom-kanban"})

;; Returns:
{:success true
 :data {:tasks [...]
         :columns ["incoming" "ready" "in_progress" "done"]
         :wip-limits {"incoming" 100 "ready" 75}
         :collection-method "kanban-cli"
         :timestamp 1234567890}
 :source "kanban"
 :timestamp 1234567890}
```

#### File Index Collection

```clojure
;; Collect file index data
(collect-file-index-data {})

;; Custom scan configuration
(collect-file-index-data {:base-path "."
                          :scan-dirs ["src" "test"]})

;; Returns:
{:success true
 :data {:packages [...]
         :tools [...]
         :configs {...}
         :collection-method "file-system-scan"
         :timestamp 1234567890}
 :source "file-index"
 :timestamp 1234567890}
```

### Collection Manager API

#### Complete Agent Context

```clojure
;; Collect from all default sources
(collect-agent-context {})

;; Collect from specific sources
(collect-agent-context {:collectors [:environment :file-index]})

;; Returns:
{:success true
 :data {:environment {...}
         :kanban {...}
         :file-index {...}}
 :timestamp 1234567890
 :collectors [:environment :kanban :file-index]}
```

#### Selective Data Collection

```clojure
;; Collect from specific collectors
(collect-all-data {:collectors [:environment]})

;; Returns:
{:environment {...}}
```

### Utility Functions

```clojure
;; Get available collectors
(get-available-collectors)
;; => [:environment :kanban :file-index]

;; Validate collection result
(validate-collection-result result)
;; => true/false
```

## Error Handling

### Fallback Strategies

Each collector provides fallback data when the primary collection method fails:

#### Environment Fallback

```clojure
{:agent-name "default-agent"
 :environment "development"
 :debug-level "info"
 :node-env "development"
 :collection-method "fallback"}
```

#### Kanban Fallback

```clojure
{:tasks []
 :columns ["incoming" "ready" "in_progress" "done"]
 :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50 "done" 100}
 :collection-method "fallback"}
```

#### File Index Fallback

```clojure
{:packages []
 :tools []
 :configs {}
 :collection-method "fallback"}
```

### Error Response Format

```clojure
{:success false
 :error {:message "Error description"
         :type java.lang.Exception}
 :fallback {...}
 :source "collector-name"
 :timestamp 1234567890}
```

## Data Validation

### Environment Data Schema

```clojure
{:type :object
 :required true
 :properties {:agent-name {:type :string :required false}
              :environment {:type :string :required false}
              :debug-level {:type :string :required false}
              :node-env {:type :string :required false}
              :collection-method {:type :string :required true}
              :timestamp {:type :number :required true}}
 :additional-properties true}
```

### Kanban Data Schema

```clojure
{:type :object
 :required true
 :properties {:tasks {:type :array :required false}
              :columns {:type :array :required false}
              :wip-limits {:type :object :required false}
              :collection-method {:type :string :required true}
              :command {:type :string :required false}
              :timestamp {:type :number :required true}}
 :additional-properties true}
```

### File Index Data Schema

```clojure
{:type :object
 :required true
 :properties {:packages {:type :array :required false}
              :tools {:type :array :required false}
              :configs {:type :object :required false}
              :collection-method {:type :string :required true}
              :base-path {:type :string :required false}
              :timestamp {:type :number :required true}}
 :additional-properties true}
```

## Configuration Options

### Global Configuration

```clojure
{:collectors [:environment :kanban :file-index]  ; Enabled collectors
 :timeout 30000                                   ; Collection timeout (ms)
 :retry-attempts 3                               ; Retry attempts for failures
 :validation true                                 ; Enable data validation
 :environment {:variables ["AGENT_NAME" "ENVIRONMENT"]}  ; Env vars to collect
 :kanban {:command "pnpm kanban"}                ; Kanban command
 :file-index {:base-path "."                     ; Base path for scanning
              :scan-dirs ["packages" "scripts"]}} ; Directories to scan
```

### Collector-Specific Configuration

#### Environment Collector

- `:variables` - Vector of environment variable names to collect
- `:case-sensitive` - Whether variable matching is case sensitive (default: false)

#### Kanban Collector

- `:kanban-command` - Command to execute for kanban data
- `:timeout` - Timeout for kanban command execution

#### File Index Collector

- `:base-path` - Base directory for scanning
- `:scan-dirs` - Directories to scan within base path
- `:file-types` - File extensions to include

## Performance Considerations

### Collection Timeouts

- Default timeout: 30 seconds per collector
- Configurable via `:timeout` in collector config
- Failures trigger fallback data immediately

### Caching Strategy

- Environment data: Real-time (no caching)
- Kanban data: Real-time (board changes frequently)
- File index: Could be cached for long-running processes

### Concurrent Collection

- Collectors run independently
- No shared state between collectors
- Safe for concurrent execution

## Integration Examples

### Basic Agent Context Collection

```clojure
(require '[promethean.agent-generator.data-collection-simple :as dc])

;; Collect complete agent context
(def context (dc/collect-agent-context {}))

;; Check collection success
(when (:success context)
  (let [env-data (get-in context [:data :environment])
        kanban-data (get-in context [:data :kanban])
        file-data (get-in context [:data :file-index])]

    ;; Use collected data for agent generation
    (println "Agent:" (:agent-name env-data))
    (println "Environment:" (:environment env-data))
    (println "Tasks:" (count (:tasks kanban-data)))
    (println "Packages:" (count (:packages file-data)))))
```

### Selective Data Collection

```clojure
;; Only collect environment and file index
(def partial-context (dc/collect-agent-context
                       {:collectors [:environment :file-index]}))

;; Collect specific environment variables
(def env-only (dc/collect-environment-data
                {:variables ["AGENT_NAME" "CUSTOM_SETTING"]}))
```

### Error Handling

```clojure
(defn safe-collect-context []
  (let [context (dc/collect-agent-context {})]
    (if (:success context)
      context
      ;; Handle partial failures
      (let [data (:data context)
            failed-collectors (->> data
                                   (filter (fn [[_ result]]
                                             (not (:success result))))
                                   (map first))]
        (println "Failed collectors:" failed-collectors)
        context))))

;; Use fallback data when available
(defn get-environment-value [context key]
  (let [env-result (get-in context [:data :environment])]
    (if (:success env-result)
      (get (:data env-result) key)
      (get (:fallback env-result) key))))
```

## Testing

### Unit Tests

```clojure
;; Test environment collection
(deftest test-environment-collection
  (let [result (dc/collect-environment-data {})]
    (is (true? (:success result)))
    (is (contains? (:data result) :collection-method))))

;; Test error handling
(deftest test-kanban-error-handling
  (let [result (dc/collect-kanban-data {:kanban-command "invalid"})]
    (is (contains? result :fallback))
    (is (= "fallback" (get-in result [:fallback :collection-method])))))
```

### Integration Tests

```clojure
(deftest test-complete-context
  (let [context (dc/collect-agent-context {})]
    (is (true? (:success context)))
    (is (contains? (:data context) :environment))
    (is (contains? (:data context) :kanban))
    (is (contains? (:data context) :file-index))))
```

## Best Practices

1. **Always check `:success` field** before using collected data
2. **Use fallback data** when primary collection fails
3. **Configure timeouts** appropriately for your environment
4. **Validate collected data** before using in agent generation
5. **Handle partial failures** gracefully
6. **Cache expensive operations** where appropriate
7. **Use selective collection** when only specific data is needed

## Troubleshooting

### Common Issues

1. **Kanban command not found**

   - Ensure `pnpm` is installed and available
   - Check kanban command path in configuration
   - Fallback data will be used automatically

2. **Environment variables missing**

   - Check variable names match exactly
   - Verify variables are set in the environment
   - Use fallback values for missing variables

3. **File scan permissions**

   - Ensure read permissions on scan directories
   - Check base-path exists and is accessible
   - Fallback data will be used on permission errors

4. **Timeout errors**
   - Increase timeout values for slow operations
   - Check network connectivity for external commands
   - Consider caching for expensive operations

### Debug Information

```clojure
;; Enable debug logging
(def context (dc/collect-agent-context {:debug true}))

;; Check collector availability
(def manager (dc/create-collection-manager {}))
(println "Available collectors:" (dc/available? manager))

;; Validate collected data
(require '[promethean.agent-generator.validation : as v])
(def validation (v/validate-agent-context context))
(println "Validation errors:" (:errors validation))
```
