# Pantheon Comprehensive Troubleshooting Guide

## Overview

This guide consolidates troubleshooting patterns, common issues, and solutions for Pantheon development and deployment. It combines insights from task documentation, implementation guides, and architectural patterns.

## Quick Reference Issues

### Installation and Setup

#### Package Resolution Issues

```bash
# Issue: Cannot find pantheon packages
Error: Cannot resolve @promethean-os/pantheon-core

# Solutions:
# 1. Check package installation
npm list @promethean-os/pantheon-core

# 2. Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 3. Check npm registry
npm config get registry
# Should be: https://registry.npmjs.org/

# 4. Verify workspace setup
cat pnpm-workspace.yaml
# Ensure pantheon packages are listed
```

#### TypeScript Compilation Issues

```bash
# Issue: TypeScript errors for pantheon imports
Error: Cannot find module '@promethean-os/pantheon-core' or its type declarations

# Solutions:
# 1. Check TypeScript configuration
cat tsconfig.json
# Ensure:
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  },
  "include": ["packages/**/src"]
}

# 2. Check type definitions
find node_modules/@promethean-os/pantheon-core -name "*.d.ts"

# 3. Rebuild packages
pnpm build
pnpm --filter @promethean-os/pantheon-core build
```

### Runtime Issues

#### Actor Creation Failures

```typescript
// Issue: Actor creation fails with validation error
Error: ValidationError: Invalid actor configuration

// Debug Steps:
// 1. Check actor configuration schema
import { ActorConfigSchema } from '@promethean-os/pantheon-core';

const config = {
  name: 'test-actor',
  type: 'llm',
  goal: 'Test goal',
  // Missing required fields?
};

try {
  const validated = ActorConfigSchema.parse(config);
  console.log('✅ Configuration valid:', validated);
} catch (error) {
  console.error('❌ Configuration errors:', error.errors);
}

// 2. Check required dependencies
const dependencies = {
  context: contextAdapter,
  llm: llmAdapter,
  tools: toolAdapter,
  bus: messageBus,
  schedule: scheduler,
  state: actorStateAdapter,
};

for (const [name, dep] of Object.entries(dependencies)) {
  if (!dep) {
    console.error(`❌ Missing dependency: ${name}`);
  }
}
```

#### Context Compilation Failures

```typescript
// Issue: Context compilation returns empty results
// Debug Steps:

// 1. Check source definitions
const sources = [
  { id: 'sessions', label: 'Chat Sessions' },
  { id: 'tasks', label: 'Tasks' },
];

// Verify source IDs match manager names
const managers = await getStoreManagers();
console.log('Available managers:', managers.map(m => m.name));
console.log('Requested sources:', sources.map(s => s.id));

// 2. Check manager initialization
for (const manager of managers) {
  try {
    const test = await manager.getMostRecent(1);
    console.log(`✅ Manager ${manager.name} working:`, test.length, 'items');
  } catch (error) {
    console.error(`❌ Manager ${manager.name} failed:`, error);
  }
}

// 3. Check database connections
try {
  await db.admin().ping();
  console.log('✅ Database connection working');
} catch (error) {
  console.error('❌ Database connection failed:', error);
}
```

#### LLM Execution Issues

```typescript
// Issue: LLM calls timeout or fail
// Debug Steps:

// 1. Check model availability
const modelManager = new LocalModelManager({ modelPath: './models' });
const models = modelManager.getAvailableModels();
console.log('Available models:', models);

// 2. Check model loading
try {
  const model = await modelManager.loadModelIntoMemory('qwen2.5-coder-7b');
  console.log('✅ Model loaded successfully');
} catch (error) {
  console.error('❌ Model loading failed:', error);
  // Check memory requirements
  const stats = await fs.stat(model.path);
  console.log('Model size:', Math.round(stats.size / (1024 * 1024)), 'MB');
}

// 3. Test LLM adapter directly
const llmAdapter = makeOpenAIAdapter({ apiKey: 'test-key' });
try {
  const result = await llmAdapter.complete('Test prompt', {
    maxTokens: 10,
    temperature: 0.7,
  });
  console.log('✅ LLM adapter working:', result);
} catch (error) {
  console.error('❌ LLM adapter failed:', error);
}
```

## Performance Issues

### Memory Leaks

```typescript
// Memory Leak Detection
class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private readonly MAX_SNAPSHOTS = 10;

  takeSnapshot(label: string): void {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    console.log(`📊 Memory snapshot [${label}]:`, {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    });
  }

  detectLeaks(): LeakReport[] {
    const reports: LeakReport[] = [];

    for (let i = 1; i < this.snapshots.length; i++) {
      const current = this.snapshots[i];
      const previous = this.snapshots[i - 1];
      
      const heapGrowth = current.heapUsed - previous.heapUsed;
      const growthPercent = (heapGrowth / previous.heapUsed) * 100;

      if (growthPercent > 10) { // 10% growth threshold
        reports.push({
          startLabel: previous.label,
          endLabel: current.label,
          heapGrowth,
          growthPercent,
          timeDelta: current.timestamp - previous.timestamp,
        });
      }
    }

    return reports;
  }

  printReport(): void {
    const leaks = this.detectLeaks();
    
    if (leaks.length === 0) {
      console.log('✅ No memory leaks detected');
      return;
    }

    console.log('⚠️  Potential memory leaks:');
    leaks.forEach(leak => {
      console.log(`  ${leak.startLabel} → ${leak.endLabel}:`);
      console.log(`    Growth: ${Math.round(leak.heapGrowth / 1024 / 1024)}MB (${leak.growthPercent.toFixed(1)}%)`);
      console.log(`    Time: ${Math.round(leak.timeDelta / 1000)}s`);
    });
  }
}

// Usage
const detector = new MemoryLeakDetector();

detector.takeSnapshot('start');
// ... run operations
detector.takeSnapshot('after-operation-1');
// ... more operations
detector.takeSnapshot('after-operation-2');

detector.printReport();
```

### Performance Bottlenecks

```typescript
// Performance Profiler
class PerformanceProfiler {
  private profiles = new Map<string, ProfileData[]>();

  startProfile(operation: string): () => void {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    return () => {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const duration = Number(endTime - startTime) / 1000000; // Convert to ms
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      const profile: ProfileData = {
        operation,
        duration,
        memoryDelta,
        timestamp: Date.now(),
      };

      const profiles = this.profiles.get(operation) || [];
      profiles.push(profile);
      
      // Keep only last 100 profiles per operation
      if (profiles.length > 100) {
        profiles.shift();
      }
      
      this.profiles.set(operation, profiles);
    };
  }

  getReport(operation: string): PerformanceReport {
    const profiles = this.profiles.get(operation) || [];
    
    if (profiles.length === 0) {
      return { operation, count: 0, avgDuration: 0, maxDuration: 0 };
    }

    const durations = profiles.map(p => p.duration);
    const memoryDeltas = profiles.map(p => p.memoryDelta);

    return {
      operation,
      count: profiles.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      avgMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      maxMemoryDelta: Math.max(...memoryDeltas),
    };
  }

  printAllReports(): void {
    console.log('📊 Performance Report:');
    
    for (const [operation] of this.profiles) {
      const report = this.getReport(operation);
      console.log(`  ${operation}:`);
      console.log(`    Count: ${report.count}`);
      console.log(`    Avg Duration: ${report.avgDuration.toFixed(2)}ms`);
      console.log(`    Max Duration: ${report.maxDuration.toFixed(2)}ms`);
      console.log(`    Avg Memory: ${Math.round(report.avgMemoryDelta / 1024)}KB`);
      console.log(`    Max Memory: ${Math.round(report.maxMemoryDelta / 1024)}KB`);
    }
  }
}

// Usage
const profiler = new PerformanceProfiler();

const endProfile = profiler.startProfile('context-compilation');
// ... perform context compilation
endProfile();

profiler.printAllReports();
```

## Security Issues

### Authentication Failures

```typescript
// Authentication Troubleshooting
class AuthTroubleshooter {
  async diagnoseAuth(config: AuthConfig): Promise<AuthDiagnosis> {
    const diagnosis: AuthDiagnosis = {
      configValid: true,
      tokenValid: false,
      permissionsValid: false,
      networkConnectivity: false,
    };

    // 1. Validate configuration
    try {
      this.validateAuthConfig(config);
    } catch (error) {
      diagnosis.configValid = false;
      diagnosis.configError = error.message;
    }

    // 2. Test token generation
    if (diagnosis.configValid) {
      try {
        const token = this.generateTestToken(config);
        diagnosis.testToken = token;
        diagnosis.tokenValid = true;
      } catch (error) {
        diagnosis.tokenError = error.message;
      }
    }

    // 3. Test permissions
    if (diagnosis.tokenValid) {
      try {
        const permissions = this.validatePermissions(diagnosis.testToken!);
        diagnosis.permissionsValid = permissions.valid;
        diagnosis.permissions = permissions.list;
      } catch (error) {
        diagnosis.permissionsError = error.message;
      }
    }

    // 4. Test network connectivity
    try {
      await this.testNetworkConnectivity(config);
      diagnosis.networkConnectivity = true;
    } catch (error) {
      diagnosis.networkError = error.message;
    }

    return diagnosis;
  }

  private validateAuthConfig(config: AuthConfig): void {
    if (!config.secretKey || config.secretKey.length < 32) {
      throw new Error('Invalid or missing secret key');
    }

    if (!config.algorithm || !['HS256', 'RS256'].includes(config.algorithm)) {
      throw new Error('Invalid algorithm specified');
    }
  }

  private generateTestToken(config: AuthConfig): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 'test-user', roles: ['test'] },
      config.secretKey,
      { algorithm: config.algorithm, expiresIn: '1h' }
    );
  }

  private async testNetworkConnectivity(config: AuthConfig): Promise<void> {
    if (config.authUrl) {
      const response = await fetch(config.authUrl, {
        method: 'HEAD',
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`Auth server responded with ${response.status}`);
      }
    }
  }

  printDiagnosis(diagnosis: AuthDiagnosis): void {
    console.log('🔍 Authentication Diagnosis:');
    
    console.log(`  Configuration: ${diagnosis.configValid ? '✅' : '❌'}`);
    if (diagnosis.configError) {
      console.log(`    Error: ${diagnosis.configError}`);
    }

    console.log(`  Token Generation: ${diagnosis.tokenValid ? '✅' : '❌'}`);
    if (diagnosis.tokenError) {
      console.log(`    Error: ${diagnosis.tokenError}`);
    }

    console.log(`  Permissions: ${diagnosis.permissionsValid ? '✅' : '❌'}`);
    if (diagnosis.permissionsError) {
      console.log(`    Error: ${diagnosis.permissionsError}`);
    }

    console.log(`  Network: ${diagnosis.networkConnectivity ? '✅' : '❌'}`);
    if (diagnosis.networkError) {
      console.log(`    Error: ${diagnosis.networkError}`);
    }
  }
}
```

### Input Validation Issues

```typescript
// Input Validation Troubleshooter
class ValidationTroubleshooter {
  troubleshootValidation(input: unknown, schema: any): ValidationDiagnosis {
    const diagnosis: ValidationDiagnosis = {
      inputType: typeof input,
      inputSize: 0,
      schemaValid: false,
      sanitized: false,
      issues: [],
    };

    // 1. Analyze input
    diagnosis.inputType = typeof input;
    diagnosis.inputSize = JSON.stringify(input).length;

    // 2. Test schema validation
    try {
      const validated = schema.parse(input);
      diagnosis.schemaValid = true;
      diagnosis.validatedInput = validated;
    } catch (error) {
      diagnosis.schemaError = error.message;
      diagnosis.validationIssues = error.errors || [];
    }

    // 3. Test sanitization
    try {
      const sanitized = this.sanitizeInput(input);
      diagnosis.sanitized = true;
      diagnosis.sanitizedInput = sanitized;
    } catch (error) {
      diagnosis.sanitizationError = error.message;
    }

    // 4. Check for common issues
    diagnosis.issues = this.checkCommonIssues(input);

    return diagnosis;
  }

  private checkCommonIssues(input: unknown): string[] {
    const issues: string[] = [];
    const inputStr = JSON.stringify(input);

    // Check for prototype pollution
    if (inputStr.includes('__proto__') || inputStr.includes('constructor')) {
      issues.push('Potential prototype pollution detected');
    }

    // Check for XSS
    if (/<script|javascript:|data:/i.test(inputStr)) {
      issues.push('Potential XSS vectors detected');
    }

    // Check for path traversal
    if (/\.\./.test(inputStr)) {
      issues.push('Potential path traversal detected');
    }

    // Check for SQL injection
    if (/union.*select|drop.*table/i.test(inputStr)) {
      issues.push('Potential SQL injection detected');
    }

    return issues;
  }

  printDiagnosis(diagnosis: ValidationDiagnosis): void {
    console.log('🔍 Validation Diagnosis:');
    console.log(`  Input Type: ${diagnosis.inputType}`);
    console.log(`  Input Size: ${diagnosis.inputSize} bytes`);
    console.log(`  Schema Validation: ${diagnosis.schemaValid ? '✅' : '❌'}`);
    if (diagnosis.schemaError) {
      console.log(`    Error: ${diagnosis.schemaError}`);
    }
    console.log(`  Sanitization: ${diagnosis.sanitized ? '✅' : '❌'}`);
    if (diagnosis.sanitizationError) {
      console.log(`    Error: ${diagnosis.sanitizationError}`);
    }

    if (diagnosis.issues.length > 0) {
      console.log('  Security Issues:');
      diagnosis.issues.forEach(issue => {
        console.log(`    ⚠️  ${issue}`);
      });
    }
  }
}
```

## Integration Issues

### Database Connection Problems

```typescript
// Database Troubleshooter
class DatabaseTroubleshooter {
  async diagnoseConnection(config: DatabaseConfig): Promise<DatabaseDiagnosis> {
    const diagnosis: DatabaseDiagnosis = {
      configValid: false,
      connectionWorking: false,
      authenticationWorking: false,
      permissionsWorking: false,
      performance: null,
    };

    // 1. Validate configuration
    diagnosis.configValid = this.validateDatabaseConfig(config);

    // 2. Test basic connection
    if (diagnosis.configValid) {
      try {
        const client = await this.createConnection(config);
        await client.admin().ping();
        diagnosis.connectionWorking = true;
        await client.close();
      } catch (error) {
        diagnosis.connectionError = error.message;
      }
    }

    // 3. Test authentication
    if (diagnosis.connectionWorking) {
      try {
        const client = await this.createConnection(config);
        await client.db('admin').command({ ping: 1 });
        diagnosis.authenticationWorking = true;
        await client.close();
      } catch (error) {
        diagnosis.authenticationError = error.message;
      }
    }

    // 4. Test permissions
    if (diagnosis.authenticationWorking) {
      try {
        const client = await this.createConnection(config);
        await client.db(config.database).listCollections();
        diagnosis.permissionsWorking = true;
        await client.close();
      } catch (error) {
        diagnosis.permissionsError = error.message;
      }
    }

    // 5. Test performance
    if (diagnosis.permissionsWorking) {
      diagnosis.performance = await this.testPerformance(config);
    }

    return diagnosis;
  }

  private async testPerformance(config: DatabaseConfig): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      const client = await this.createConnection(config);
      
      // Test query performance
      const queryStart = Date.now();
      await client.db(config.database).collection('test').findOne({});
      const queryTime = Date.now() - queryStart;

      // Test insert performance
      const insertStart = Date.now();
      await client.db(config.database).collection('test').insertOne({ test: true });
      const insertTime = Date.now() - insertStart;

      await client.close();

      return {
        connectionTime: Date.now() - startTime,
        queryTime,
        insertTime,
        overall: Date.now() - startTime,
      };
    } catch (error) {
      return {
        connectionTime: Date.now() - startTime,
        queryTime: -1,
        insertTime: -1,
        overall: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  printDiagnosis(diagnosis: DatabaseDiagnosis): void {
    console.log('🔍 Database Diagnosis:');
    console.log(`  Configuration: ${diagnosis.configValid ? '✅' : '❌'}`);
    console.log(`  Connection: ${diagnosis.connectionWorking ? '✅' : '❌'}`);
    if (diagnosis.connectionError) {
      console.log(`    Error: ${diagnosis.connectionError}`);
    }
    console.log(`  Authentication: ${diagnosis.authenticationWorking ? '✅' : '❌'}`);
    if (diagnosis.authenticationError) {
      console.log(`    Error: ${diagnosis.authenticationError}`);
    }
    console.log(`  Permissions: ${diagnosis.permissionsWorking ? '✅' : '❌'}`);
    if (diagnosis.permissionsError) {
      console.log(`    Error: ${diagnosis.permissionsError}`);
    }

    if (diagnosis.performance) {
      console.log('  Performance:');
      console.log(`    Connection: ${diagnosis.performance.connectionTime}ms`);
      console.log(`    Query: ${diagnosis.performance.queryTime}ms`);
      console.log(`    Insert: ${diagnosis.performance.insertTime}ms`);
      console.log(`    Overall: ${diagnosis.performance.overall}ms`);
    }
  }
}
```

## Environment-Specific Issues

### Development Environment

```bash
# Common development issues and solutions

# Issue: Port conflicts
Error: listen EADDRINUSE :::3000

# Solutions:
# 1. Find process using port
lsof -i :3000
netstat -tulpn | grep :3000

# 2. Kill process
kill -9 <PID>

# 3. Use different port
PORT=3001 npm start

# Issue: Module not found in monorepo
Error: Cannot find module '../packages/pantheon-core'

# Solutions:
# 1. Check workspace configuration
cat pnpm-workspace.yaml

# 2. Install dependencies
pnpm install
pnpm --filter @promethean-os/pantheon-core build

# 3. Check TypeScript paths
cat tsconfig.json | grep paths
```

### Production Environment

```bash
# Common production issues and solutions

# Issue: Out of memory errors
Error: JavaScript heap out of memory

# Solutions:
# 1. Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# 2. Use PM2 cluster mode
pm2 start ecosystem.config.js --env production

# 3. Enable memory monitoring
pm2 install pm2-server-monit

# Issue: Database connection limits
Error: Connection pool exhausted

# Solutions:
# 1. Increase connection pool size
MONGODB_POOL_SIZE=20

# 2. Enable connection reuse
MONGODB_REUSE_CONNECTIONS=true

# 3. Add connection timeout
MONGODB_CONNECT_TIMEOUT_MS=30000
```

## Debugging Tools

### Logging Configuration

```typescript
// Comprehensive Logging Setup
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'pantheon',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Debug logging utility
export const debugLogger = {
  context: (message: string, data?: any) => {
    logger.debug('Context', { message, data });
  },
  actor: (actorId: string, message: string, data?: any) => {
    logger.debug('Actor', { actorId, message, data });
  },
  performance: (operation: string, duration: number, data?: any) => {
    logger.info('Performance', { operation, duration, data });
  },
  security: (event: string, data?: any) => {
    logger.warn('Security', { event, data });
  },
};
```

### Health Check Endpoint

```typescript
// Health Check Implementation
app.get('/health', async (req, res) => {
  const health: HealthReport = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    checks: {},
  };

  try {
    // Database health
    health.checks.database = await checkDatabaseHealth();

    // Memory health
    health.checks.memory = checkMemoryHealth();

    // LLM health
    health.checks.llm = await checkLLMHealth();

    // Overall status
    const allHealthy = Object.values(health.checks)
      .every(check => check.status === 'healthy');

    health.status = allHealthy ? 'healthy' : 'unhealthy';

    res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
});

async function checkDatabaseHealth(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    await db.admin().ping();
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime,
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`,
    };
  }
}

function checkMemoryHealth(): HealthCheck {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  return {
    status: usagePercent < 90 ? 'healthy' : 'unhealthy',
    usage: {
      heapUsed: Math.round(heapUsedMB),
      heapTotal: Math.round(heapTotalMB),
      usagePercent: Math.round(usagePercent),
    },
    message: `Memory usage: ${usagePercent.toFixed(1)}%`,
  };
}
```

## Getting Help

### Support Channels

```typescript
// Support Information Collection
class SupportHelper {
  async generateSupportRequest(issueDescription: string): Promise<SupportRequest> {
    const systemInfo = await this.collectSystemInfo();
    const logs = await this.collectRecentLogs();
    const diagnostics = await this.runDiagnostics();

    return {
      timestamp: new Date().toISOString(),
      issueDescription,
      systemInfo,
      logs,
      diagnostics,
      environment: process.env.NODE_ENV || 'unknown',
    };
  }

  private async collectSystemInfo(): Promise<SystemInfo> {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      npmVersion: await this.getNpmVersion(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: process.memoryUsage(),
      },
      cpu: os.cpus(),
      loadAverage: os.loadavg(),
    };
  }

  private async collectRecentLogs(): Promise<string[]> {
    const logFiles = ['logs/combined.log', 'logs/error.log'];
    const logs: string[] = [];

    for (const logFile of logFiles) {
      try {
        const content = await fs.readFile(logFile, 'utf8');
        const lines = content.split('\n').slice(-50); // Last 50 lines
        logs.push(...lines);
      } catch (error) {
        logs.push(`Error reading ${logFile}: ${error.message}`);
      }
    }

    return logs;
  }

  private async runDiagnostics(): Promise<DiagnosticResult[]> {
    const diagnostics: DiagnosticResult[] = [];

    // Test database connection
    try {
      await db.admin().ping();
      diagnostics.push({
        test: 'database',
        status: 'pass',
        message: 'Database connection successful',
      });
    } catch (error) {
      diagnostics.push({
        test: 'database',
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
      });
    }

    // Test LLM availability
    try {
      const modelManager = new LocalModelManager({ modelPath: './models' });
      const models = modelManager.getAvailableModels();
      diagnostics.push({
        test: 'llm',
        status: 'pass',
        message: `Found ${models.length} available models`,
      });
    } catch (error) {
      diagnostics.push({
        test: 'llm',
        status: 'fail',
        message: `LLM initialization failed: ${error.message}`,
      });
    }

    return diagnostics;
  }
}
```

### Community Resources

- **Documentation**: [Pantheon Docs](https://docs.promethean.ai/pantheon)
- **GitHub Issues**: [Report Issues](https://github.com/promethean-os/promethean/issues)
- **Discord Community**: [Join Discord](https://discord.gg/promethean)
- **Stack Overflow**: [Tag: pantheon](https://stackoverflow.com/questions/tagged/pantheon)
- **Email Support**: support@promethean.ai

## Conclusion

This comprehensive troubleshooting guide provides systematic approaches to diagnosing and resolving Pantheon issues. Key principles:

1. **Systematic Diagnosis**: Follow structured troubleshooting steps
2. **Comprehensive Logging**: Log relevant information for debugging
3. **Performance Monitoring**: Track system performance metrics
4. **Health Checks**: Implement health monitoring for early detection
5. **Community Support**: Leverage community resources for complex issues

By following these troubleshooting patterns, you can quickly identify and resolve issues while maintaining system stability and performance.