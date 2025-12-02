# Pantheon Lisp DSL Specification

## Overview

A hyper-minimal Lisp REPL DSL for constructing AI agent systems with a Reagent-like declarative approach. The DSL allows dynamic description of agent systems, tool access, prompting, and resources through simple Lisp expressions.

Related: [[docs/dev/packages/pantheon/README]] • [[multi-runtime-architecture]] • [[session-management]]

## Core Syntax

### Basic Agent Interaction

```lisp
;; Direct agent query
(ask "What is the meaning of life?" :agent philosopher)

;; Query with specific model
(ask "Explain quantum computing" :agent scientist :model "qwen2.5-coder-7b")

;; Query with context
(ask "Summarize this document" :agent summarizer
     :context #{"docs/report.pdf" "docs/notes.md"})
```

### Agent System Definition

```lisp
;; Define a simple agent
(defagent doc-reviewer
  :model "qwen2.5-coder-7b"
  :tools ["file-reader" "markdown-linter" "spell-checker"]
  :capabilities ["review" "validate" "suggest"]
  :prompt "You are a documentation reviewer. Focus on clarity, accuracy, and style.")

;; Define a specialized agent with custom behavior
(defagent code-auditor
  :model "codellama-7b"
  :runtime :local
  :tools ["eslint" "semgrep" "coverage-tool"]
  :capabilities ["security-scan" "performance-review" "code-quality"]
  :system-prompt "You are a security-focused code auditor. Identify vulnerabilities and suggest improvements."
  :constraints {:max-tokens 2048 :temperature 0.1})
```

### Reagent-like Component System

```lisp
;; Agent component (similar to Reagent components)
(defcomponent agent-ui
  [agent-id message]
  [:div.agent-interface
   [:h3 (str "Agent: " agent-id)]
   [:p.message message]
   [:button {:on-click #(ask message :agent agent-id)} "Send"]])

;; Workflow component
(defcomponent workflow-runner
  [workflow-name agents]
  (let [state (r/atom {:status :idle :results nil})]
    (fn []
      [:div.workflow
       [:h2 workflow-name]
       [:p (str "Status: " (:status @state))]
       [:button
        {:on-click #(run-workflow workflow-name agents state)}
        "Run Workflow"]
       (when (:results @state)
         [:div.results
          (for [result (:results @state)]
            ^{:key (:id result)}
            [:div.result (:output result)])])])))
```

### Resource Management

```lisp
;; Define resources
(defresource model-pool
  :models ["qwen2.5-coder-7b" "llama3.1-8b" "codellama-7b"]
  :max-memory "8GB"
  :runtime :local)

(defresource file-system
  :paths ["./docs" "./data" "./models"]
  :permissions [:read :write])

;; Use resources
(with-resources [model-pool file-system]
  (ask "Process these files" :agent file-processor))
```

### Session Management

```lisp
;; Create and manage sessions
(session-create "Code Review Session"
               :runtime :opencode
               :primary-agent "code-reviewer"
               :tags ["coding" "review"])

;; List and switch sessions
(session-list :status :active)
(session-switch "session_123")

;; Send messages in sessions
(ask "Review this function" :session "session_123")
(ask "Quick question" :no-session true)

;; Session operations
(session-pause "session_123")
(session-resume "session_123")
(session-archive "session_456")

;; Session search and export
(session-search "security" :tags ["coding"])
(session-export "session_123" :format :markdown)
(session-share "session_123" :expires-in "7d")
```

### Tool Definition

```lisp
;; Define custom tools
(deftool file-renamer
  [old-path new-path]
  {:description "Rename a file"
   :parameters {:old-path {:type "string" :required true}
                :new-path {:type "string" :required true}}
   :execute (fn [params]
              (fs/rename (:old-path params) (:new-path params)))})

(deftool git-status
  []
  {:description "Get git repository status"
   :execute (fn [] (git/status))})
```

## Complete DSL Reference

### Agent Operations

```lisp
;; Create agent
(create-agent agent-name config)

;; List agents
(list-agents)

;; Get agent info
(agent-info agent-name)

;; Tick agent (execute one cycle)
(tick-agent agent-name input)

;; Stop agent
(stop-agent agent-name)

;; Runtime operations
(list-runtimes)
(runtime-info runtime-name)
(migrate-agent agent-name :from old-runtime :to new-runtime)
(compare-runtimes runtime-1 runtime-2)
```

### System Configuration

```lisp
;; Global configuration
(config :set :model-path "./models")
(config :set :max-concurrent 5)
(config :set :night-mode true)

;; Environment variables
(env :set "OPENAI_API_KEY" "sk-...")
(env :get "DATABASE_URL")
```

### Workflow Definition

```lisp
;; Define workflow
(defworkflow doc-processing
  :agents ["doc-renamer" "frontmatter-normalizer" "content-validator"]
  :schedule "0 2 * * *"
  :steps [
    (rename-docs)
    (normalize-frontmatter)
    (validate-content)])

;; Run workflow
(run-workflow doc-processing)

;; Schedule workflow
(schedule-workflow doc-processing "0 2 * * *")
```

### Context Management

```lisp
;; Add context sources
(add-context :type "file" :path "./docs")
(add-context :type "database" :url "mongodb://localhost/pantheon")
(add-context :type "api" :endpoint "https://api.example.com")

;; Compile context
(compile-context :sources ["file" "database"])

;; Search context
(search-context "quantum computing" :sources ["file"])
```

### Message Protocol

```lisp
;; Send message
(send-message :to agent-name :content "Hello" :type "query")

;; Broadcast to all agents
(broadcast :content "System update" :type "notification")

;; Subscribe to messages
(subscribe :agent agent-name :topics ["updates" "errors"])
```

## Implementation Architecture

### Core Runtime

```clojure
(ns pantheon.dsl.core
  (:require [pantheon.dsl.runtime :as runtime]
            [pantheon.dsl.agents :as agents]
            [pantheon.dsl.context :as context]))

;; REPL entry point
(defn repl []
  (println "Pantheon Lisp DSL v0.1.0")
  (println "Type (help) for available commands")
  (loop []
    (print "pantheon> ")
    (flush)
    (let [input (read-line)]
      (when (not= input "exit")
        (try
          (let [result (eval-form input)]
            (println "=> " result))
          (catch Exception e
            (println "Error: " (.getMessage e))))
        (recur)))))

;; Form evaluator
(defn eval-form [form]
  (let [ast (parse-form form)]
    (runtime/execute ast)))
```

### Agent System Integration

```clojure
(ns pantheon.dsl.agents
  (:require [pantheon.orchestrator :as orchestrator]))

;; Agent registry
(def ^:private agents (atom {}))

(defn defagent [name config]
  (let [agent (orchestrator/create-agent config)]
    (swap! agents assoc name agent)
    agent))

(defn get-agent [name]
  (@agents name))

(defn ask [message & {:keys [agent model context]}]
  (let [agent-obj (or (get-agent agent)
                      (orchestrator/default-agent))
        config (merge {:message message}
                     (when model {:model model})
                     (when context {:context context}))]
    (orchestrator/execute-agent agent-obj config)))
```

### Context Engine Integration

```clojure
(ns pantheon.dsl.context
  (:require [pantheon.context :as ctx]))

(defn add-context [config]
  (ctx/register-source config))

(defn compile-context [& {:keys [sources]}]
  (ctx/compile sources))

(defn search-context [query & {:keys [sources]}]
  (ctx/search query sources))
```

## Usage Examples

### Simple Q&A

```lisp
pantheon> (ask "What is React?")
=> React is a JavaScript library for building user interfaces...

pantheon> (ask "Explain monads" :agent haskell-expert)
=> In functional programming, a monad is a design pattern...
```

### Document Processing

```lisp
;; Define document processor
(defagent doc-processor
  :model "qwen2.5-coder-7b"
  :tools ["file-reader" "markdown-parser" "text-summarizer"])

;; Process document
(ask "Summarize this technical document"
     :agent doc-processor
     :context #{"docs/technical-guide.md"})
```

### Code Review Workflow

```lisp
;; Define code review agents
(defagent syntax-checker
  :model "codellama-7b"
  :tools ["eslint" "babel-parser"]
  :capabilities ["syntax-validation"])

(defagent security-scanner
  :model "codellama-7b"
  :tools ["semgrep" "bandit"]
  :capabilities ["security-analysis"])

;; Define workflow
(defworkflow code-review
  :agents [syntax-checker security-scanner]
  :steps [
    (check-syntax)
    (scan-security)
    (generate-report)])

;; Run on file
(run-workflow code-review :input "./src/app.js")
```

### Multi-Agent Coordination

```lisp
;; Agent communication
(defagent coordinator
  :model "llama3.1-8b"
  :capabilities ["coordination" "task-distribution"])

(defagent worker-1
  :model "qwen2.5-coder-7b"
  :capabilities ["data-processing"])

(defagent worker-2
  :model "qwen2.5-coder-7b"
  :capabilities ["analysis"])

;; Coordinate task
(ask "Process this dataset and generate insights"
     :agent coordinator
     :delegates [worker-1 worker-2])
```

## Integration with Pantheon

### Multi-Runtime Backend Integration

```typescript
// Lisp DSL Runtime with Multi-Runtime Support
class LispDSLRuntime {
  private agents = new Map<string, any>();
  private context = new ContextEngine();
  private runtimeManager: RuntimeManager;

  constructor() {
    this.runtimeManager = new RuntimeManager();
  }

  async evaluate(form: string): Promise<any> {
    const ast = this.parse(form);
    return await this.execute(ast);
  }

  private async execute(ast: any): Promise<any> {
    switch (ast.type) {
      case 'ask':
        return await this.handleAsk(ast);
      case 'defagent':
        return await this.handleDefAgent(ast);
      case 'defworkflow':
        return await this.handleDefWorkflow(ast);
      case 'list-runtimes':
        return await this.handleListRuntimes(ast);
      case 'migrate-agent':
        return await this.handleMigrateAgent(ast);
      default:
        throw new Error(`Unknown form type: ${ast.type}`);
    }
  }

  private async handleAsk(ast: any): Promise<string> {
    const { message, agent, runtime, fallback, model, context } = ast.params;

    // Get or create agent with runtime preference
    let agentObj = this.agents.get(agent);
    if (!agentObj) {
      const runtimeName = runtime || this.runtimeManager.getBestRuntime({
        capabilities: ['general-assistance'],
        preferLocal: true,
      });

      agentObj = await this.runtimeManager.createAgent({
        name: agent,
        runtime: runtimeName,
        model,
      });
      this.agents.set(agent, agentObj);
    }

    try {
      return await this.runtimeManager.executeAgent(agentObj, {
        message,
        model,
        context,
      });
    } catch (error) {
      if (fallback) {
        console.log(`Primary runtime failed, trying fallback: ${error.message}`);
        const fallbackAgent = await this.runtimeManager.createAgent({
          name: `${agent}-fallback`,
          runtime: fallback,
          model,
        });
        return await this.runtimeManager.executeAgent(fallbackAgent, {
          message,
          model,
          context,
        });
      }
      throw error;
    }
  }

  private async handleDefAgent(ast: any): Promise<any> {
    const { name, runtime, model, tools, capabilities } = ast.params;

    // Auto-select runtime if not specified
    const runtimeName = runtime === :auto
      ? this.runtimeManager.getBestRuntime({ capabilities })
      : runtime;

    const agent = await this.runtimeManager.createAgent({
      name,
      runtime: runtimeName,
      model,
      tools,
      capabilities,
    });

    this.agents.set(name, agent);
    return agent;
  }

  private async handleListRuntimes(ast: any): Promise<string[]> {
    return this.runtimeManager.list().map(r => r.name);
  }

  private async handleMigrateAgent(ast: any): Promise<any> {
    const { agent, from, to } = ast.params;
    const agentObj = this.agents.get(agent);

    if (!agentObj) {
      throw new Error(`Agent not found: ${agent}`);
    }

    return await this.runtimeManager.migrateAgent(agentObj, from, to);
  }
}
```

### REPL Server

```typescript
// REPL Server
class REPLServer {
  private runtime = new LispDSLRuntime();

  async start(port: number = 3001): Promise<void> {
    const server = createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/eval') {
        const body = await getRequestBody(req);
        try {
          const result = await this.runtime.evaluate(body.form);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, result }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      }
    });

    server.listen(port, () => {
      console.log(`Pantheon Lisp DSL REPL listening on port ${port}`);
    });
  }
}
```

## Development Roadmap

### Phase 1: Core DSL (v0.1)

- [ ] Basic Lisp parser
- [ ] Agent operations (ask, defagent)
- [ ] Simple REPL
- [ ] Pantheon integration

### Phase 2: Component System (v0.2)

- [ ] Reagent-like components
- [ ] State management (ratoms)
- [ ] Event system
- [ ] Resource management

### Phase 3: Workflow Engine (v0.3)

- [ ] Workflow definitions
- [ ] Scheduling system
- [ ] Multi-agent coordination
- [ ] Context compilation

### Phase 4: Advanced Features (v0.4)

- [ ] Macro system
- [ ] Custom tool definitions
- [ ] Performance optimization
- [ ] Security features
- [ ] Session management
- [ ] Multi-agent coordination
- [ ] Context persistence

## Getting Started

### Installation

```bash
# Add to existing Pantheon project
pnpm add @promethean-os/pantheon-dsl

# Or standalone
pnpm install pantheon-dsl
```

### Basic Usage

```lisp
pantheon> (defagent helper
           :runtime :opencode
           :model "qwen2.5-coder-7b"
           :capabilities ["general-assistance"])
=> #Agent{:name helper :runtime opencode :model qwen2.5-coder-7b}

pantheon> (ask "What is Pantheon?" :agent helper)
=> Pantheon is a comprehensive framework for building AI agents...

pantheon> (defagent cloud-helper
           :runtime :openai-agent
           :model "gpt-4o"
           :capabilities ["general-assistance"])
=> #Agent{:name cloud-helper :runtime openai-agent :model gpt-4o}

pantheon> (list-runtimes)
=> (:opencode :openai-agent :pantheon-native)

pantheon> (ask "Research latest AI trends" :agent cloud-helper)
=> Based on recent research, the latest AI trends include...

pantheon> (ask "Write Python code for data analysis" :agent helper :fallback cloud-helper)
=> Here's a Python script for data analysis...

pantheon> (defworkflow hybrid-review
           :agents [helper cloud-helper]
           :steps [
             (ask "Review code locally" :agent helper)
             (ask "Research best practices" :agent cloud-helper)])
=> #Workflow{:name hybrid-review :agents [helper cloud-helper]}

pantheon> (run-workflow hybrid-review :input "./src/analysis.js")
=> {:status completed :results [{:agent helper :output "Local code review complete..."} {:agent cloud-helper :output "Research on best practices..."}]}
```

### Example Session

```lisp
pantheon> (defagent helper
           :model "qwen2.5-coder-7b"
           :capabilities ["general-assistance"])
=> #Agent{:name helper :model qwen2.5-coder-7b}

pantheon> (ask "What is Pantheon?" :agent helper)
=> Pantheon is a comprehensive framework for building AI agents...

pantheon> (defworkflow quick-review
           :agents [helper]
           :steps [(ask "Review this code" :agent helper)])
=> #Workflow{:name quick-review :agents [helper]}

pantheon> (run-workflow quick-review :input "./src/example.js")
=> {:status completed :results [{:agent helper :output "Code review complete..."}]}
```

---

This specification provides a foundation for a hyper-minimal yet powerful Lisp DSL that integrates seamlessly with the Pantheon ecosystem while offering Reagent-like declarative patterns for building sophisticated AI agent systems.
