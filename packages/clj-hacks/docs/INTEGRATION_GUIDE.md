# MCP Bridge Integration Guide

This guide explains how to integrate the MCP Bridge package with other Promethean components and external systems.

## Table of Contents

1. [Promethean Ecosystem Integration](#promethean-ecosystem-integration)
2. [IDE Integration](#ide-integration)
3. [CI/CD Pipeline Integration](#cicd-pipeline-integration)
4. [External Tool Integration](#external-tool-integration)
5. [Custom Adapter Development](#custom-adapter-development)
6. [Monitoring and Observability](#monitoring-and-observability)

## Promethean Ecosystem Integration

### Kanban Integration

MCP Bridge integrates with the Promethean Kanban system for task tracking and workflow management.

#### Task-Based Configuration Management

```bash
# Find MCP-related tasks
pnpm kanban search "mcp configuration"

# Update task status
pnpm kanban update-status <task-uuid> in_progress

# Perform configuration changes
clojure -M:tasks sync-all --edn config/mcp.edn

# Mark task complete
pnpm kanban update-status <task-uuid> done
```

#### Workflow Integration

```clojure
;; Example: Automated task creation for configuration changes
(require '[promethean.kanban.api :as kanban])

(defn create-mcp-task [description]
  (kanban/create-task!
    {:title description
     :type :configuration
     :priority :medium
     :tags ["mcp" "configuration"]
     :workflow ["setup" "test" "deploy"]}))

;; Usage
(create-mcp-task "Add new GitHub MCP server")
```

### Logger Integration

MCP Bridge uses the Promethean logger for centralized logging.

#### Configuration Logging

```clojure
;; In your MCP configuration scripts
(require '@promethean-os/logger')

(def logger (logger/create :mcp-bridge))

(logger/info logger "Starting MCP synchronization")
(logger/debug logger "Configuration loaded" {:config-file "config/mcp.edn"})
(logger/warn logger "Server disabled" {:server-name :old-server})
(logger/error logger "Sync failed" {:target "vscode.json" :error ex})
```

#### Log Configuration

```clojure
;; config/logging.edn
{:mcp-bridge
 {:level :info
  :outputs [{:type :file :path "logs/mcp-bridge.log"}
            {:type :console :level :debug}]
  :format :json}
```

### Platform Core Integration

MCP Bridge leverages platform core services for system operations.

#### Service Registration

```clojure
(require '@promethean-os/platform-core')

(defn register-mcp-service []
  (platform-core/register-service!
    :mcp-bridge
    {:version "1.0.0"
     :dependencies [:logger :kanban]
     :start-fn start-mcp-service
     :stop-fn stop-mcp-service
     :health-fn mcp-health-check}))
```

#### Configuration Service

```clojure
;; Using platform configuration service
(require '@promethean-os/platform-core.config')

(defn load-mcp-config []
  (platform-core.config/load :mcp-bridge
    {:schema :mcp-bridge-config
     :default {:mcp-servers {} :outputs []}}))
```

## IDE Integration

### VSCode Extension Integration

#### Extension Setup

```typescript
// VSCode extension integration
import * as vscode from 'vscode';
import { execSync } from 'child_process';

export class MCPBridgeManager {
  private configPath: string;

  constructor() {
    this.configPath = vscode.workspace
      .getConfiguration('mcpBridge')
      .get('configPath', 'config/mcp.edn');
  }

  async syncConfiguration(): Promise<void> {
    try {
      execSync(`clojure -M:tasks sync-all --edn ${this.configPath}`, {
        cwd: vscode.workspace.rootPath,
      });

      vscode.window.showInformationMessage('MCP configuration synchronized successfully');
    } catch (error) {
      vscode.window.showErrorMessage(`MCP sync failed: ${error.message}`);
    }
  }

  async addServer(serverName: string, serverConfig: any): Promise<void> {
    // Update configuration through MCP Bridge CLI
    const command = `clojure -M:tasks -e "
            (require '[clojure.java.io :as io])
            (require '[clojure.edn :as edn])
            (require '[clj-hacks.mcp.ops :as ops])
            
            (let [config (edn/read-string (slurp \"${this.configPath}\"))
                  updated (assoc-in config [:mcp-servers (keyword \"${serverName}\")] 
                              ${JSON.stringify(serverConfig)})]
              (spit \"${this.configPath}\" (with-out-str (clojure.pprint/pprint updated)))
            (ops/push-all! updated \".\" (:outputs updated)))"`;

    execSync(command, { cwd: vscode.workspace.rootPath });
  }
}
```

#### VSCode Settings Integration

```json
// .vscode/settings.json
{
  "mcpBridge.configPath": "config/mcp.edn",
  "mcpBridge.autoSync": true,
  "mcpBridge.showNotifications": true,
  "mcpBridge.logLevel": "info"
}
```

### Emacs Integration

#### Package Configuration

```elisp
;; mcp-bridge.el - Emacs integration package
(require 'json)

(defvar mcp-bridge-config-file "config/mcp.edn"
  "Path to MCP Bridge configuration file.")

(defvar mcp-bridge-auto-sync t
  "Enable automatic synchronization.")

(defun mcp-bridge-sync ()
  "Synchronize MCP configuration using MCP Bridge."
  (interactive)
  (let ((default-directory (projectile-project-root)))
    (shell-command
     (concat "clojure -M:tasks sync-all --edn " mcp-bridge-config-file)
     "*MCP Bridge Output*")
    (when mcp-bridge-auto-sync
      (message "MCP configuration synchronized"))))

(defun mcp-bridge-add-server (name command &optional args)
  "Add a new MCP server to configuration."
  (interactive
   (list (read-string "Server name: ")
         (read-string "Command: ")
         (read-string "Arguments (comma-separated): ")))

  (let ((config (json-read-file mcp-bridge-config-file))
        (server-config `(:command ,command
                        :args [,(split-string args ",")])))
    (setq config (json-merge config
                          `(:mcp-servers ((,name . ,server-config)))))
    (json-write-file mcp-bridge-config-file config)
    (mcp-bridge-sync)))

;; Add to mode hooks
(add-hook 'after-save-hook
          (lambda ()
            (when (string-match-p "mcp.*\\.edn$" buffer-file-name)
              (mcp-bridge-sync))))
```

#### Key Bindings

```elisp
;; Key bindings for MCP operations
(define-key mcp-mode-map (kbd "C-c m s") 'mcp-bridge-sync)
(define-key mcp-mode-map (kbd "C-c m a") 'mcp-bridge-add-server)
(define-key mcp-mode-map (kbd "C-c m d") 'mcp-bridge-doctor)
```

### JetBrains IDEs Integration

#### Plugin Configuration

```kotlin
// IntelliJ plugin for MCP Bridge
class MCPBridgeService : ApplicationService {
    private val configPath = Path.of("config/mcp.edn")

    fun syncConfiguration() {
        val process = ProcessBuilder(
            "clojure", "-M:tasks", "sync-all",
            "--edn", configPath.toString()
        ).directory(Path.of(project.basePath)).start()

        process.inputStream.useLines { lines ->
            lines.forEach { line ->
                ApplicationManager.getApplication().messageBus
                    .syncPublisher(MCPBridgeTopics.CONFIG_CHANGED)
                    .onConfigChanged(line)
            }
        }
    }

    fun addServer(name: String, config: MCPServerConfig) {
        // Update configuration and sync
        updateConfiguration { current ->
            current.copy(
                mcpServers = current.mcpServers + (name to config)
            )
        }
        syncConfiguration()
    }
}
```

## CI/CD Pipeline Integration

### GitHub Actions

#### Workflow Configuration

```yaml
# .github/workflows/mcp-sync.yml
name: MCP Configuration Sync

on:
  push:
    paths:
      - 'config/mcp.edn'
  workflow_dispatch:

jobs:
  sync-mcp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Clojure
        uses: DeLaGuardo/setup-clojure@12.0
        with:
          cli: latest

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.m2/repository
            ~/.gitlibs
            ~/.clojure
          key: ${{ runner.os }}-clojure-${{ hashFiles('**/deps.edn') }}

      - name: Validate configuration
        run: |
          clojure -M:tasks doctor --edn config/mcp.edn

      - name: Sync configurations
        run: |
          clojure -M:tasks sync-all --edn config/mcp.edn

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --staged --quiet || git commit -m "Auto-sync MCP configurations"
          git push
```

### GitLab CI

#### Pipeline Configuration

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - sync

variables:
  CLOJURE_CLI_VERSION: 'latest'

mcp_validate:
  stage: validate
  image: clojure:lein
  script:
    - clojure -M:tasks doctor --edn config/mcp.edn
  artifacts:
    reports:
      junit: test-results.xml

mcp_sync:
  stage: sync
  image: clojure:lein
  script:
    - clojure -M:tasks sync-all --edn config/mcp.edn
  only:
    - main
    - develop
```

### Jenkins Pipeline

#### Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        CLOJURE_HOME = tool 'clojure'
        CONFIG_FILE = 'config/mcp.edn'
    }

    stages {
        stage('Validate') {
            steps {
                sh "${CLOJURE_HOME}/clojure -M:tasks doctor --edn ${CONFIG_FILE}"
            }
        }

        stage('Sync') {
            steps {
                sh "${CLOJURE_HOME}/clojure -M:tasks sync-all --edn ${CONFIG_FILE}"
            }
        }

        stage('Test') {
            steps {
                sh "${CLOJURE_HOME}/clojure -M:tasks test"
                publishTestResults testResultsPattern: 'test-results.xml'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'config/*.json, config/*.el, config/*.toml'
        }
        failure {
            mail to: 'team@company.com',
                 subject: 'MCP Sync Failed',
                 body: "MCP configuration sync failed. Check build logs."
        }
    }
}
```

## External Tool Integration

### Docker Integration

#### Dockerfile for MCP Bridge

```dockerfile
# Dockerfile
FROM clojure:latest

WORKDIR /app

# Copy configuration and source
COPY config/ ./config/
COPY packages/clj-hacks/ ./packages/clj-hacks/

# Install dependencies
RUN clojure -M:tasks prepare

# Create entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["sync"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-bridge:
    build: .
    volumes:
      - ./config:/app/config
      - ~/.config:/root/.config
    environment:
      - MCP_CONFIG=/app/config/mcp.edn
      - LOG_LEVEL=info
    command: ['sync-all']

  mcp-server:
    image: mcp/server:latest
    ports:
      - '3210:3210'
    environment:
      - TRANSPORT=http
      - PORT=3210
```

#### Entrypoint Script

```bash
#!/bin/bash
# docker-entrypoint.sh

set -e

CONFIG_FILE=${MCP_CONFIG:-"/app/config/mcp.edn"}
COMMAND=${1:-"sync-all"}

case $COMMAND in
  "sync-all")
    echo "Starting MCP synchronization..."
    clojure -M:tasks sync-all --edn $CONFIG_FILE
    ;;
  "doctor")
    echo "Running MCP health check..."
    clojure -M:tasks doctor --edn $CONFIG_FILE
    ;;
  "push")
    TARGET=$2
    echo "Pushing to $TARGET..."
    clojure -M:tasks push $TARGET --edn $CONFIG_FILE
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Available: sync-all, doctor, push <target>"
    exit 1
    ;;
esac
```

### Kubernetes Integration

#### ConfigMap for MCP Configuration

```yaml
# k8s/mcp-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-bridge-config
data:
  mcp.edn: |
    {:mcp-servers
     {:kubernetes-server
      {:command "npx"
       :args ["@company/mcp-k8s"]
       :env {"KUBERNETES_NAMESPACE" "${KUBERNETES_NAMESPACE}"}
       :description "Kubernetes MCP server"}}
     
     :outputs
     [{:schema :mcp.json :path "/etc/mcp/mcp.json"}
      {:schema :vscode.json :path "/etc/vscode/settings.json"}]}
```

#### Deployment Configuration

```yaml
# k8s/mcp-bridge-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-bridge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-bridge
  template:
    metadata:
      labels:
        app: mcp-bridge
    spec:
      containers:
        - name: mcp-bridge
          image: promethean/mcp-bridge:latest
          command: ['clojure', '-M:tasks', 'sync-all', '--edn', '/config/mcp.edn']
          volumeMounts:
            - name: config
              mountPath: /config
            - name: output
              mountPath: /etc/mcp
          env:
            - name: KUBERNETES_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
      volumes:
        - name: config
          configMap:
            name: mcp-bridge-config
        - name: output
          emptyDir: {}
```

### Monitoring Integration

#### Prometheus Metrics

```clojure
;; Add to your MCP Bridge integration
(require '[prometheus.client :as prom])

(def mcp-sync-counter
  (prom/counter
    :mcp-sync-operations-total
    {:help "Total MCP sync operations"}))

(def mcp-sync-duration
  (prom/histogram
    :mcp-sync-duration-seconds
    {:help "Duration of MCP sync operations"}))

(defn instrumented-sync [config-file]
  (prom/inc! mcp-sync-counter)
  (prom/with-timing mcp-sync-duration
    #(clojure -M:tasks sync-all --edn config-file)))
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "MCP Bridge Monitoring",
    "panels": [
      {
        "title": "Sync Operations",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(mcp_sync_operations_total[5m])",
            "legendFormat": "Sync Rate"
          }
        ]
      },
      {
        "title": "Sync Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, mcp_sync_duration_seconds)",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## Custom Adapter Development

### Creating a New Adapter

#### Step 1: Define Adapter Interface

```clojure
;; src/clj_hacks/mcp/adapter_custom_format.clj
(ns clj-hacks.mcp.adapter-custom-format
  "Adapter for Custom Format configuration files."
  (:require [clj-hacks.mcp.core :as core]
            [clojure.data.xml :as xml]))

(defn read-full [path]
  "Read Custom Format configuration and convert to canonical format."
  (let [content (slurp path)
        parsed (xml/parse content)
        servers (parse-servers parsed)
        http (parse-http-config parsed)]
    {:mcp {:mcp-servers servers :http http}
     :rest {:xml-content content}}))

(defn write-full [path {:keys [mcp rest]}]
  "Write canonical format to Custom Format file."
  (let [mcp' (core/expand-servers-home mcp)
        xml-content (generate-xml mcp' rest)]
    (core/ensure-parent! path)
    (spit path xml-content)))
```

#### Step 2: Register Adapter

```clojure
;; In clj-hacks.mcp.merge
(def adapters
  {;; Existing adapters...
   :custom.format {:read adapter-custom-format/read-full
                 :write adapter-custom-format/write-full
                 :rest-default {:xml-content ""}}})
```

#### Step 3: Add Tests

```clojure
;; test/clj_hacks/mcp/adapter_custom_format_test.clj
(ns clj-hacks.mcp.adapter-custom-format-test
  (:require [clj-hacks.mcp.adapter-custom-format :as adapter]
            [clojure.test :refer [deftest is]]
            [babashka.fs :as fs]))

(deftest custom-format-round-trip
  (let [tmp (fs/create-temp-file {:suffix ".xml"})
        path (str tmp)
        data {:mcp {:mcp-servers {:test {:command "echo"}}
                   :http {:transport :http}}
               :rest {:xml-content "<config/>"}}]
    (try
      (adapter/write-full path data)
      (let [result (adapter/read-full path)]
        (is (= (:mcp data) (:mcp result))))
      (finally
        (fs/delete tmp)))))
```

### Advanced Adapter Features

#### Validation Integration

```clojure
(defn validate-custom-format [config]
  "Custom format-specific validation."
  (let [servers (:mcp-servers config)]
    {:valid? (every? valid-server? (vals servers))
     :errors (mapcat server-errors (vals servers))
     :warnings (collect-warnings config)}))

(defn read-full [path]
  (let [content (slurp path)
        parsed (xml/parse content)
        config (parse-config parsed)]
    (when-not (:valid? (validate-custom-format config))
      (throw (ex-info "Invalid custom format configuration"
                      {:path path :config config})))
    config))
```

#### Transformation Pipeline

```clojure
(defn transform-config [config transformations]
  "Apply custom transformations to configuration."
  (reduce (fn [acc [transform-fn & args]]
            (apply transform-fn acc args))
          config
          transformations))

;; Usage
(defn read-full [path]
  (-> (slurp path)
      xml/parse
      parse-config
      (transform-config [normalize-server-names
                      validate-required-fields
                      apply-defaults])))
```

## Monitoring and Observability

### Health Check Integration

```clojure
(defn mcp-health-check []
  "Comprehensive health check for MCP Bridge."
  {:status (if (all-servers-healthy?) :healthy :unhealthy)
   :servers (mapv server-health-check (get-all-servers))
   :outputs (mapv output-health-check (get-all-outputs))
   :timestamp (Instant/now)
   :version (get-package-version)})
```

### Metrics Collection

```clojure
(defn collect-metrics []
  "Collect operational metrics."
  {:sync-count @sync-counter
   :error-count @error-counter
   :last-sync-time @last-sync-timestamp
   :active-servers (count active-servers)
   :configuration-size (config-size)})
```

### Alerting Integration

```clojure
(defn check-alerts [metrics]
  "Check for alert conditions."
  (cond
    (> (:error-count metrics) 10)
    {:level :critical
     :message "High error rate detected"
     :action "Investigate server configurations"}

    (> (- (Instant/now) (:last-sync-time metrics))
         (Duration/ofHours 24))
    {:level :warning
     :message "Configuration not synced recently"
     :action "Run sync operation"}

    :else
    {:level :info
     :message "All systems normal"}))
```

This integration guide provides comprehensive examples for integrating MCP Bridge with various systems and platforms, enabling seamless configuration management across your development ecosystem.
