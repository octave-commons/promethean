# Data Validation Schemas

## 🎯 Overview

This document defines comprehensive validation schemas for all data types collected by the data collection interfaces, ensuring data quality, consistency, and reliability across the Promethean Framework.

## 📋 Schema Definition Format

```clojure
(def SchemaDefinition
  {:type "Data type (string, number, boolean, array, object)"
   :required "Whether field is required (boolean)"
   :format "Format validation (email, url, uuid, timestamp, etc.)"
   :min-length "Minimum length for strings"
   :max-length "Maximum length for strings"
   :min-value "Minimum value for numbers"
   :max-value "Maximum value for numbers"
   :pattern "Regex pattern for string validation"
   :enum "Allowed values (set)"
   :custom-validator "Custom validation function"
   :description "Human-readable description"})
```

## 🔧 Environment Variable Validation Schemas

### 1. Agent Configuration Schema

```clojure
(def AgentConfigSchema
  {:AGENT_NAME {:type string
                :required false
                :min-length 1
                :max-length 100
                :pattern #"^[a-zA-Z0-9_-]+$"
                :description "Agent identifier name"}

   :ENVIRONMENT {:type string
                 :required false
                 :enum #{"development" "staging" "production" "test"}
                 :description "Runtime environment"}

   :DEBUG_LEVEL {:type string
                 :required false
                 :enum #{"error" "warn" "info" "debug" "trace"}
                 :description "Logging debug level"}

   :PROMETHEAN_API_KEY {:type string
                         :required false
                         :min-length 10
                         :max-length 500
                         :pattern #"^[a-zA-Z0-9_-]+$"
                         :description "API authentication key"}

   :AGENT_CAPABILITIES {:type string
                        :required false
                        :custom-validator validate-capabilities-list
                        :description "Comma-separated list of agent capabilities"}})
```

### 2. Runtime Context Schema

```clojure
(def RuntimeContextSchema
  {:NODE_ENV {:type string
              :required false
              :enum #{"development" "production" "test"}
              :description "Node.js environment"}

   :PORT {:type number
          :required false
          :min-value 1
          :max-value 65535
          :description "Server port number"}

   :HOST {:type string
          :required false
          :format :url
          :description "Server host URL"}

   :TIMEZONE {:type string
              :required false
              :pattern #"^[A-Za-z_]+/[A-Za-z_]+$"
              :description "Timezone identifier"}

   :LOCALE {:type string
            :required false
            :pattern #"^[a-z]{2}(-[A-Z]{2})?$"
            :description "Locale identifier"}})
```

## 📊 Kanban Board Validation Schemas

### 1. Board State Schema

```clojure
(def BoardStateSchema
  {:board-id {:type string
              :required true
              :format :uuid
              :description "Unique board identifier"}

   :board-name {:type string
                :required true
                :min-length 1
                :max-length 200
                :description "Board display name"}

   :columns {:type array
             :required true
             :min-items 1
             :item-schema ColumnSchema
             :description "List of board columns"}

   :tasks {:type array
           :required true
           :min-items 0
           :item-schema TaskSchema
           :description "List of all tasks"}

   :wip-limits {:type object
                :required true
                :schema WipLimitsSchema
                :description "Work-in-progress limits by column"}

   :last-updated {:type string
                  :required true
                  :format :timestamp
                  :description "Last board update timestamp"}})
```

### 2. Column Schema

```clojure
(def ColumnSchema
  {:id {:type string
        :required true
        :format :uuid
        :description "Unique column identifier"}

   :name {:type string
          :required true
          :min-length 1
          :max-length 100
          :pattern #"^[a-zA-Z0-9_-]+$"
          :description "Column name (normalized)"}

   :display-name {:type string
                  :required true
                  :min-length 1
                  :max-length 100
                  :description "Column display name"}

   :position {:type number
              :required true
              :min-value 0
              :description "Column position order"}

   :wip-limit {:type number
               :required false
               :min-value 0
               :description "Work-in-progress limit"}

   :task-count {:type number
                :required true
                :min-value 0
                :description "Current number of tasks"}

   :column-type {:type string
                 :required true
                 :enum #{"backlog" "active" "review" "done"}
                 :description "Column type category"}})
```

### 3. Task Schema

```clojure
(def TaskSchema
  {:uuid {:type string
          :required true
          :format :uuid
          :description "Unique task identifier"}

   :title {:type string
           :required true
           :min-length 1
           :max-length 500
           :description "Task title"}

   :description {:type string
                 :required false
                 :max-length 10000
                 :description "Task description"}

   :status {:type string
            :required true
            :enum #{"incoming" "ready" "todo" "in_progress" "testing"
                    "review" "document" "done" "blocked" "rejected"}
            :description "Task status"}

   :priority {:type string
             :required true
             :enum #{"P0" "P1" "P2" "P3"}
             :description "Task priority level"}

   :assignee {:type string
              :required false
              :format :uuid
              :description "Assigned agent ID"}

   :column-id {:type string
               :required true
               :format :uuid
               :description "Current column ID"}

   :created-at {:type string
                :required true
                :format :timestamp
                :description "Task creation timestamp"}

   :updated-at {:type string
                :required true
                :format :timestamp
                :description "Last update timestamp"}

   :labels {:type array
            :required false
            :item-schema {:type string :min-length 1 :max-length 50}
            :description "Task labels"}

   :story-points {:type number
                 :required false
                 :min-value 0
                 :max-value 100
                 :description "Estimated story points"}})
```

### 4. WIP Limits Schema

```clojure
(def WipLimitsSchema
  {:total {:type number
           :required true
           :min-value 0
           :description "Total WIP limit for board"}

   :by-column {:type object
               :required true
               :key-format :uuid
               :value-schema {:type number :min-value 0}
               :description "WIP limits by column ID"}

   :by-column-type {:type object
                    :required true
                    :key-schema {:type string :enum #{"backlog" "active" "review" "done"}}
                    :value-schema {:type number :min-value 0}
                    :description "WIP limits by column type"}})
```

## 📁 File Index Validation Schemas

### 1. Project Structure Schema

```clojure
(def ProjectStructureSchema
  {:root-path {:type string
               :required true
               :min-length 1
               :description "Project root directory path"}

   :total-files {:type number
                 :required true
                 :min-value 0
                 :description "Total number of files"}

   :total-directories {:type number
                       :required true
                       :min-value 0
                       :description "Total number of directories"}

   :file-types {:type object
                :required true
                :key-schema {:type string}
                :value-schema {:type number :min-value 0}
                :description "File count by extension"}

   :directory-tree {:type object
                    :required true
                    :schema DirectoryNodeSchema
                    :description "Hierarchical directory structure"}

   :last-scanned {:type string
                  :required true
                  :format :timestamp
                  :description "Last scan timestamp"}})
```

### 2. Directory Node Schema

```clojure
(def DirectoryNodeSchema
  {:name {:type string
          :required true
          :min-length 1
          :max-length 255
          :description "Directory or file name"}

   :path {:type string
          :required true
          :min-length 1
          :description "Full path from root"}

   :type {:type string
          :required true
          :enum #{"directory" "file"}
          :description "Node type"}

   :size {:type number
          :required false
          :min-value 0
          :description "File size in bytes"}

   :modified-time {:type string
                  :required true
                  :format :timestamp
                  :description "Last modification timestamp"}

   :children {:type array
              :required false
              :item-schema DirectoryNodeSchema
              :description "Child nodes (directories only)"}})
```

### 3. Available Tools Schema

```clojure
(def AvailableToolsSchema
  {:tools {:type array
           :required true
           :min-items 0
           :item-schema ToolSchema
           :description "List of available tools"}

   :categories {:type array
                :required true
                :item-schema {:type string :min-length 1}
                :description "Tool categories"}

   :total-count {:type number
                 :required true
                 :min-value 0
                 :description "Total number of tools"}

   :last-discovered {:type string
                     :required true
                     :format :timestamp
                     :description "Last tool discovery timestamp"}})
```

### 4. Tool Schema

```clojure
(def ToolSchema
  {:name {:type string
          :required true
          :min-length 1
          :max-length 100
          :pattern #"^[a-zA-Z0-9_-]+$"
          :description "Tool identifier"}

   :display-name {:type string
                  :required true
                  :min-length 1
                  :max-length 200
                  :description "Tool display name"}

   :description {:type string
                :required true
                :min-length 1
                :max-length 1000
                :description "Tool description"}

   :category {:type string
              :required true
              :enum #{"build" "test" "deploy" "monitor" "security" "utility"}
              :description "Tool category"}

   :version {:type string
             :required false
             :pattern #"^v?[0-9]+\.[0-9]+\.[0-9]+$"
             :description "Tool version"}

   :command {:type string
             :required true
             :min-length 1
             :max-length 500
             :description "Command to execute tool"}

   :parameters {:type object
               :required false
               :schema ParameterSchema
               :description "Tool parameters"}

   :dependencies {:type array
                 :required false
                 :item-schema {:type string :min-length 1}
                 :description "Tool dependencies"}

   :available {:type boolean
              :required true
              :description "Whether tool is currently available"}})
```

### 5. Package Dependencies Schema

```clojure
(def PackageDependenciesSchema
  {:packages {:type array
             :required true
             :min-items 0
             :item-schema PackageSchema
             :description "List of packages"}

   :total-dependencies {:type number
                       :required true
                       :min-value 0
                       :description "Total number of dependencies"}

   :dependency-graph {:type object
                     :required true
                     :schema DependencyGraphSchema
                     :description "Package dependency relationships"}

   :last-analyzed {:type string
                   :required true
                   :format :timestamp
                   :description "Last analysis timestamp"}})
```

### 6. Package Schema

```clojure
(def PackageSchema
  {:name {:type string
          :required true
          :min-length 1
          :max-length 200
          :pattern #"^@[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$"
          :description "Package name"}

   :version {:type string
             :required true
             :pattern #"^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$"
             :description "Package version"}

   :description {:type string
                :required false
                :max-length 1000
                :description "Package description"}

   :dependencies {:type array
                 :required true
                 :item-schema {:type string :min-length 1}
                 :description "Package dependencies"}

   :dev-dependencies {:type array
                      :required false
                      :item-schema {:type string :min-length 1}
                      :description "Development dependencies"}

   :main {:type string
          :required false
          :min-length 1
          :description "Main entry point"}

   :exports {:type object
             :required false
             :description "Package exports"}

   :license {:type string
             :required false
             :min-length 1
             :max-length 100
             :description "Package license"}

   :repository {:type object
               :required false
               :schema RepositorySchema
               :description "Repository information"}})
```

## 🔍 Validation Functions

### 1. Core Validation

```clojure
(defn validate-schema
  "Validate data against schema definition"
  [data schema]
  (reduce-kv
    (fn [result field field-schema]
      (let [value (get data field)
            validation (validate-field value field-schema)]
        (assoc result field validation)))
    {}
    schema))

(defn validate-field
  "Validate individual field against schema"
  [value field-schema]
  (cond
    (and (:required field-schema) (nil? value))
    {:valid false :error "Field is required"}

    (and (not (:required field-schema)) (nil? value))
    {:valid true :warning "Optional field not provided"}

    :else
    (validate-value value field-schema)))
```

### 2. Type-Specific Validation

```clojure
(defn validate-string
  "Validate string field"
  [value schema]
  (cond
    (not (string? value))
    {:valid false :error "Value must be a string"}

    (:min-length schema)
    (when (< (count value) (:min-length schema))
      {:valid false :error (str "String too short, minimum " (:min-length schema) " characters")})

    (:max-length schema)
    (when (> (count value) (:max-length schema))
      {:valid false :error (str "String too long, maximum " (:max-length schema) " characters")})

    (:pattern schema)
    (when-not (re-matches (:pattern schema) value)
      {:valid false :error "String does not match required pattern"})

    (:enum schema)
    (when-not (contains? (:enum schema) value)
      {:valid false :error (str "Value must be one of: " (clojure.string/join ", " (:enum schema)))})

    :else
    {:valid true}))

(defn validate-number
  "Validate number field"
  [value schema]
  (cond
    (not (number? value))
    {:valid false :error "Value must be a number"}

    (:min-value schema)
    (when (< value (:min-value schema))
      {:valid false :error (str "Value too small, minimum " (:min-value schema))})

    (:max-value schema)
    (when (> value (:max-value schema))
      {:valid false :error (str "Value too large, maximum " (:max-value schema))})

    :else
    {:valid true}))
```

### 3. Custom Validators

```clojure
(defn validate-capabilities-list
  "Validate capabilities list string"
  [value]
  (if (string? value)
    (let [capabilities (clojure.string/split value #",")]
      (if (every? #(re-matches #"^[a-zA-Z0-9_-]+$" %) capabilities)
        {:valid true}
        {:valid false :error "Invalid capability format"}))
    {:valid false :error "Capabilities must be a comma-separated string"}))

(defn validate-uuid
  "Validate UUID format"
  [value]
  (if (re-matches #"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" value)
    {:valid true}
    {:valid false :error "Invalid UUID format"}))

(defn validate-timestamp
  "Validate ISO 8601 timestamp"
  [value]
  (try
    (Instant/parse value)
    {:valid true}
    (catch Exception _
      {:valid false :error "Invalid timestamp format"})))
```

## 📊 Validation Reports

### 1. Validation Result Schema

```clojure
(def ValidationResultSchema
  {:valid {:type boolean :required true}
   :errors {:type array :item-schema ValidationErrorSchema}
   :warnings {:type array :item-schema ValidationWarningSchema}
   :field-results {:type object :schema FieldValidationSchema}
   :summary {:type object :schema ValidationSummarySchema}
   :timestamp {:type string :format :timestamp :required true}})

(def ValidationErrorSchema
  {:field {:type string :required true}
   :message {:type string :required true}
   :value {:type any :required true}
   :schema-rule {:type string :required true}})

(def ValidationWarningSchema
  {:field {:type string :required true}
   :message {:type string :required true}
   :value {:type any :required true}
   :recommendation {:type string :required false}})
```

### 2. Validation Summary

```clojure
(def ValidationSummarySchema
  {:total-fields {:type number :required true}
   :valid-fields {:type number :required true}
   :invalid-fields {:type number :required true}
   :warning-fields {:type number :required true}
   :validation-score {:type number :min-value 0 :max-value 100 :required true}
   :critical-errors {:type number :required true}})
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-18  
**Compatibility**: Promethean Framework v2.0+
