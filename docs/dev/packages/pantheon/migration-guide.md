# Pantheon Migration Guide

## Overview

This guide consolidates migration patterns and procedures for transitioning to Pantheon from existing systems and from agent-* to pantheon-* packages. It combines insights from consolidation epics and migration tasks.

## Package Consolidation Migration

### Agent to Pantheon Package Mapping

```
@promethean-os/agent-ecs      → @promethean-os/pantheon-ecs
@promethean-os/agent-state    → @promethean-os/pantheon-state
@promethean-os/agent-workflow → @promethean-os/pantheon-workflow
@promethean-os/agent-registry → @promethean-os/pantheon-registry
@promethean-os/agent-entrypoint → @promethean-os/pantheon-entrypoint
@promethean-os/agent-llm      → @promethean-os/pantheon-llm
@promethean-os/agent-tools    → @promethean-os/pantheon-tools
@promethean-os/agent-memory   → @promethean-os/pantheon-memory
@promethean-os/agent-context  → @promethean-os/pantheon-context
@promethean-os/agent-cli      → @promethean-os/pantheon-cli
@promethean-os/agent-testing  → @promethean-os/pantheon-testing
@promethean-os/agent-utils    → @promethean-os/pantheon-utils
```

### Compatibility Shim Strategy

#### Phase 1: Dual Package Availability

```typescript
// Compatibility Shim Example
// packages/agent-ecs/src/index.ts
export * from '@promethean-os/pantheon-ecs';

// Deprecation warning
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️  @promethean-os/agent-ecs is deprecated.\n' +
    'Please migrate to @promethean-os/pantheon-ecs.\n' +
    'Migration guide: https://docs.promethean.ai/pantheon/migration\n' +
    'This package will be removed in v2.0.0'
  );
}
```

#### Phase 2: Redirect Packages

```typescript
// Redirect Package
// packages/agent-ecs/package.json
{
  "name": "@promethean-os/agent-ecs",
  "version": "1.0.0-deprecated",
  "main": "./redirect.js",
  "exports": {
    ".": "./redirect.js"
  },
  "deprecated": "Use @promethean-os/pantheon-ecs instead"
}

// packages/agent-ecs/redirect.js
module.exports = require('@promethean-os/pantheon-ecs');

if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '@promethean-os/agent-ecs is deprecated and now redirects to @promethean-os/pantheon-ecs. ' +
    'Please update your package.json dependencies.'
  );
}
```

### Automated Migration Tools

#### Package.json Updater

```typescript
// Migration Tool: update-package-dependencies.js
const fs = require('fs');
const path = require('path');

const PACKAGE_MAPPINGS = {
  '@promethean-os/agent-ecs': '@promethean-os/pantheon-ecs',
  '@promethean-os/agent-state': '@promethean-os/pantheon-state',
  '@promethean-os/agent-workflow': '@promethean-os/pantheon-workflow',
  '@promethean-os/agent-registry': '@promethean-os/pantheon-registry',
  '@promethean-os/agent-entrypoint': '@promethean-os/pantheon-entrypoint',
  '@promethean-os/agent-llm': '@promethean-os/pantheon-llm',
  '@promethean-os/agent-tools': '@promethean-os/pantheon-tools',
  '@promethean-os/agent-memory': '@promethean-os/pantheon-memory',
  '@promethean-os/agent-context': '@promethean-os/pantheon-context',
  '@promethean-os/agent-cli': '@promethean-os/pantheon-cli',
  '@promethean-os/agent-testing': '@promethean-os/pantheon-testing',
  '@promethean-os/agent-utils': '@promethean-os/pantheon-utils',
};

function updatePackageJson(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;

  // Update dependencies
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach(dep => {
        if (PACKAGE_MAPPINGS[dep]) {
          packageJson[depType][PACKAGE_MAPPINGS[dep]] = packageJson[depType][dep];
          delete packageJson[depType][dep];
          updated = true;
          console.log(`✅ Updated ${dep}: ${dep} → ${PACKAGE_MAPPINGS[dep]}`);
        }
      });
    }
  });

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${packageJsonPath}`);
  } else {
    console.log(`ℹ️  No updates needed for ${packageJsonPath}`);
  }
}

// Update all package.json files in workspace
function updateWorkspace() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const workspaceJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (workspaceJson.workspaces) {
    workspaceJson.workspaces.forEach(workspace => {
      const workspacePackagePath = path.join(workspace, 'package.json');
      if (fs.existsSync(workspacePackagePath)) {
        updatePackageJson(workspacePackagePath);
      }
    });
  }

  // Update root package.json
  updatePackageJson(packageJsonPath);
}

if (require.main === module) {
  updateWorkspace();
}
```

#### Import Statement Codemod

```typescript
// Migration Tool: update-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const IMPORT_MAPPINGS = {
  '@promethean-os/agent-ecs': '@promethean-os/pantheon-ecs',
  '@promethean-os/agent-state': '@promethean-os/pantheon-state',
  '@promethean-os/agent-workflow': '@promethean-os/pantheon-workflow',
  '@promethean-os/agent-registry': '@promethean-os/pantheon-registry',
  '@promethean-os/agent-entrypoint': '@promethean-os/pantheon-entrypoint',
  '@promethean-os/agent-llm': '@promethean-os/pantheon-llm',
  '@promethean-os/agent-tools': '@promethean-os/pantheon-tools',
  '@promethean-os/agent-memory': '@promethean-os/pantheon-memory',
  '@promethean-os/agent-context': '@promethean-os/pantheon-context',
  '@promethean-os/agent-cli': '@promethean-os/pantheon-cli',
  '@promethean-os/agent-testing': '@promethean-os/pantheon-testing',
  '@promethean-os/agent-utils': '@promethean-os/pantheon-utils',
};

function updateImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let newContent = content;

  Object.entries(IMPORT_MAPPINGS).forEach(([oldImport, newImport]) => {
    const regex = new RegExp(`from ['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `from '${newImport}'`);
      updated = true;
      console.log(`✅ Updated imports in ${filePath}: ${oldImport} → ${newImport}`);
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, newContent);
  }

  return updated;
}

function updateAllFiles() {
  const files = glob.sync('**/*.{js,ts,jsx,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '.git/**'],
  });

  let totalUpdated = 0;

  files.forEach(file => {
    if (updateImportsInFile(file)) {
      totalUpdated++;
    }
  });

  console.log(`\n🎉 Migration complete! Updated ${totalUpdated} files.`);
}

if (require.main === module) {
  updateAllFiles();
}
```

## Configuration Migration

### Environment Variable Updates

```bash
# Old Environment Variables
PROMETHEAN_AGENT_MODE=development
PROMETHEAN_AGENT_DATA_DIR=/data/agents
PROMETHEAN_AGENT_CONFIG_FILE=/config/agent.json

# New Pantheon Environment Variables
PANTHEON_MODE=development
PANTHEON_DATA_DIR=/data/pantheon
PANTHEON_CONFIG_FILE=/config/pantheon.json
```

### Configuration File Migration

```typescript
// Configuration Migration Tool
interface OldAgentConfig {
  agentMode: string;
  agentDataDir: string;
  agentConfigFile: string;
  agents: AgentConfig[];
}

interface NewPantheonConfig {
  mode: string;
  dataDir: string;
  configFile: string;
  actors: ActorConfig[];
  branding: 'pantheon';
  version: string;
}

function migrateConfig(oldConfig: OldAgentConfig): NewPantheonConfig {
  return {
    mode: oldConfig.agentMode,
    dataDir: oldConfig.agentDataDir,
    configFile: oldConfig.agentConfigFile,
    actors: oldConfig.agents.map(migrateAgentConfig),
    branding: 'pantheon',
    version: '1.0.0',
  };
}

function migrateAgentConfig(agentConfig: AgentConfig): ActorConfig {
  return {
    ...agentConfig,
    // Map old fields to new structure
    branding: 'pantheon',
    capabilities: agentConfig.skills || [],
    runtime: agentConfig.runtime || 'local',
    permissions: agentConfig.permissions || [],
    security: {
      sandbox: true,
      resourceLimits: {
        memory: 1024 * 1024 * 1024, // 1GB
        cpu: 50, // 50% CPU
      },
    },
  };
}
```

## API Migration

### Core API Changes

```typescript
// Old Agent API
interface Agent {
  id: string;
  name: string;
  skills: string[];
  execute(task: AgentTask): Promise<AgentResult>;
}

// New Pantheon Actor API
interface Actor {
  id: string;
  script: ActorScript;
  state: ActorState;
  goals: Goal[];
  behaviors: Behavior[];
  talents: Talent[];
}

// Migration Adapter
class AgentToActorAdapter implements Actor {
  constructor(private agent: Agent) {}

  get id(): string {
    return this.agent.id;
  }

  get script(): ActorScript {
    return {
      name: this.agent.name,
      behaviors: this.agent.skills.map(skill => ({
        name: skill,
        mode: 'active' as const,
        program: {
          type: 'llm',
          model: 'local',
          temperature: 0.7,
        },
      })),
      talents: [],
    };
  }

  get state(): ActorState {
    return ActorState.IDLE;
  }

  get goals(): Goal[] {
    return [];
  }

  get behaviors(): Behavior[] {
    return this.script.behaviors;
  }

  get talents(): Talent[] {
    return [];
  }
}
```

### Port Interface Migration

```typescript
// Old Agent Port
interface AgentPort {
  executeAgent(agent: Agent, task: AgentTask): Promise<AgentResult>;
}

// New Pantheon Port
interface ContextPort {
  compile(opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }): Promise<Message[]>;
}

// Migration Adapter
class AgentPortToContextPortAdapter implements ContextPort {
  constructor(private agentPort: AgentPort) {}

  async compile(opts: ContextCompileOptions): Promise<Message[]> {
    // Convert old agent execution to context compilation
    const messages: Message[] = [];

    for (const source of opts.sources) {
      const agent = this.createAgentFromSource(source);
      const task = this.createTaskFromSource(source);
      
      const result = await this.agentPort.executeAgent(agent, task);
      
      messages.push({
        role: this.mapResultToRole(result),
        content: result.output,
        metadata: {
          source: source.id,
          timestamp: Date.now(),
        },
      });
    }

    return messages;
  }

  private createAgentFromSource(source: ContextSource): Agent {
    return {
      id: source.id,
      name: source.label,
      skills: ['context-compilation'],
      execute: async (task) => {
        // Implementation for context compilation
        return { success: true, output: 'Compiled context' };
      },
    };
  }

  private createTaskFromSource(source: ContextSource): AgentTask {
    return {
      type: 'context-compilation',
      input: source,
      options: {},
    };
  }

  private mapResultToRole(result: AgentResult): 'system' | 'user' | 'assistant' {
    // Map agent result types to message roles
    return result.success ? 'assistant' : 'system';
  }
}
```

## Database Migration

### Schema Migration

```typescript
// Database Migration Tool
class DatabaseMigrator {
  constructor(
    private oldDb: Database,
    private newDb: Database
  ) {}

  async migrate(): Promise<void> {
    console.log('🔄 Starting database migration...');

    // Migrate agents to actors
    await this.migrateAgentsToActors();

    // Migrate agent tasks to actor executions
    await this.migrateAgentTasksToActorExecutions();

    // Migrate agent configurations to actor scripts
    await this.migrateAgentConfigsToActorScripts();

    console.log('✅ Database migration complete');
  }

  private async migrateAgentsToActors(): Promise<void> {
    const oldAgents = await this.oldDb.collection('agents').find({}).toArray();

    for (const oldAgent of oldAgents) {
      const newActor = this.convertAgentToActor(oldAgent);
      await this.newDb.collection('actors').insertOne(newActor);
    }
  }

  private convertAgentToActor(oldAgent: any): any {
    return {
      _id: oldAgent._id,
      id: oldAgent.id,
      script: {
        name: oldAgent.name,
        behaviors: oldAgent.skills.map((skill: string) => ({
          name: skill,
          mode: 'active',
          program: {
            type: 'llm',
            model: oldAgent.model || 'local',
            temperature: oldAgent.temperature || 0.7,
          },
        })),
        talents: [],
      },
      state: 'idle',
      goals: oldAgent.goals || [],
      createdAt: oldAgent.createdAt,
      updatedAt: new Date(),
      migratedFrom: 'agent',
    };
  }

  private async migrateAgentTasksToActorExecutions(): Promise<void> {
    const oldTasks = await this.oldDb.collection('agentTasks').find({}).toArray();

    for (const oldTask of oldTasks) {
      const newExecution = this.convertTaskToExecution(oldTask);
      await this.newDb.collection('actorExecutions').insertOne(newExecution);
    }
  }

  private convertTaskToExecution(oldTask: any): any {
    return {
      _id: oldTask._id,
      actorId: oldTask.agentId,
      input: oldTask.input,
      output: oldTask.output,
      status: oldTask.status,
      duration: oldTask.duration,
      createdAt: oldTask.createdAt,
      completedAt: oldTask.completedAt,
      migratedFrom: 'agentTask',
    };
  }
}
```

## Testing Migration

### Migration Test Suite

```typescript
// Migration Test Framework
class MigrationTester {
  constructor(
    private oldSystem: AgentSystem,
    private newSystem: PantheonSystem
  ) {}

  async runMigrationTests(): Promise<TestSuiteResult> {
    const tests = [
      this.testAgentCreation(),
      this.testTaskExecution(),
      this.testConfigurationMigration(),
      this.testDataMigration(),
    ];

    const results = await Promise.allSettled(
      tests.map(test => test.call(this))
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

  private async testAgentCreation(): Promise<void> {
    // Create agent in old system
    const oldAgent = await this.oldSystem.createAgent({
      name: 'test-agent',
      skills: ['test-skill'],
      model: 'test-model',
    });

    // Create equivalent actor in new system
    const newActor = await this.newSystem.createActor({
      script: {
        name: 'test-agent',
        behaviors: [{
          name: 'test-skill',
          mode: 'active',
          program: {
            type: 'llm',
            model: 'test-model',
          },
        }],
        talents: [],
      },
    });

    // Verify equivalence
    if (oldAgent.id !== newActor.id) {
      throw new Error('Agent/Actor ID mismatch');
    }

    console.log('✅ Agent creation migration test passed');
  }

  private async testTaskExecution(): Promise<void> {
    const testInput = { type: 'test', data: 'test data' };

    // Execute in old system
    const oldResult = await this.oldSystem.executeAgent('test-agent', testInput);

    // Execute in new system
    const newResult = await this.newSystem.executeActor('test-agent', testInput);

    // Compare results
    if (oldResult.success !== newResult.success) {
      throw new Error('Task execution results differ');
    }

    console.log('✅ Task execution migration test passed');
  }

  private async testConfigurationMigration(): Promise<void> {
    const oldConfig = {
      agentMode: 'development',
      agentDataDir: '/data/agents',
      agents: [],
    };

    const newConfig = migrateConfig(oldConfig);

    if (newConfig.mode !== oldConfig.agentMode) {
      throw new Error('Configuration migration failed');
    }

    console.log('✅ Configuration migration test passed');
  }

  private async testDataMigration(): Promise<void> {
    // Create test data in old system
    await this.oldSystem.saveAgent({
      id: 'migration-test',
      name: 'Migration Test Agent',
      skills: ['test'],
    });

    // Run migration
    const migrator = new DatabaseMigrator(
      this.oldSystem.getDatabase(),
      this.newSystem.getDatabase()
    );
    await migrator.migrate();

    // Verify data in new system
    const newActor = await this.newSystem.getActor('migration-test');
    if (!newActor || newActor.migratedFrom !== 'agent') {
      throw new Error('Data migration failed');
    }

    console.log('✅ Data migration test passed');
  }

  private getTestName(index: number): string {
    const names = [
      'Agent Creation',
      'Task Execution',
      'Configuration Migration',
      'Data Migration',
    ];
    return names[index] || `Unknown Test ${index}`;
  }
}
```

## Rollback Strategy

### Rollback Procedures

```typescript
// Rollback Manager
class MigrationRollback {
  private backupDir: string;
  private migrationLog: MigrationLog[];

  constructor(private projectRoot: string) {
    this.backupDir = path.join(projectRoot, '.migration-backup');
    this.migrationLog = [];
  }

  async createBackup(): Promise<void> {
    console.log('💾 Creating migration backup...');

    // Create backup directory
    await fs.mkdir(this.backupDir, { recursive: true });

    // Backup package.json files
    await this.backupPackageJsonFiles();

    // Backup source files
    await this.backupSourceFiles();

    // Backup configuration files
    await this.backupConfigFiles();

    console.log(`✅ Backup created at ${this.backupDir}`);
  }

  private async backupPackageJsonFiles(): Promise<void> {
    const packageFiles = glob.sync('**/package.json', {
      ignore: ['node_modules/**', 'dist/**'],
    });

    for (const file of packageFiles) {
      const backupPath = path.join(this.backupDir, file);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(file, backupPath);
    }
  }

  private async backupSourceFiles(): Promise<void> {
    const sourceFiles = glob.sync('**/*.{js,ts,jsx,tsx}', {
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
    });

    for (const file of sourceFiles) {
      const backupPath = path.join(this.backupDir, file);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(file, backupPath);
    }
  }

  async rollback(): Promise<void> {
    console.log('🔄 Rolling back migration...');

    if (!await fs.exists(this.backupDir)) {
      throw new Error('No backup found for rollback');
    }

    // Restore package.json files
    await this.restorePackageJsonFiles();

    // Restore source files
    await this.restoreSourceFiles();

    // Restore configuration files
    await this.restoreConfigFiles();

    console.log('✅ Rollback complete');
  }

  private async restorePackageJsonFiles(): Promise<void> {
    const backupFiles = glob.sync(path.join(this.backupDir, '**/package.json'));

    for (const backupFile of backupFiles) {
      const relativePath = path.relative(this.backupDir, backupFile);
      const targetPath = path.join(this.projectRoot, relativePath);
      await fs.copyFile(backupFile, targetPath);
    }
  }

  async cleanupBackup(): Promise<void> {
    console.log('🗑️ Cleaning up backup...');
    await fs.rm(this.backupDir, { recursive: true, force: true });
  }
}
```

## Migration Checklist

### Pre-Migration Checklist

- [ ] **Backup Creation**
  - [ ] Create full project backup
  - [ ] Backup database if applicable
  - [ ] Document current state
  - [ ] Test backup restoration

- [ ] **Dependency Analysis**
  - [ ] List all agent-* dependencies
  - [ ] Identify custom implementations
  - [ ] Document breaking changes
  - [ ] Plan migration order

- [ ] **Environment Preparation**
  - [ ] Set up migration environment
  - [ ] Install pantheon-* packages
  - [ ] Prepare migration tools
  - [ ] Create rollback plan

### Migration Checklist

- [ ] **Package Migration**
  - [ ] Update package.json dependencies
  - [ ] Update import statements
  - [ ] Update configuration files
  - [ ] Test package resolution

- [ ] **Code Migration**
  - [ ] Update API calls
  - [ ] Migrate data structures
  - [ ] Update type definitions
  - [ ] Refactor custom implementations

- [ ] **Data Migration**
  - [ ] Migrate database schemas
  - [ ] Convert data formats
  - [ ] Update indexes
  - [ ] Verify data integrity

- [ ] **Testing**
  - [ ] Run unit tests
  - [ ] Run integration tests
  - [ ] Perform manual testing
  - [ ] Validate functionality

### Post-Migration Checklist

- [ ] **Validation**
  - [ ] All tests passing
  - [ ] No runtime errors
  - [ ] Performance acceptable
  - [ ] Security maintained

- [ ] **Documentation**
  - [ ] Update README files
  - [ ] Update API documentation
  - [ ] Create migration notes
  - [ ] Update changelog

- [ ] **Cleanup**
  - [ ] Remove old packages
  - [ ] Clean up temporary files
  - [ ] Update CI/CD pipelines
  - [ ] Archive old code

## Troubleshooting Migration

### Common Issues

1. **Import Resolution Errors**
   ```bash
   # Clear module cache
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for circular dependencies
   npm ls --depth=0
   ```

2. **Type Compatibility Issues**
   ```typescript
   // Use type assertions for migration period
   const oldAgent = agent as any;
   const newActor = oldAgent as Actor;
   ```

3. **Database Migration Failures**
   ```typescript
   // Run migration in batches
   const batchSize = 100;
   for (let i = 0; i < totalRecords; i += batchSize) {
     await migrateBatch(i, batchSize);
   }
   ```

4. **Performance Regression**
   ```typescript
   // Monitor performance during migration
   const monitor = new PerformanceMonitor();
   monitor.startTimer('migration-operation');
   // ... migration code
   monitor.endTimer('migration-operation');
   ```

### Support Resources

- **Documentation**: [Pantheon Documentation](https://docs.promethean.ai/pantheon)
- **Issues**: [GitHub Issues](https://github.com/promethean-os/promethean/issues)
- **Community**: [Discord Server](https://discord.gg/promethean)
- **Migration Support**: migration@promethean.ai

## Conclusion

This migration guide provides comprehensive procedures for transitioning to Pantheon from existing systems. Key principles:

1. **Gradual Migration**: Phase-based approach to minimize disruption
2. **Backward Compatibility**: Maintain functionality during transition
3. **Automated Tools**: Scripts to automate common migration tasks
4. **Thorough Testing**: Comprehensive validation at each step
5. **Rollback Planning**: Safe fallback procedures

By following this guide, you can successfully migrate to Pantheon while maintaining system stability and minimizing downtime.