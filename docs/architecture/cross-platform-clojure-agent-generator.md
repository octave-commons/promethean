---
project: Promethean
hashtags: [#architecture, #clojure, #cross-platform, #agent-generator, #bb, #nbb, #jvm, #shadow-cljs]
---

# 🏗️ Cross-Platform Clojure Agent Generator Architecture

## 🎯 Executive Summary

This document defines a comprehensive cross-platform Clojure architecture for the **Agent Instruction Generator** - a universal tool that creates context-aware agent instruction files across bb (Babashka), nbb, JVM Clojure, and shadow-cljs platforms.

## 🧩 Core Architecture Principles

### 1. **Platform Abstraction Layer**
- **Unified API**: Single codebase with platform-specific implementations
- **Feature Detection**: Runtime capability detection and graceful degradation
- **Conditional Compilation**: Platform-specific code loading via reader conditionals

### 2. **Data-Driven Generation**
- **Environment Integration**: Dynamic context from environment variables
- **Kanban System Integration**: Real-time task board state incorporation
- **File Index Integration**: Project structure and capability analysis
- **Template Engine**: Configurable markdown template processing

### 3. **Cross-Platform Compatibility**
- **Reader Conditionals**: `#?(:bb ... :cljs ... :clj ... :default ...)`
- **Namespace Aliases**: Platform-specific implementations behind common interfaces
- **Dependency Management**: Conditional dependencies based on platform capabilities

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph "Platform Layer"
        BB[Babashka Runtime]
        NBB[Node.js Babashka]
        JVM[JVM Clojure]
        CLJS[Shadow-CLJS]
    end

    subgraph "Abstraction Layer"
        PLATFORM[Platform Detection]
        FEATURES[Feature Registry]
        ADAPTERS[Platform Adapters]
    end

    subgraph "Core Engine"
        CONFIG[Configuration Manager]
        COLLECTORS[Data Collectors]
        TEMPLATES[Template Engine]
        GENERATOR[Generator Core]
    end

    subgraph "Data Sources"
        ENV[Environment Variables]
        KANBAN[Kanban System]
        FILEINDEX[File Indexer]
        TEMPLATEDIR[Template Files]
    end

    subgraph "Outputs"
        AGENTS_MD[AGENTS.md]
        CLAUDE_MD[CLAUDE.md]
        CRUSH_MD[CRUSH.md]
        CUSTOM[Custom Agents]
    end

    Platform Layer --> Abstraction Layer
    Abstraction Layer --> Core Engine
    Data Sources --> Core Engine
    Core Engine --> Outputs
```

## 📁 Package Structure

```
packages/agent-generator/
├── src/
│   ├── promethean/
│   │   └── agent_generator/
│   │       ├── platform/
│   │       │   ├── detection.clj          # Platform detection logic
│   │       │   ├── features.clj           # Feature registry
│   │       │   ├── adapters/
│   │       │   │   ├── bb.clj             # Babashka adapter
│   │       │   │   ├── nbb.clj            # Node.js Babashka adapter
│   │       │   │   ├── jvm.clj            # JVM Clojure adapter
│   │       │   │   └── cljs.clj           # ClojureScript adapter
│   │       │   └── common.clj             # Shared platform utilities
│   │       ├── config/
│   │       │   ├── core.clj               # Configuration management
│   │       │   ├── environment.clj        # Environment variable parsing
│   │       │   └── validation.clj         # Configuration validation
│   │       ├── collectors/
│   │       │   ├── protocol.clj           # Collector interfaces
│   │       │   ├── kanban.clj             # Kanban board data collector
│   │       │   ├── file_index.clj         # File index analyzer
│   │       │   ├── environment.clj        # Environment data collector
│   │       │   └── tools.clj              # Tool capability scanner
│   │       ├── templates/
│   │       │   ├── engine.clj             # Template processing engine
│   │       │   ├── markdown.clj           # Markdown-specific processors
│   │       │   ├── conditionals.clj       # Conditional rendering logic
│   │       │   └── validation.clj         # Template validation
│   │       ├── generator/
│   │       │   ├── core.clj               # Main generation orchestration
│   │       │   ├── context.clj            # Generation context management
│   │       │   ├── outputs.clj            # Output formatting and writing
│   │       │   └── pipeline.clj           # Generation pipeline orchestration
│   │       ├── cli/
│   │       │   ├── core.clj               # CLI interface
│   │       │   ├── commands.clj           # Command implementations
│   │       │   └── options.clj            # Command-line option parsing
│   │       └── api.clj                    # Public API surface
│   └── test/                              # Cross-platform test suite
├── resources/
│   ├── templates/                         # Default template files
│   │   ├── agents.md.template
│   │   ├── claude.md.template
│   │   ├── crush.md.template
│   │   └── custom/
│   └── config/                           # Default configuration files
├── bb.edn                               # Babashka build configuration
├── deps.edn                             # JVM Clojure dependencies
├── shadow-cljs.edn                      # ClojureScript build configuration
├── package.json                         # Node.js dependencies (for nbb)
└── README.md
```

## 🔧 Platform Detection & Feature System

### Platform Detection Logic

```clojure
(ns promethean.agent-generator.platform.detection)

(defn detect-platform []
  "Detect current Clojure platform runtime"
  (cond
    #?(:bb true :default false) :babashka
    #?(:cljs true :default false) :clojurescript
    (contains? (System/getenv) "BABASHKA_CLASSPATH") :babashka
    (contains? (System/getenv) "NODE_ENV") :node-babashka
    :else :jvm))

(defn platform-capabilities [platform]
  "Return map of available capabilities per platform"
  (case platform
    :babashka {:fs true :http true :json true :yaml true :process true}
    :node-babashka {:fs true :http true :json true :yaml true :nodejs true}
    :jvm {:fs true :http true :json true :yaml true :process true :database true}
    :clojurescript {:fs false :http true :json true :yaml true :browser true}))
```

### Feature Registry

```clojure
(ns promethean.agent-generator.platform.features)

(def ^:dynamic *platform* (detect-platform))

(defn feature-available? [feature]
  "Check if feature is available on current platform"
  (get (platform-capabilities *platform*) feature false))

(defmacro when-feature [feature & body]
  "Execute body only if feature is available"
  `(when (feature-available? ~feature)
     ~@body))

(defn platform-implementation [feature-symbol]
  "Get platform-specific implementation for feature"
  (case *platform*
    :babashka (resolve (symbol (str "promethean.agent-generator.platform.adapters.bb/" feature-symbol)))
    :node-babashka (resolve (symbol (str "promethean.agent-generator.platform.adapters.nbb/" feature-symbol)))
    :jvm (resolve (symbol (str "promethean.agent-generator.platform.adapters.jvm/" feature-symbol)))
    :clojurescript (resolve (symbol (str "promethean.agent-generator.platform.adapters.cljs/" feature-symbol)))))
```

## 🔄 Data Collection Architecture

### Collector Protocol

```clojure
(ns promethean.agent-generator.collectors.protocol)

(defprotocol Collector
  "Protocol for data collection from various sources"
  (collect! [this config] "Collect data from source")
  (available? [this] "Check if collector is available")
  (validate [this data] "Validate collected data"))
```

### Kanban Board Collector

```clojure
(ns promethean.agent-generator.collectors.kanban
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.platform.features :as features]))

(defrecord KanbanCollector [config]
  protocol/Collector
  (collect! [this config]
    (features/when-feature :http
      (let [kanban-api (or (:kanban-api config) "http://localhost:3000/api/kanban")
            response (platform-implementation :http-get kanban-api)]
        (when (:success response)
          (parse-kanban-data (:body response))))))

  (available? [this]
    (and (feature-available? :http)
         (or (:kanban-api config) 
             (fs/exists? "docs/agile/boards/generated.md"))))

  (validate [this data]
    (and (map? data)
         (contains? data :tasks)
         (contains? data :columns))))
```

### File Index Collector

```clojure
(ns promethean.agent-generator.collectors.file-index)

(defrecord FileIndexCollector [config]
  protocol/Collector
  (collect! [this config]
    (features/when-feature :fs
      (let [root-dir (or (:project-root config) ".")
            file-patterns (or (:file-patterns config) ["**/*.clj" "**/*.ts" "**/*.md"])]
        (scan-project-structure root-dir file-patterns))))

  (available? [this]
    (feature-available? :fs))

  (validate [this data]
    (and (map? data)
         (contains? data :directories)
         (contains? data :files)
         (contains? data :packages))))
```

## 📝 Template Engine Architecture

### Template Processing Pipeline

```clojure
(ns promethean.agent-generator.templates.engine)

(defn process-template [template context]
  "Process template with given context"
  (-> template
      (parse-template)
      (resolve-variables context)
      (process-conditionals context)
      (execute-loops context)
      (apply-filters context)
      (generate-markdown)))

(defn parse-template [template-content]
  "Parse template into AST"
  (let [tokens (tokenize template-content)]
    (build-ast tokens)))

(defn resolve-variables [ast context]
  "Resolve template variables from context"
  (postwalk ast
    (fn [node]
      (if (variable-node? node)
        (get-in context (variable-path node) (variable-default node))
        node))))

(defn process-conditionals [ast context]
  "Process conditional template blocks"
  (postwalk ast
    (fn [node]
      (if (conditional-node? node)
        (if (evaluate-condition (condition node) context)
          (then-branch node)
          (else-branch node))
        node))))
```

### Template Syntax Specification

```clojure
;; Template Variable Syntax
{{variable.path}}                    ; Simple variable
{{variable.path | filter}}           ; Variable with filter
{{variable.path | filter1 | filter2}} ; Chained filters

;; Conditional Syntax
{{#if condition}}                    ; If block
  Content when condition is true
{{else}}                             ; Else block (optional)
  Content when condition is false
{{/if}}

{{#unless condition}}                ; Unless block (negated if)
  Content when condition is false
{{/unless}}

;; Loop Syntax
{{#each collection}}                 ; Loop over collection
  {{this}}                           ; Current item
  {{@index}}                         ; Zero-based index
  {{@key}}                          ; Key (for maps)
{{/each}}

;; Platform-Specific Content
{{#platform bb}}                    ; Platform-specific block
  Babashka-specific content
{{/platform}}

{{#platform jvm}}                    ; Platform-specific block
  JVM-specific content
{{/platform}}
```

## 🔗 Integration Architecture

### Kanban System Integration

```clojure
(ns promethean.agent-generator.collectors.kanban-integration
  (:require [promethean.agent-generator.platform.features :as features]))

(defn collect-kanban-data [config]
  "Collect current kanban board state"
  (features/when-feature :fs
    (let [board-file (or (:kanban-board-file config) "docs/agile/boards/generated.md")]
      (when (fs/exists? board-file)
        (parse-kanban-board board-file)))))

(defn extract-task-statistics [kanban-data]
  "Extract task statistics from kanban data"
  {:total-tasks (count (:tasks kanban-data))
   :by-status (group-by :status (:tasks kanban-data))
   :by-priority (group-by :priority (:tasks kanban-data))
   :wip-limits (:wip-limits kanban-data)})

(defn get-active-tasks [kanban-data]
  "Get currently active tasks"
  (filter #(contains? #{"todo" "in_progress" "testing" "review"} (:status %))
          (:tasks kanban-data)))
```

### File Index Integration

```clojure
(ns promethean.agent-generator.collectors.file-index-integration)

(defn analyze-project-structure [root-dir]
  "Analyze project structure and capabilities"
  (let [dirs (scan-directories root-dir)
        files (scan-files root-dir)
        packages (detect-packages dirs)]
    {:directories dirs
     :files files
     :packages packages
     :tools (detect-tools files)
     :capabilities (infer-capabilities packages)}))

(defn detect-tools [files]
  "Detect available development tools"
  (->> files
       (map #(str/lower-case (:name %)))
       (filter tool-file-patterns)
       (map extract-tool-info)
       (group-by :category)))

(defn infer-capabilities [packages]
  "Infer project capabilities from package dependencies"
  (->> packages
       (mapcat :dependencies)
       (map infer-capability)
       (distinct)
       (group-by :category)))
```

## 🎯 Generator Core Architecture

### Generation Pipeline

```clojure
(ns promethean.agent-generator.generator.core
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.templates.engine :as templates]))

(defn generate-instructions [config]
  "Main generation pipeline"
  (let [context (build-context config)
        templates (load-templates config)
        outputs (generate-all-outputs templates context)]
    (write-outputs outputs config)))

(defn build-context [config]
  "Build generation context from all data sources"
  (let [collectors (initialize-collectors config)
        collected-data (collect-all-data collectors config)]
    (merge
      {:platform (detect-platform)
       :timestamp (inst/inst)
       :config config}
      collected-data)))

(defn collect-all-data [collectors config]
  "Collect data from all available sources"
  (reduce
    (fn [acc collector]
      (if (protocol/available? collector)
        (let [data (protocol/collect! collector config)]
          (if (protocol/validate collector data)
            (merge acc data)
            acc))
        acc))
    {}
    collectors))

(defn generate-all-outputs [templates context]
  "Generate all output files from templates"
  (reduce-kv
    (fn [acc output-name template]
      (assoc acc output-name (templates/process-template template context)))
    {}
    templates))
```

### Context Management

```clojure
(ns promethean.agent-generator.generator.context)

(defn build-generation-context [config collected-data]
  "Build comprehensive generation context"
  {:environment (extract-environment-context config)
   :kanban (extract-kanban-context collected-data)
   :project (extract-project-context collected-data)
   :agent (extract-agent-context config)
   :platform (detect-platform)
   :timestamp (inst/inst)
   :generation-id (random-uuid)})

(defn extract-environment-context [config]
  "Extract environment variable context"
  (let [env-vars (or (:environment-variables config) 
                     ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "OLLAMA_URL"])]
    (reduce
      (fn [acc var-name]
        (if-let [value (System/getenv var-name)]
          (assoc acc (keyword (str/lower-case var-name)) value)
          acc))
      {}
      env-vars)))

(defn extract-agent-context [config]
  "Extract agent-specific context"
  {:name (or (:agent-name config) "promethean-agent")
   :type (or (:agent-type config) "general")
   :capabilities (or (:capabilities config) [])
   :restrictions (or (:restrictions config) [])})
```

## 🛠️ CLI Interface Architecture

### Command Structure

```clojure
(ns promethean.agent-generator.cli.core)

(def commands
  {"generate" {:doc "Generate agent instruction files"
               :fn generate-command
               :options [[:template-dir "-t" "--template-dir DIR" "Template directory"]
                        [:output-dir "-o" "--output-dir DIR" "Output directory"]
                        [:config "-c" "--config FILE" "Configuration file"]
                        [:agent "-a" "--agent NAME" "Specific agent to generate"]
                        [:platform "-p" "--platform PLATFORM" "Target platform"]
                        [:force "-f" "--force" "Force overwrite existing files"]
                        [:verbose "-v" "--verbose" "Verbose output"]]}
   
   "validate" {:doc "Validate templates and configuration"
               :fn validate-command
               :options [[:template-dir "-t" "--template-dir DIR" "Template directory"]
                        [:config "-c" "--config FILE" "Configuration file"]]}
   
   "list-templates" {:doc "List available templates"
                     :fn list-templates-command
                     :options [[:template-dir "-t" "--template-dir DIR" "Template directory"]]}
   
   "version" {:doc "Show version information"
              :fn version-command}})
```

### Cross-Platform Build Configuration

#### Babashka Configuration (bb.edn)

```clojure
{:paths ["src" "resources"]
 :tasks {agent-generator:generate {:doc "Generate agent instructions"
                                   :requires ([promethean.agent-generator.cli.core])
                                   :task (promethean.agent-generator.cli.core/main "generate")}
        agent-generator:validate {:doc "Validate templates"
                                  :requires ([promethean.agent-generator.cli.core])
                                  :task (promethean.agent-generator.cli.core/main "validate")}
        agent-generator:build {:doc "Build for all platforms"
                               :requires ([promethean.agent-generator.build])
                               :task (promethean.agent-generator.build/build-all)}}}
```

#### JVM Configuration (deps.edn)

```clojure
{:paths ["src" "resources" "target/classes"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}
        org.clojure/tools.cli {:mvn/version "1.0.219"}
        cheshire/cheshire {:mvn/version "5.13.0"}
        babashka/fs {:mvn/version "0.4.19"}
        babashka/process {:mvn/version "0.5.21"}}
 :aliases {:build {:extra-deps {io.github.clojure/tools.build {:git/tag "v0.9.6" :git/sha "8e78bcc"}}
                   :ns-default build}
           :test {:extra-paths ["test"]
                  :extra-deps {io.github.cognitect-labs/test-runner
                               {:git/url "https://github.com/cognitect-labs/test-runner"
                                :git/tag "v0.5.1"
                                :git/sha "dfb30dd"}}
                  :main-opts ["-m" "cognitect.test-runner"]}}}
```

#### ClojureScript Configuration (shadow-cljs.edn)

```clojure
{:source-paths ["src" "resources"]
 :dependencies [[binaryage/devtools "1.0.7"]
                [nrepl "1.3.1"]]
 :builds {:agent-generator {:target :node-script
                            :main promethean.agent-generator.cli.core/-main
                            :output-to "dist/agent_generator.cjs"
                            :compiler-options {:infer-externs :auto
                                               :source-map true}}}}
```

## 🧪 Testing Strategy

### Cross-Platform Test Matrix

```clojure
;; test/promethean/agent_generator/platform_test.clj
(ns promethean.agent-generator.platform-test
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.platform.detection :as detection]))

(deftest platform-detection-test
  (testing "Platform detection works correctly"
    (let [platform (detection/detect-platform)]
      (is (contains? #{:babashka :node-babashka :jvm :clojurescript} platform)))))

(deftest feature-availability-test
  (testing "Feature availability detection"
    (let [capabilities (detection/platform-capabilities (detection/detect-platform))]
      (is (map? capabilities))
      (is (every? boolean? (vals capabilities))))))
```

### Integration Testing

```clojure
;; test/promethean/agent_generator/integration_test.clj
(ns promethean.agent-generator.integration-test
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.generator.core :as generator]))

(deftest full-generation-test
  (testing "Complete generation pipeline"
    (let [config {:template-dir "test/resources/templates"
                  :output-dir "test/output"
                  :agent-name "test-agent"}
          result (generator/generate-instructions config)]
      (is (:success result))
      (is (fs/exists? "test/output/AGENTS.md"))
      (is (fs/exists? "test/output/CLAUDE.md")))))
```

## 📦 Deployment & Distribution

### Multi-Platform Build Pipeline

```clojure
;; src/promethean/agent_generator/build.clj
(ns promethean.agent-generator.build)

(defn build-all []
  "Build for all target platforms"
  (doseq [platform [:babashka :jvm :node-babashka :clojurescript]]
    (build-platform platform)))

(defn build-platform [platform]
  "Build for specific platform"
  (case platform
    :babashka (build-babashka)
    :jvm (build-jvm)
    :node-babashka (build-node-babashka)
    :clojurescript (build-clojurescript)))

(defn build-babashka []
  "Build Babashka binary"
  (println "Building Babashka binary...")
  (shell "bb" "compile" "src/promethean/agent_generator/cli/core.clj"))

(defn build-jvm []
  "Build JVM JAR"
  (println "Building JVM JAR...")
  (shell "clojure" "-T:build" "jar"))
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/agent-generator.yml
name: Agent Generator CI/CD

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        platform: [babashka, jvm, node-babashka, clojurescript]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - setup: ${{ matrix.platform }}
      - run: clojure -M:test
      - run: bb agent-generator:validate

  build:
    needs: test
    strategy:
      matrix:
        platform: [babashka, jvm, node-babashka, clojurescript]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - setup: ${{ matrix.platform }}
      - run: bb agent-generator:build
      - upload: artifacts
```

## 📊 Performance & Monitoring

### Performance Metrics

```clojure
(ns promethean.agent-generator.monitoring)

(defn track-generation-metrics [config result]
  "Track generation performance metrics"
  {:generation-time (:duration result)
   :template-count (count (:templates config))
   :output-size (calculate-output-size result)
   :platform (detect-platform)
   :memory-usage (get-memory-usage)
   :success (:success result)})

(defn generate-performance-report [metrics]
  "Generate performance report"
  (str "Generation Performance Report\n"
       "============================\n"
       "Platform: " (:platform metrics) "\n"
       "Generation Time: " (:generation-time metrics) "ms\n"
       "Templates Processed: " (:template-count metrics) "\n"
       "Output Size: " (:output-size metrics) " bytes\n"
       "Memory Usage: " (:memory-usage metrics) " MB\n"
       "Success: " (:success metrics) "\n"))
```

## 🎯 Success Metrics & KPIs

### Technical Metrics
- **Cross-Platform Compatibility**: 100% success rate across all target platforms
- **Generation Performance**: <5 seconds for typical project configurations
- **Template Processing**: <100ms per template on average
- **Memory Usage**: <100MB peak memory consumption

### Quality Metrics
- **Test Coverage**: >90% across all components
- **Template Validation**: 100% template syntax validation
- **Output Quality**: Generated files pass all existing validation checks
- **Error Handling**: Graceful degradation with meaningful error messages

### Adoption Metrics
- **Integration Success**: Seamless integration with existing build systems
- **Developer Experience**: Reduced manual documentation maintenance by >80%
- **Agent Onboarding**: 50% improvement in agent setup time
- **Maintenance Overhead**: <2 hours per week for template maintenance

---

## 📝 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up cross-platform package structure
- [ ] Implement platform detection and feature system
- [ ] Create basic configuration management
- [ ] Establish testing framework

### Phase 2: Data Collection (Weeks 3-4)
- [ ] Implement collector protocols and basic collectors
- [ ] Integrate with kanban system
- [ ] Build file index integration
- [ ] Add environment variable collection

### Phase 3: Template Engine (Weeks 5-6)
- [ ] Design and implement template syntax
- [ ] Build template processing pipeline
- [ ] Add conditional rendering and loops
- [ ] Create template validation system

### Phase 4: Generator Core (Weeks 7-8)
- [ ] Implement generation orchestration
- [ ] Build context management system
- [ ] Add output formatting and writing
- [ ] Create CLI interface

### Phase 5: Templates & Integration (Weeks 9-10)
- [ ] Create default template set
- [ ] Integrate with existing build systems
- [ ] Add comprehensive testing
- [ ] Complete documentation

This architecture provides a robust, scalable foundation for the cross-platform agent instruction generator that will serve the Promethean Framework's needs across all Clojure platforms while maintaining high code quality and developer experience standards.