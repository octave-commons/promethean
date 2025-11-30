# Pantheon Local Development Guide

## Overview

This guide consolidates local development patterns, night-mode execution, and hyper-specialized agent workflows for Pantheon. It combines insights from the primer series and local agent ecosystem documentation.

## Local-First Development Philosophy

Pantheon emphasizes local-first development with optional cloud fallback:

```typescript
// Local Development Configuration
interface LocalDevConfig {
  preferLocalModels: boolean;
  allowCloudFallback: boolean;
  localModelPath: string;
  maxLocalMemory: number;
  enableNightMode: boolean;
  blockedDomains: string[];
}

const localConfig: LocalDevConfig = {
  preferLocalModels: true,
  allowCloudFallback: false, // Strict local-only mode
  localModelPath: './models',
  maxLocalMemory: 8 * 1024 * 1024 * 1024, // 8GB
  enableNightMode: true,
  blockedDomains: [
    'api.openai.com',
    'api.anthropic.com',
    'api.google.com'
  ],
};
```

## Night Mode Architecture

### Day/Night Cycle

```typescript
// Day/Night Mode Manager
class DayNightCycle {
  private isNightMode = false;
  private nightModeTimer?: NodeJS.Timeout;

  constructor(
    private orchestrator: Orchestrator,
    private config: DayNightConfig
  ) {
    this.scheduleNightMode();
  }

  private scheduleNightMode(): void {
    const now = new Date();
    const nightStart = new Date();
    nightStart.setHours(22, 0, 0, 0); // 10 PM
    
    const nightEnd = new Date();
    nightEnd.setHours(6, 0, 0, 0); // 6 AM

    const timeToNight = nightStart.getTime() - now.getTime();
    const timeToDay = nightEnd.getTime() - now.getTime();

    if (timeToNight > 0 && timeToNight < 24 * 60 * 60 * 1000) {
      // Schedule night mode
      this.nightModeTimer = setTimeout(() => {
        this.enableNightMode();
      }, timeToNight);
    } else if (timeToDay > 0 && timeToDay < 24 * 60 * 60 * 1000) {
      // Schedule day mode
      this.nightModeTimer = setTimeout(() => {
        this.disableNightMode();
      }, timeToDay);
    }
  }

  private async enableNightMode(): Promise<void> {
    console.log('🌙 Enabling night mode - local execution only');
    this.isNightMode = true;

    // Configure for local-only execution
    await this.orchestrator.updateConfig({
      allowCloudFallback: false,
      enableBatching: true,
      maxConcurrentActors: 10,
      resourceLimits: {
        memory: this.config.nightModeMemoryLimit,
        cpu: 80, // 80% CPU usage
      },
    });

    // Start night mode workflows
    await this.startNightModeWorkflows();
    
    // Schedule day mode
    this.scheduleNightMode();
  }

  private async disableNightMode(): Promise<void> {
    console.log('☀️ Disabling night mode - enabling cloud capabilities');
    this.isNightMode = false;

    // Generate morning report
    await this.generateMorningReport();

    // Re-enable cloud capabilities
    await this.orchestrator.updateConfig({
      allowCloudFallback: true,
      enableBatching: false,
      maxConcurrentActors: 5,
    });

    // Schedule next night mode
    this.scheduleNightMode();
  }
}
```

### Night Mode Workflows

```typescript
// Night Mode Workflow Manager
class NightModeWorkflows {
  private workflows = new Map<string, Workflow>();

  constructor(private orchestrator: Orchestrator) {
    this.initializeWorkflows();
  }

  private initializeWorkflows(): void {
    // Document Operations Workflow
    this.workflows.set('doc-ops', {
      name: 'Document Operations',
      description: 'Process and improve documentation',
      agents: [
        'doc-renamer',
        'frontmatter-normalizer',
        'markdown-linter',
        'content-validator',
      ],
      schedule: '0 2 * * *', // 2 AM every night
      enabled: true,
    });

    // Code Quality Workflow
    this.workflows.set('code-quality', {
      name: 'Code Quality Assurance',
      description: 'Run code quality checks and fixes',
      agents: [
        'linter-runner',
        'test-executor',
        'coverage-analyzer',
        'security-scanner',
      ],
      schedule: '0 3 * * *', // 3 AM every night
      enabled: true,
    });

    // Agent Training Workflow
    this.workflows.set('agent-training', {
      name: 'Agent Training and Refinement',
      description: 'Train and improve agent models',
      agents: [
        'data-collector',
        'training-orchestrator',
        'model-evaluator',
        'model-deployer',
      ],
      schedule: '0 4 * * *', // 4 AM every night
      enabled: true,
    });
  }

  async executeWorkflows(): Promise<WorkflowResult[]> {
    const results: WorkflowResult[] = [];

    for (const [workflowId, workflow] of this.workflows) {
      if (!workflow.enabled) continue;

      console.log(`🚀 Executing workflow: ${workflow.name}`);
      
      try {
        const result = await this.executeWorkflow(workflow);
        results.push(result);
        
        console.log(`✅ Workflow completed: ${workflow.name}`);
      } catch (error) {
        console.error(`❌ Workflow failed: ${workflow.name}`, error);
        results.push({
          workflowId,
          success: false,
          error: error.message,
          duration: 0,
        });
      }
    }

    return results;
  }

  private async executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
    const startTime = Date.now();
    const agentResults: AgentResult[] = [];

    // Execute agents in sequence or parallel based on workflow config
    for (const agentName of workflow.agents) {
      const agent = await this.orchestrator.getAgent(agentName);
      if (!agent) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      const result = await this.orchestrator.executeAgent(agent, {
        workflowId: workflow.id,
        nightMode: true,
        timeout: 300000, // 5 minutes per agent
      });

      agentResults.push(result);
    }

    return {
      workflowId: workflow.id,
      success: true,
      duration: Date.now() - startTime,
      agentResults,
    };
  }
}
```

## Hyper-Specialized Agents

### Agent Specialization Pattern

```typescript
// Specialized Agent Base
abstract class SpecializedAgent {
  protected abstract capabilities: string[];
  protected abstract tools: string[];
  protected abstract model: string;
  protected abstract runtime: 'local' | 'cloud';

  abstract execute(input: AgentInput): Promise<AgentOutput>;

  protected validateInput(input: AgentInput): void {
    // Base validation logic
    if (!input || typeof input !== 'object') {
      throw new ValidationError('Invalid input format');
    }
  }

  protected logExecution(input: AgentInput, output: AgentOutput): void {
    console.log(`[${this.constructor.name}] Input:`, input);
    console.log(`[${this.constructor.name}] Output:`, output);
  }
}

// Document Operations Specialist
class DocOpsAgent extends SpecializedAgent {
  protected capabilities = ['rename', 'frontmatter', 'normalize', 'validate'];
  protected tools = ['file-rename', 'frontmatter-editor', 'markdown-linter'];
  protected model = 'qwen2.5-coder-7b';
  protected runtime = 'local' as const;

  async execute(input: AgentInput): Promise<AgentOutput> {
    this.validateInput(input);

    const { operation, filePath, options } = input;

    switch (operation) {
      case 'rename':
        return await this.renameDocument(filePath, options);
      case 'frontmatter':
        return await this.updateFrontmatter(filePath, options);
      case 'normalize':
        return await this.normalizeDocument(filePath, options);
      case 'validate':
        return await this.validateDocument(filePath, options);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private async renameDocument(filePath: string, options: any): Promise<AgentOutput> {
    const newPath = this.generateNewName(filePath, options);
    
    await this.executeTool('file-rename', {
      oldPath: filePath,
      newPath,
    });

    return {
      success: true,
      result: { oldPath: filePath, newPath },
      message: `Document renamed from ${filePath} to ${newPath}`,
    };
  }

  private async updateFrontmatter(filePath: string, options: any): Promise<AgentOutput> {
    const content = await this.executeTool('file-read', { path: filePath });
    const updatedContent = this.processFrontmatter(content, options);
    
    await this.executeTool('file-write', {
      path: filePath,
      content: updatedContent,
    });

    return {
      success: true,
      result: { filePath, updated: true },
      message: `Frontmatter updated for ${filePath}`,
    };
  }

  private generateNewName(oldPath: string, options: any): string {
    const parsed = path.parse(oldPath);
    const newName = options.name || this.generateConformingName(parsed.name);
    return path.join(parsed.dir, `${parsed.name}${parsed.ext}`);
  }

  private generateConformingName(name: string): string {
    // Convert to kebab-case
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// Code Review Specialist
class CodeReviewAgent extends SpecializedAgent {
  protected capabilities = ['syntax-check', 'style-review', 'security-scan', 'test-coverage'];
  protected tools = ['ava-runner', 'eslint', 'semgrep', 'coverage-tool'];
  protected model = 'qwen2.5-coder-7b';
  protected runtime = 'local' as const;

  async execute(input: AgentInput): Promise<AgentOutput> {
    this.validateInput(input);

    const { filePath, reviewType } = input;
    const results: ReviewResult[] = [];

    // Run different types of reviews
    if (reviewType === 'all' || reviewType === 'syntax') {
      results.push(await this.checkSyntax(filePath));
    }

    if (reviewType === 'all' || reviewType === 'style') {
      results.push(await this.reviewStyle(filePath));
    }

    if (reviewType === 'all' || reviewType === 'security') {
      results.push(await this.securityScan(filePath));
    }

    if (reviewType === 'all' || reviewType === 'coverage') {
      results.push(await this.checkCoverage(filePath));
    }

    return {
      success: true,
      result: { filePath, reviews: results },
      message: `Code review completed for ${filePath}`,
    };
  }

  private async checkSyntax(filePath: string): Promise<ReviewResult> {
    try {
      await this.executeTool('syntax-check', { filePath });
      return {
        type: 'syntax',
        status: 'pass',
        issues: [],
      };
    } catch (error) {
      return {
        type: 'syntax',
        status: 'fail',
        issues: [{ message: error.message, severity: 'error' }],
      };
    }
  }

  private async reviewStyle(filePath: string): Promise<ReviewResult> {
    const result = await this.executeTool('eslint', { filePath });
    
    return {
      type: 'style',
      status: result.issues.length === 0 ? 'pass' : 'warn',
      issues: result.issues,
    };
  }

  private async securityScan(filePath: string): Promise<ReviewResult> {
    const result = await this.executeTool('semgrep', { filePath });
    
    return {
      type: 'security',
      status: result.issues.length === 0 ? 'pass' : 'fail',
      issues: result.issues,
    };
  }

  private async checkCoverage(filePath: string): Promise<ReviewResult> {
    const result = await this.executeTool('coverage-tool', { filePath });
    
    return {
      type: 'coverage',
      status: result.coverage >= 80 ? 'pass' : 'warn',
      issues: result.coverage < 80 ? [{
        message: `Coverage is ${result.coverage}%, below 80% threshold`,
        severity: 'warning',
      }] : [],
    };
  }
}
```

### Agent Registry and Discovery

```typescript
// Agent Registry
class AgentRegistry {
  private agents = new Map<string, AgentFactory>();
  private specializations = new Map<string, string[]>();

  constructor() {
    this.registerBuiltinAgents();
  }

  private registerBuiltinAgents(): void {
    // Register document operations agents
    this.registerAgent('doc-renamer', () => new DocOpsAgent('rename'));
    this.registerAgent('frontmatter-normalizer', () => new DocOpsAgent('frontmatter'));
    this.registerAgent('markdown-linter', () => new DocOpsAgent('normalize'));
    this.registerAgent('content-validator', () => new DocOpsAgent('validate'));

    // Register code review agents
    this.registerAgent('syntax-checker', () => new CodeReviewAgent('syntax'));
    this.registerAgent('style-reviewer', () => new CodeReviewAgent('style'));
    this.registerAgent('security-scanner', () => new CodeReviewAgent('security'));
    this.registerAgent('coverage-analyzer', () => new CodeReviewAgent('coverage'));

    // Define specializations
    this.specializations.set('document-ops', [
      'doc-renamer', 'frontmatter-normalizer', 'markdown-linter', 'content-validator'
    ]);
    this.specializations.set('code-review', [
      'syntax-checker', 'style-reviewer', 'security-scanner', 'coverage-analyzer'
    ]);
  }

  registerAgent(name: string, factory: AgentFactory): void {
    this.agents.set(name, factory);
  }

  getAgent(name: string): SpecializedAgent | null {
    const factory = this.agents.get(name);
    return factory ? factory() : null;
  }

  getSpecializationAgents(specialization: string): SpecializedAgent[] {
    const agentNames = this.specializations.get(specialization) || [];
    return agentNames
      .map(name => this.getAgent(name))
      .filter(agent => agent !== null) as SpecializedAgent[];
  }

  listAgents(): AgentInfo[] {
    return Array.from(this.agents.entries()).map(([name, factory]) => {
      const agent = factory();
      return {
        name,
        capabilities: agent.capabilities,
        tools: agent.tools,
        model: agent.model,
        runtime: agent.runtime,
      };
    });
  }

  listSpecializations(): SpecializationInfo[] {
    return Array.from(this.specializations.entries()).map(([name, agents]) => ({
      name,
      agents,
      description: this.getSpecializationDescription(name),
    }));
  }
}
```

## Local Model Management

### Model Loading and Caching

```typescript
// Local Model Manager
class LocalModelManager {
  private models = new Map<string, LocalModel>();
  private modelCache = new Map<string, any>();

  constructor(private config: LocalModelConfig) {
    this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    const modelFiles = await this.scanModelDirectory();
    
    for (const modelFile of modelFiles) {
      try {
        const model = await this.loadModel(modelFile);
        this.models.set(model.name, model);
        console.log(`📦 Loaded model: ${model.name} (${model.size}MB)`);
      } catch (error) {
        console.error(`❌ Failed to load model ${modelFile}:`, error);
      }
    }
  }

  private async scanModelDirectory(): Promise<string[]> {
    const modelDir = this.config.modelPath;
    const files = await fs.readdir(modelDir);
    
    return files.filter(file => 
      file.endsWith('.gguf') || 
      file.endsWith('.bin') || 
      file.endsWith('.safetensors')
    );
  }

  private async loadModel(modelPath: string): Promise<LocalModel> {
    const fullPath = path.join(this.config.modelPath, modelPath);
    const stats = await fs.stat(fullPath);
    
    // Load model metadata
    const metadata = await this.loadModelMetadata(fullPath);
    
    return {
      name: metadata.name || path.basename(modelPath, path.extname(modelPath)),
      path: fullPath,
      size: Math.round(stats.size / (1024 * 1024)), // MB
      type: metadata.type || 'gguf',
      contextLength: metadata.contextLength || 4096,
      capabilities: metadata.capabilities || [],
      loaded: false,
    };
  }

  async loadModelIntoMemory(modelName: string): Promise<any> {
    if (this.modelCache.has(modelName)) {
      return this.modelCache.get(modelName);
    }

    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    console.log(`🔄 Loading model into memory: ${modelName}`);
    
    // Load model using appropriate backend
    const loadedModel = await this.loadModelWithBackend(model);
    
    this.modelCache.set(modelName, loadedModel);
    model.loaded = true;

    return loadedModel;
  }

  private async loadModelWithBackend(model: LocalModel): Promise<any> {
    switch (model.type) {
      case 'gguf':
        return await this.loadGGUFModel(model);
      case 'safetensors':
        return await this.loadSafetensorsModel(model);
      default:
        throw new Error(`Unsupported model type: ${model.type}`);
    }
  }

  private async loadGGUFModel(model: LocalModel): Promise<any> {
    // Use llama.cpp or similar backend
    const { LlamaModel } = await import('llama.cpp');
    
    return await LlamaModel.create({
      modelPath: model.path,
      contextLength: model.contextLength,
      gpuLayers: this.config.gpuLayers,
      threads: this.config.threads,
    });
  }

  private async loadSafetensorsModel(model: LocalModel): Promise<any> {
    // Use transformers.js or similar backend
    const { pipeline } = await import('@xenova/transformers');
    
    return await pipeline('text-generation', model.path, {
      device: 'gpu',
      dtype: 'q4',
    });
  }

  unloadModel(modelName: string): void {
    if (this.modelCache.has(modelName)) {
      this.modelCache.delete(modelName);
      const model = this.models.get(modelName);
      if (model) {
        model.loaded = false;
      }
      console.log(`🗑️ Unloaded model: ${modelName}`);
    }
  }

  getLoadedModels(): string[] {
    return Array.from(this.modelCache.keys());
  }

  getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.values()).map(model => ({
      name: model.name,
      size: model.size,
      type: model.type,
      contextLength: model.contextLength,
      capabilities: model.capabilities,
      loaded: model.loaded,
    }));
  }
}
```

## Performance Optimization

### Continuous Batching

```typescript
// Continuous Batching Manager
class ContinuousBatchingManager {
  private batchQueue: BatchRequest[] = [];
  private batchTimer?: NodeJS.Timeout;
  private processing = false;

  constructor(
    private modelManager: LocalModelManager,
    private config: BatchingConfig
  ) {}

  async addToBatch(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        ...request,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      this.scheduleBatchProcessing();
    });
  }

  private scheduleBatchProcessing(): void {
    if (this.processing) return;

    const shouldProcess = 
      this.batchQueue.length >= this.config.maxBatchSize ||
      (this.batchQueue.length > 0 && 
       Date.now() - this.batchQueue[0].timestamp >= this.config.maxWaitTime);

    if (shouldProcess) {
      this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.config.maxWaitTime);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.batchQueue.length === 0) return;

    this.processing = true;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    const batch = this.batchQueue.splice(0, this.config.maxBatchSize);
    
    try {
      const results = await this.executeBatch(batch);
      
      batch.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(request => {
        request.reject(error);
      });
    } finally {
      this.processing = false;
      
      // Schedule next batch if there are more requests
      if (this.batchQueue.length > 0) {
        setImmediate(() => this.scheduleBatchProcessing());
      }
    }
  }

  private async executeBatch(batch: BatchRequest[]): Promise<any[]> {
    // Group requests by model
    const requestsByModel = new Map<string, BatchRequest[]>();
    
    for (const request of batch) {
      const modelRequests = requestsByModel.get(request.modelName) || [];
      modelRequests.push(request);
      requestsByModel.set(request.modelName, modelRequests);
    }

    const results: any[] = [];
    
    // Process each model's requests in parallel
    const modelPromises = Array.from(requestsByModel.entries()).map(
      async ([modelName, requests]) => {
        const model = await this.modelManager.loadModelIntoMemory(modelName);
        return this.processModelBatch(model, requests);
      }
    );

    const modelResults = await Promise.all(modelPromises);
    
    // Merge results back to original order
    const resultMap = new Map<string, any>();
    for (const [modelName, requests] of requestsByModel) {
      const modelResultIndex = Array.from(requestsByModel.keys()).indexOf(modelName);
      const modelResults = modelResults[modelResultIndex];
      
      requests.forEach((request, index) => {
        resultMap.set(request.id, modelResults[index]);
      });
    }

    return batch.map(request => resultMap.get(request.id));
  }

  private async processModelBatch(
    model: any,
    requests: BatchRequest[]
  ): Promise<any[]> {
    // Create batched prompts
    const prompts = requests.map(req => req.prompt);
    const maxTokens = Math.max(...requests.map(req => req.maxTokens || 512));

    // Execute batch
    const responses = await model.generate(prompts, {
      maxTokens,
      temperature: this.config.temperature,
      batchSize: requests.length,
    });

    return responses;
  }
}
```

## Testing Local Development

### Local Test Environment

```typescript
// Local Test Environment Setup
class LocalTestEnvironment {
  private testDir: string;
  private originalEnv: NodeJS.ProcessEnv;

  constructor() {
    this.testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantheon-test-'));
    this.originalEnv = { ...process.env };
  }

  async setup(): Promise<void> {
    // Create test directory structure
    await this.createTestStructure();
    
    // Set up test environment variables
    process.env.PANTHEON_MODE = 'test';
    process.env.PANTHEON_DATA_DIR = this.testDir;
    process.env.PANTHEON_LOCAL_MODELS = path.join(this.testDir, 'models');
    
    // Initialize test databases
    await this.setupTestDatabases();
  }

  private async createTestStructure(): Promise<void> {
    const dirs = [
      'models',
      'data',
      'logs',
      'temp',
      'workspaces',
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.testDir, dir), { recursive: true });
    }
  }

  private async setupTestDatabases(): Promise<void> {
    // Set up test MongoDB
    const mongoContainer = await this.startMongoContainer();
    process.env.PANTHEON_MONGO_URL = mongoContainer.getConnectionString();

    // Set up test ChromaDB
    const chromaContainer = await this.startChromaContainer();
    process.env.PANTHEON_CHROMA_URL = chromaContainer.getConnectionString();
  }

  async cleanup(): Promise<void> {
    // Stop containers
    await this.stopContainers();
    
    // Clean up test directory
    await fs.rm(this.testDir, { recursive: true, force: true });
    
    // Restore environment
    process.env = this.originalEnv;
  }

  async runTest(testFn: () => Promise<void>): Promise<TestResult> {
    await this.setup();
    
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        duration: 0,
        error: error.message,
      };
    } finally {
      await this.cleanup();
    }
  }
}
```

### Integration Tests

```typescript
// Integration Test Suite
class LocalIntegrationTests {
  constructor(
    private testEnv: LocalTestEnvironment,
    private orchestrator: Orchestrator
  ) {}

  async runAllTests(): Promise<TestSuiteResult> {
    const tests = [
      this.testLocalModelLoading(),
      this.testAgentExecution(),
      this.testNightModeWorkflow(),
      this.testBatchProcessing(),
      this.testSecurityConstraints(),
    ];

    const results = await Promise.allSettled(
      tests.map(test => () => this.testEnv.runTest(test))
    );

    return {
      total: tests.length,
      passed: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results: results.map((result, index) => ({
        testName: this.getTestName(index),
        success: result.status === 'fulfilled',
        result: result.status === 'fulfilled' ? result.value : result.reason,
      })),
    };
  }

  private async testLocalModelLoading(): Promise<void> {
    const modelManager = new LocalModelManager({
      modelPath: './test-models',
      gpuLayers: 20,
      threads: 4,
    });

    const models = modelManager.getAvailableModels();
    if (models.length === 0) {
      throw new Error('No models found');
    }

    const model = await modelManager.loadModelIntoMemory(models[0].name);
    if (!model) {
      throw new Error('Failed to load model');
    }

    console.log(`✅ Successfully loaded model: ${models[0].name}`);
  }

  private async testAgentExecution(): Promise<void> {
    const agent = new DocOpsAgent();
    const input = {
      operation: 'rename',
      filePath: '/test/document.md',
      options: { name: 'new-document-name' },
    };

    const result = await agent.execute(input);
    
    if (!result.success) {
      throw new Error(`Agent execution failed: ${result.message}`);
    }

    console.log(`✅ Agent executed successfully: ${result.message}`);
  }

  private async testNightModeWorkflow(): Promise<void> {
    const nightMode = new DayNightCycle(this.orchestrator, {
      nightModeMemoryLimit: 4 * 1024 * 1024 * 1024,
      workflows: ['doc-ops', 'code-quality'],
    });

    // Simulate night mode activation
    await nightMode.enableNightMode();
    
    // Verify night mode is active
    const config = this.orchestrator.getConfig();
    if (config.allowCloudFallback !== false) {
      throw new Error('Night mode not properly activated');
    }

    console.log('✅ Night mode workflow test passed');
  }

  private async testBatchProcessing(): Promise<void> {
    const batchManager = new ContinuousBatchingManager(
      new LocalModelManager({ modelPath: './models' }),
      { maxBatchSize: 4, maxWaitTime: 100 }
    );

    const requests = Array.from({ length: 8 }, (_, i) => ({
      id: `test-${i}`,
      modelName: 'test-model',
      prompt: `Test prompt ${i}`,
      maxTokens: 100,
    }));

    const results = await Promise.all(
      requests.map(req => batchManager.addToBatch(req))
    );

    if (results.length !== requests.length) {
      throw new Error('Batch processing failed');
    }

    console.log(`✅ Batch processing test passed: ${results.length} results`);
  }

  private async testSecurityConstraints(): Promise<void> {
    const agent = new DocOpsAgent();
    
    // Test malicious input
    const maliciousInputs = [
      { operation: 'rename', filePath: '../../../etc/passwd', options: {} },
      { operation: 'rename', filePath: 'doc.md', options: { name: '<script>alert("xss")</script>' } },
    ];

    for (const input of maliciousInputs) {
      try {
        await agent.execute(input);
        throw new Error(`Malicious input was accepted: ${JSON.stringify(input)}`);
      } catch (error) {
        if (error instanceof ValidationError) {
          continue; // Expected behavior
        }
        throw error;
      }
    }

    console.log('✅ Security constraints test passed');
  }

  private getTestName(index: number): string {
    const names = [
      'Local Model Loading',
      'Agent Execution',
      'Night Mode Workflow',
      'Batch Processing',
      'Security Constraints',
    ];
    return names[index] || `Unknown Test ${index}`;
  }
}
```

## Troubleshooting Local Development

### Common Issues and Solutions

1. **Model Loading Failures**
   ```bash
   # Check model format compatibility
   file model.gguf
   
   # Verify model integrity
   sha256sum model.gguf
   
   # Check available memory
   free -h
   ```

2. **Night Mode Not Activating**
   ```typescript
   // Debug night mode scheduling
   const cycle = new DayNightCycle(orchestrator, config);
   console.log('Next night mode:', cycle.getNextNightModeTime());
   console.log('Current time:', new Date());
   ```

3. **Agent Execution Timeouts**
   ```typescript
   // Increase timeout for complex operations
   const result = await orchestrator.executeAgent(agent, {
     timeout: 600000, // 10 minutes
     ...otherOptions,
   });
   ```

4. **Memory Issues with Multiple Models**
   ```typescript
   // Implement model unloading strategy
   const modelManager = new LocalModelManager({
     maxLoadedModels: 2, // Limit concurrent models
     unloadingStrategy: 'lru', // Least recently used
   });
   ```

### Performance Monitoring

```typescript
// Performance Monitor
class LocalPerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      const metrics = this.metrics.get(operation) || [];
      metrics.push(duration);
      
      // Keep only last 100 measurements
          if (metrics.length > 100) {
        metrics.shift();
      }
      
      this.metrics.set(operation, metrics);
    };
  }

  getMetrics(operation: string): PerformanceMetrics {
    const measurements = this.metrics.get(operation) || [];
    
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }

    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      avg,
      min,
      max,
    };
  }

  printReport(): void {
    console.log('📊 Performance Report:');
    for (const [operation, metrics] of this.metrics) {
      const perf = this.getMetrics(operation);
      console.log(`  ${operation}:`);
      console.log(`    Count: ${perf.count}`);
      console.log(`    Average: ${perf.avg.toFixed(2)}ms`);
      console.log(`    Min: ${perf.min}ms`);
      console.log(`    Max: ${perf.max}ms`);
    }
  }
}
```

## Conclusion

This local development guide provides comprehensive patterns for building and running Pantheon applications in local environments. Key principles:

1. **Local-First**: Prioritize local models and execution
2. **Night Mode**: Automated workflows for offline processing
3. **Specialization**: Hyper-focused agents for specific tasks
4. **Performance**: Continuous batching and optimization
5. **Security**: Input validation and sandboxing
6. **Testing**: Comprehensive local test environments

By following these patterns, you can build efficient, secure, and scalable Pantheon applications that run entirely locally while maintaining high quality and reliability.