# Pantheon Multi-Runtime Agent System

## Overview

Pantheon's multi-runtime architecture allows seamless targeting of different agent runtimes including OpenCode and `@openai/agent` SDK. This enables rapid prototyping and idea convergence across various agent ecosystems while maintaining a unified Lisp DSL interface.

Related: [[docs/dev/packages/pantheon/README]] • [[lisp-dsl-specification]] • [[session-management]]

## Runtime Architecture

### Core Runtime Abstraction

```typescript
// Runtime Interface
interface AgentRuntime {
  name: string;
  type: 'opencode' | 'openai-agent' | 'pantheon-native';

  // Agent lifecycle
  createAgent(config: AgentConfig): Promise<Agent>;
  executeAgent(agent: Agent, input: AgentInput): Promise<AgentOutput>;
  destroyAgent(agentId: string): Promise<void>;

  // Capabilities
  listModels(): Promise<ModelInfo[]>;
  listTools(): Promise<ToolInfo[]>;
  supportsCapability(capability: string): boolean;
}

// Runtime Registry
class RuntimeRegistry {
  private runtimes = new Map<string, AgentRuntime>();

  register(runtime: AgentRuntime): void {
    this.runtimes.set(runtime.name, runtime);
  }

  get(name: string): AgentRuntime | undefined {
    return this.runtimes.get(name);
  }

  list(): AgentRuntime[] {
    return Array.from(this.runtimes.values());
  }
}
```

### OpenCode Runtime Integration

```typescript
// OpenCode Runtime Adapter
class OpenCodeRuntime implements AgentRuntime {
  name = 'opencode';
  type = 'opencode' as const;

  constructor(private config: OpenCodeConfig) {}

  async createAgent(config: AgentConfig): Promise<Agent> {
    // Convert Pantheon config to OpenCode format
    const openCodeConfig = this.convertConfig(config);

    // Create OpenCode agent
    const agent = await opencode.createAgent(openCodeConfig);

    return new OpenCodeAgentAdapter(agent, config);
  }

  async executeAgent(agent: Agent, input: AgentInput): Promise<AgentOutput> {
    const openCodeAgent = agent as OpenCodeAgentAdapter;

    // Convert input to OpenCode format
    const openCodeInput = this.convertInput(input);

    // Execute via OpenCode
    const result = await openCodeAgent.execute(openCodeInput);

    // Convert result back to Pantheon format
    return this.convertOutput(result);
  }

  async listModels(): Promise<ModelInfo[]> {
    const models = await opencode.listModels();
    return models.map((model) => ({
      id: model.id,
      name: model.name,
      type: 'local',
      capabilities: model.capabilities,
    }));
  }

  supportsCapability(capability: string): boolean {
    const supportedCapabilities = [
      'text-generation',
      'function-calling',
      'tool-use',
      'local-execution',
    ];
    return supportedCapabilities.includes(capability);
  }

  private convertConfig(config: AgentConfig): OpenCodeAgentConfig {
    return {
      name: config.name,
      model: config.model,
      tools: config.tools?.map((tool) => this.convertTool(tool)),
      systemPrompt: config.systemPrompt,
      runtime: config.runtime || 'local',
    };
  }

  private convertTool(tool: ToolConfig): OpenCodeTool {
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      function: tool.execute,
    };
  }
}

// OpenCode Agent Adapter
class OpenCodeAgentAdapter implements Agent {
  constructor(
    private openCodeAgent: any,
    private config: AgentConfig,
  ) {}

  get id(): string {
    return this.openCodeAgent.id;
  }

  get name(): string {
    return this.config.name;
  }

  get runtime(): string {
    return 'opencode';
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const result = await this.openCodeAgent.execute({
      message: input.message,
      tools: input.tools,
      context: input.context,
    });

    return {
      success: true,
      message: result.response,
      data: result.data,
      toolCalls: result.toolCalls,
    };
  }
}
```

### OpenAI Agent Runtime Integration

```typescript
// OpenAI Agent Runtime Adapter
class OpenAIAgentRuntime implements AgentRuntime {
  name = 'openai-agent';
  type = 'openai-agent' as const;

  constructor(private config: OpenAIAgentConfig) {}

  async createAgent(config: AgentConfig): Promise<Agent> {
    // Convert to OpenAI Agent format
    const openAIConfig = this.convertConfig(config);

    // Create OpenAI Agent
    const agent = await OpenAI.createAgent(openAIConfig);

    return new OpenAIAgentAdapter(agent, config);
  }

  async executeAgent(agent: Agent, input: AgentInput): Promise<AgentOutput> {
    const openAIAgent = agent as OpenAIAgentAdapter;

    // Convert input to OpenAI Agent format
    const openAIInput = this.convertInput(input);

    // Execute via OpenAI Agent
    const result = await openAIAgent.execute(openAIInput);

    return this.convertOutput(result);
  }

  async listModels(): Promise<ModelInfo[]> {
    const models = await OpenAI.listModels();
    return models.map((model) => ({
      id: model.id,
      name: model.name,
      type: 'cloud',
      capabilities: model.capabilities,
    }));
  }

  supportsCapability(capability: string): boolean {
    const supportedCapabilities = [
      'text-generation',
      'function-calling',
      'structured-outputs',
      'parallel-tool-use',
      'multimodal',
    ];
    return supportedCapabilities.includes(capability);
  }

  private convertConfig(config: AgentConfig): OpenAIAgentConfig {
    return {
      name: config.name,
      model: config.model || 'gpt-4o',
      instructions: config.systemPrompt,
      tools: config.tools?.map((tool) => this.convertTool(tool)),
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    };
  }

  private convertTool(tool: ToolConfig): OpenAITool {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }
}

// OpenAI Agent Adapter
class OpenAIAgentAdapter implements Agent {
  constructor(
    private openAIAgent: any,
    private config: AgentConfig,
  ) {}

  get id(): string {
    return this.openAIAgent.id;
  }

  get name(): string {
    return this.config.name;
  }

  get runtime(): string {
    return 'openai-agent';
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const result = await this.openAIAgent.execute({
      input: input.message,
      tools: input.tools,
      context: input.context,
    });

    return {
      success: true,
      message: result.output,
      data: result.data,
      toolCalls: result.toolCalls,
    };
  }
}
```

## Enhanced Lisp DSL with Multi-Runtime Support

### Runtime Selection in DSL

```lisp
;; Specify runtime when defining agent
(defagent local-assistant
  :runtime :opencode
  :model "qwen2.5-coder-7b"
  :tools ["file-reader" "code-executor"])

(defagent cloud-analyst
  :runtime :openai-agent
  :model "gpt-4o"
  :tools ["web-search" "data-analyzer"])

;; Runtime-agnostic agent (auto-select)
(defagent hybrid-worker
  :model "auto"  ; Auto-select best available
  :tools ["file-reader" "web-search"]
  :runtime :auto)
```

### Runtime-Aware Agent Operations

```lisp
;; Query with runtime preference
(ask "Analyze this code"
     :agent code-reviewer
     :runtime :opencode  ; Prefer local execution
     :fallback :openai-agent)  ; Fallback to cloud if needed

;; List available runtimes
(list-runtimes)
;; => (:opencode :openai-agent :pantheon-native)

;; Check runtime capabilities
(runtime-capabilities :opencode)
;; => {:supports ["local-execution" "function-calling" "tool-use"]}

;; Runtime-specific configuration
(config :runtime :opencode
        :model-path "./models"
        :gpu-layers 20
        :threads 4)

(config :runtime :openai-agent
        :api-key "sk-..."
        :base-url "https://api.openai.com/v1")
```

### Cross-Runtime Agent Migration

```lisp
;; Migrate agent between runtimes
(migrate-agent my-agent :from :opencode :to :openai-agent)

;; Clone agent with different runtime
(clone-agent my-agent :new-runtime :openai-agent :name "cloud-clone")

;; Runtime comparison
(compare-runtimes :opencode :openai-agent
                 :criteria ["speed" "cost" "privacy"])
```

## Implementation Details

### Runtime Manager

```typescript
class RuntimeManager {
  private registry = new RuntimeRegistry();
  private defaultRuntime = 'opencode';

  constructor() {
    this.initializeRuntimes();
  }

  private initializeRuntimes(): void {
    // Register OpenCode runtime
    this.registry.register(
      new OpenCodeRuntime({
        modelPath: process.env.OPENCODE_MODEL_PATH || './models',
        gpuLayers: parseInt(process.env.OPENCODE_GPU_LAYERS || '20'),
      }),
    );

    // Register OpenAI Agent runtime
    this.registry.register(
      new OpenAIAgentRuntime({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      }),
    );

    // Register native Pantheon runtime
    this.registry.register(new PantheonNativeRuntime());
  }

  async createAgent(config: AgentConfig): Promise<Agent> {
    const runtimeName = config.runtime || this.defaultRuntime;
    const runtime = this.registry.get(runtimeName);

    if (!runtime) {
      throw new Error(`Runtime not found: ${runtimeName}`);
    }

    return await runtime.createAgent(config);
  }

  async executeAgent(agent: Agent, input: AgentInput): Promise<AgentOutput> {
    const runtime = this.registry.get(agent.runtime);

    if (!runtime) {
      throw new Error(`Runtime not found: ${agent.runtime}`);
    }

    return await runtime.executeAgent(agent, input);
  }

  getBestRuntime(requirements: RuntimeRequirements): string {
    const runtimes = this.registry.list();

    // Score each runtime based on requirements
    const scores = runtimes.map((runtime) => ({
      name: runtime.name,
      score: this.scoreRuntime(runtime, requirements),
    }));

    // Return highest scoring runtime
    return scores.sort((a, b) => b.score - a.score)[0].name;
  }

  private scoreRuntime(runtime: AgentRuntime, requirements: RuntimeRequirements): number {
    let score = 0;

    // Capability matching
    for (const capability of requirements.capabilities) {
      if (runtime.supportsCapability(capability)) {
        score += 10;
      }
    }

    // Performance preferences
    if (requirements.preferLocal && runtime.type === 'opencode') {
      score += 20;
    }

    if (requirements.preferCloud && runtime.type === 'openai-agent') {
      score += 20;
    }

    // Cost considerations
    if (requirements.budgetConstrained && runtime.type === 'opencode') {
      score += 15;
    }

    return score;
  }
}
```

### Enhanced DSL Runtime Integration

```clojure
(ns pantheon.dsl.runtime
  (:require [pantheon.dsl.core :as dsl]))

;; Runtime-aware agent creation
(defn defagent [name & {:keys [runtime model tools capabilities]
                         :or {runtime :auto}}]
  (let [runtime-name (if (= runtime :auto)
                       (get-best-runtime {:capabilities capabilities})
                       runtime)]
    (dsl/create-agent name
                      :runtime runtime-name
                      :model model
                      :tools tools
                      :capabilities capabilities)))

;; Runtime-aware ask function
(defn ask [message & {:keys [agent runtime fallback model context]}]
  (let [agent-obj (or (get-agent agent)
                      (get-default-agent runtime))
        runtime-name (or runtime
                        (:runtime agent-obj)
                        :opencode)]
    (try
      (dsl/execute-agent agent-obj
                         :message message
                         :model model
                         :context context)
      (catch Exception e
        (when fallback
          (println (str "Runtime " runtime-name " failed, trying fallback: " (.getMessage e)))
          (ask message :agent agent :runtime fallback :model model :context context))))))

;; Runtime management functions
(defn list-runtimes []
  (dsl/list-runtimes))

(defn runtime-info [runtime]
  (dsl/runtime-info runtime))

(defn migrate-agent [agent-name & {:keys [from to]}]
  (dsl/migrate-agent agent-name :from from :to to))
```

## Usage Examples

### Multi-Runtime Agent Development

```lisp
;; Define agents for different runtimes
(defagent local-coder
  :runtime :opencode
  :model "qwen2.5-coder-7b"
  :tools ["file-reader" "code-executor" "git"]
  :capabilities ["coding" "local-execution"])

(defagent cloud-researcher
  :runtime :openai-agent
  :model "gpt-4o"
  :tools ["web-search" "browser" "calculator"]
  :capabilities ["research" "web-access"])

;; Auto-select best runtime for task
(defagent smart-assistant
  :runtime :auto
  :capabilities ["general-assistance" "coding" "research"]
  :tools ["file-reader" "web-search"])

;; Use with runtime preference
(ask "Write a Python script to analyze this data"
     :agent smart-assistant
     :runtime :opencode  ; Prefer local for coding
     :fallback :openai-agent)

(ask "Research the latest AI trends"
     :agent smart-assistant
     :runtime :openai-agent  ; Prefer cloud for research
     :fallback :opencode)
```

### Runtime Comparison and Selection

```lisp
;; Compare runtimes for specific task
(compare-runtimes-for-task "code-review"
                           :runtimes [:opencode :openai-agent]
                           :criteria ["accuracy" "speed" "cost"])
;; => {:recommended :opencode
;;     :reasoning "Local execution provides better privacy and cost for code review"}

;; Get best runtime for requirements
(get-best-runtime :capabilities ["coding" "local-execution"]
                  :preferences [:privacy :cost])
;; => :opencode

(get-best-runtime :capabilities ["web-access" "research"]
                  :preferences [:accuracy :speed])
;; => :openai-agent
```

### Cross-Runtime Workflow

```lisp
;; Define workflow that uses multiple runtimes
(defworkflow hybrid-analysis
  :description "Analyze code and research best practices"
  :steps [
    ;; Step 1: Local code analysis
    (ask "Analyze this code for issues and improvements"
         :agent local-coder
         :runtime :opencode)

    ;; Step 2: Cloud research for best practices
    (ask "Research best practices for this type of code"
         :agent cloud-researcher
         :runtime :openai-agent)

    ;; Step 3: Local implementation of improvements
    (ask "Implement the improvements based on research"
         :agent local-coder
         :runtime :opencode)])

;; Execute workflow
(run-workflow hybrid-analysis
             :input {:code "./src/analysis.js"})
```

## Configuration and Setup

### Environment Configuration

```bash
# OpenCode Runtime
OPENCODE_MODEL_PATH=./models
OPENCODE_GPU_LAYERS=20
OPENCODE_THREADS=4

# OpenAI Agent Runtime
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_ORG_ID=org-...

# Default Runtime Selection
PANTHEON_DEFAULT_RUNTIME=opencode
PANTHEON_PREFER_LOCAL=true
```

### DSL Configuration

```lisp
;; Runtime configuration
(config :runtime :opencode
        :model-path "./models"
        :gpu-layers 20
        :threads 4
        :max-concurrent 2)

(config :runtime :openai-agent
        :api-key (env :get "OPENAI_API_KEY")
        :base-url (env :get "OPENAI_BASE_URL")
        :model "gpt-4o"
        :temperature 0.7)

;; Runtime preferences
(config :preferences
        :prefer-local true
        :budget-constrained true
        :privacy-first true)

;; Auto-selection rules
(config :auto-selection
        :coding {:prefer :opencode}
        :research {:prefer :openai-agent}
        :general {:prefer :auto})
```

## Benefits of Multi-Runtime Architecture

### 1. **Flexibility**

- Choose the best runtime for each task
- Easy experimentation with different runtimes
- Seamless migration between runtimes

### 2. **Optimization**

- Local execution for privacy-sensitive tasks
- Cloud execution for computationally intensive tasks
- Cost optimization through smart runtime selection

### 3. **Resilience**

- Runtime fallbacks for reliability
- Load balancing across multiple runtimes
- Graceful degradation when runtimes are unavailable

### 4. **Development Velocity**

- Rapid prototyping with familiar runtimes
- Easy testing across different environments
- Unified interface reduces learning curve

### 5. **Future-Proofing**

- Easy addition of new runtimes
- Runtime-agnostic agent definitions
- Migration path for evolving requirements

This multi-runtime architecture makes Pantheon a versatile platform that can leverage the strengths of different agent ecosystems while providing a unified, productive development experience through the Lisp DSL.
