# Data Collection Error Handling

## Overview

The data collection system implements comprehensive error handling to ensure robust operation even when individual data sources are unavailable. This document describes the error handling strategies, fallback mechanisms, and recovery procedures.

## Error Categories

### 1. System Errors

- **File System Errors**: Permission denied, file not found, disk I/O errors
- **Network Errors**: Connection timeouts, unreachable services
- **Process Errors**: Command not found, process execution failures

### 2. Data Errors

- **Parse Errors**: Invalid JSON/EDN format, malformed data
- **Validation Errors**: Data doesn't match expected schema
- **Type Errors**: Incorrect data types, missing required fields

### 3. Configuration Errors

- **Invalid Configuration**: Missing required config, invalid values
- **Dependency Errors**: Required tools not available
- **Environment Errors**: Missing environment variables

## Error Handling Strategy

### Graceful Degradation

The system follows a graceful degradation approach where failures in individual collectors don't prevent the overall data collection process from succeeding.

```clojure
;; Example: Kanban collector fails but others succeed
{:success true
 :data {:environment {...}    ; Success
        :kanban {...}         ; Failed but has fallback
        :file-index {...}}    ; Success
 :timestamp 1234567890}
```

### Fallback Data Hierarchy

1. **Primary Collection**: Attempt to collect from the intended source
2. **Cached Data**: Use previously cached data if available
3. **Fallback Data**: Use predefined fallback values
4. **Default Values**: Use minimal default values

## Collector-Specific Error Handling

### Environment Collector

#### Error Scenarios

- Environment variables not set
- Permission denied accessing environment
- Invalid variable names

#### Fallback Strategy

```clojure
{:agent-name "default-agent"
 :environment "development"
 :debug-level "info"
 :node-env "development"
 :collection-method "fallback"}
```

#### Error Response

```clojure
{:success false
 :error {:message "Environment variables not accessible"
         :type java.lang.SecurityException}
 :fallback {...}
 :source "environment"
 :timestamp 1234567890}
```

### Kanban Collector

#### Error Scenarios

- `pnpm` command not found
- Kanban CLI execution failure
- Invalid JSON/EDN output
- Network connectivity issues

#### Fallback Strategy

```clojure
{:tasks []
 :columns ["incoming" "ready" "in_progress" "done"]
 :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50 "done" 100}
 :collection-method "fallback"}
```

#### Error Response

```clojure
{:success false
 :error {:message "Command not found: pnpm"
         :type java.io.IOException}
 :fallback {...}
 :source "kanban"
 :timestamp 1234567890}
```

### File Index Collector

#### Error Scenarios

- Directory not found
- Permission denied accessing directories
- File system I/O errors
- Invalid directory structure

#### Fallback Strategy

```clojure
{:packages []
 :tools []
 :configs {}
 :collection-method "fallback"}
```

#### Error Response

```clojure
{:success false
 :error {:message "Permission denied: /restricted/path"
         :type java.io.FileNotFoundException}
 :fallback {...}
 :source "file-index"
 :timestamp 1234567890}
```

## Retry Mechanisms

### Retry Logic

The system implements intelligent retry logic for transient failures:

```clojure
(defn retry-collection [collector config max-attempts]
  (loop [attempt 1]
    (let [result (collect collector config)]
      (if (or (:success result)
              (>= attempt max-attempts)
              (not (retryable? (:error result))))
        result
        (do
          (Thread/sleep (* attempt 1000)) ; Exponential backoff
          (recur (inc attempt)))))))
```

### Retryable Errors

- **Network timeouts**: Connection issues, slow responses
- **Temporary file system errors**: Lock contention, temporary unavailability
- **Process startup delays**: Services starting up

### Non-Retryable Errors

- **Permission denied**: Security restrictions
- **Command not found**: Missing dependencies
- **Invalid configuration**: User configuration errors

## Error Reporting

### Error Format

All errors follow a consistent format:

```clojure
{:error {:message "Human-readable error description"
         :type java.lang.Exception
         :context {:collector "environment"
                   :config {...}
                   :operation "collect"}
         :timestamp 1234567890
         :retryable? true/false}}
```

### Error Categories

#### System Errors

```clojure
{:error {:message "Permission denied"
         :type java.io.FileNotFoundException
         :context {:operation "file-read"
                   :path "/restricted/file"}
         :retryable? false}}
```

#### Network Errors

```clojure
{:error {:message "Connection timeout"
         :type java.net.SocketTimeoutException
         :context {:host "api.example.com"
                   :port 443
                   :timeout 30000}
         :retryable? true}}
```

#### Parse Errors

```clojure
{:error {:message "Invalid JSON format"
         :type clojure.lang.ExceptionInfo
         :context {:input "invalid json"
                   :parser "json/parse"}
         :retryable? false}}
```

## Error Recovery Procedures

### Automatic Recovery

1. **Immediate Fallback**: Use fallback data for non-critical failures
2. **Retry with Backoff**: Retry transient failures with exponential backoff
3. **Circuit Breaker**: Stop retrying after consecutive failures
4. **Graceful Degradation**: Continue with available data sources

### Manual Recovery

1. **Configuration Fix**: Correct invalid configuration
2. **Dependency Installation**: Install missing tools/dependencies
3. **Permission Fix**: Adjust file system permissions
4. **Environment Setup**: Set required environment variables

## Error Monitoring

### Error Metrics

Track error rates and patterns:

```clojure
{:error-stats {:total-errors 25
               :error-rate 0.05
               :errors-by-collector {:environment 5
                                   :kanban 15
                                   :file-index 5}
               :errors-by-type {:java.io.IOException 10
                               :java.lang.SecurityException 5
                               :clojure.lang.ExceptionInfo 10}}}
```

### Error Alerts

Configure alerts for critical errors:

```clojure
{:error-alerts {:high-error-rate {:threshold 0.1
                                  :window "5m"}
                :critical-failure {:collectors ["environment"]
                                  :action "immediate-notification"}}}
```

## Configuration for Error Handling

### Global Error Configuration

```clojure
{:error-handling {:retry-attempts 3
                  :retry-delay 1000           ; Initial delay in ms
                  :max-retry-delay 30000       ; Maximum delay in ms
                  :circuit-breaker-threshold 5 ; Consecutive failures
                  :fallback-enabled true
                  :error-logging true}}
```

### Collector-Specific Error Configuration

```clojure
{:collectors {:environment {:retry-attempts 1      ; No retry for env vars
                           :fallback-enabled true}
              :kanban {:retry-attempts 5
                      :retry-delay 2000
                      :timeout 30000}
              :file-index {:retry-attempts 2
                          :fallback-enabled true}}}
```

## Best Practices

### Error Prevention

1. **Validate Configuration**: Validate all configuration before collection
2. **Check Dependencies**: Verify required tools are available
3. **Test Permissions**: Ensure file system access permissions
4. **Monitor Resources**: Check available disk space and memory

### Error Handling

1. **Always Check Success**: Verify `:success` field before using data
2. **Use Fallback Data**: Leverage fallback data when available
3. **Log Errors**: Record errors for debugging and monitoring
4. **Implement Timeouts**: Prevent hanging operations

### Error Recovery

1. **Implement Circuit Breakers**: Stop retrying after consecutive failures
2. **Use Exponential Backoff**: Avoid overwhelming failing services
3. **Monitor Error Rates**: Track and alert on error patterns
4. **Provide Clear Messages**: Help users understand and fix errors

## Troubleshooting Guide

### Common Error Patterns

#### 1. Permission Denied

```
Error: Permission denied
Cause: File system permissions
Solution: Check directory permissions, run with appropriate user
```

#### 2. Command Not Found

```
Error: Command not found: pnpm
Cause: Missing dependency
Solution: Install pnpm or update PATH
```

#### 3. Connection Timeout

```
Error: Connection timeout
Cause: Network connectivity or service unavailable
Solution: Check network connection, service status
```

#### 4. Invalid Configuration

```
Error: Invalid configuration value
Cause: Configuration validation failed
Solution: Check configuration format and values
```

### Debug Information

Enable debug mode for detailed error information:

```clojure
;; Enable debug logging
(def context (dc/collect-agent-context {:debug true}))

;; Check error details
(when (not (:success context))
  (doseq [[collector-name result] (:data context)]
    (when (not (:success result))
      (println "Collector" collector-name "failed:")
      (println "Error:" (get-in result [:error :message]))
      (println "Type:" (get-in result [:error :type]))
      (println "Context:" (get-in result [:error :context])))))
```

### Error Recovery Examples

#### Recover from Missing Dependency

```clojure
(defn safe-kanban-collection [config]
  (try
    (dc/collect-kanban-data config)
    (catch java.io.IOException e
      (if (.contains (.getMessage e) "not found")
        ;; Install missing dependency and retry
        (do
          (install-dependency "pnpm")
          (dc/collect-kanban-data config))
        ;; Re-throw other IO errors
        (throw e)))))
```

#### Handle Permission Errors

```clojure
(defn safe-file-collection [config]
  (let [result (dc/collect-file-index-data config)]
    (if (and (not (:success result))
             (= java.io.FileNotFoundException
                (get-in result [:error :type])))
      ;; Try with alternative path
      (dc/collect-file-index-data
        (assoc config :base-path (get-fallback-path)))
      result)))
```

## Testing Error Handling

### Unit Tests for Error Scenarios

```clojure
(deftest test-environment-collector-error
  (testing "Environment collector handles missing variables"
    (let [result (dc/collect-environment-data {:variables ["NONEXISTENT"]})]
      (is (true? (:success result)))  ; Should succeed with empty data
      (is (empty? (filter #(str/starts-with? (name %) "nonexistent")
                          (keys (:data result))))))))

(deftest test-kanban-collector-error
  (testing "Kanban collector handles command not found"
    (let [result (dc/collect-kanban-data {:kanban-command "nonexistent"})]
      (is (false? (:success result)))
      (is (contains? result :fallback))
      (is (= "fallback" (get-in result [:fallback :collection-method]))))))

(deftest test-file-collector-error
  (testing "File collector handles permission denied"
    (let [result (dc/collect-file-index-data {:base-path "/root"})]
      (is (false? (:success result)))
      (is (contains? result :fallback)))))
```

### Integration Tests for Error Recovery

```clojure
(deftest test-error-recovery
  (testing "System recovers from individual collector failures"
    (let [context (dc/collect-agent-context
                    {:kanban-command "invalid"})]
      (is (true? (:success context)))  ; Overall success
      (is (false? (get-in context [:data :kanban :success])))
      (is (contains? (get-in context [:data :kanban]) :fallback)))))
```

## Performance Considerations

### Error Handling Overhead

- **Timeout Management**: Appropriate timeouts prevent hanging
- **Retry Logic**: Intelligent retry reduces unnecessary attempts
- **Fallback Data**: Pre-computed fallbacks reduce recovery time
- **Error Caching**: Cache error states to avoid repeated failures

### Resource Management

- **Connection Pooling**: Reuse connections for network operations
- **Memory Management**: Clean up resources after errors
- **Thread Management**: Use thread pools for concurrent operations
- **File Handle Management**: Ensure proper file handle cleanup

## Security Considerations

### Error Information Disclosure

- **Sanitize Error Messages**: Remove sensitive information from error messages
- **Log Security**: Ensure error logs don't contain passwords or tokens
- **Error Responses**: Limit error details in external responses

### Secure Error Handling

- **Permission Checks**: Validate permissions before operations
- **Input Validation**: Validate all inputs to prevent injection attacks
- **Error Rate Limiting**: Prevent error-based attacks through rate limiting
