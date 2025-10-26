# AI Troubleshooting Guide

Comprehensive troubleshooting guide for TaskAIManager and AI-assisted task management.

## Common Issues and Solutions

### 1. Connection and Setup Issues

#### Ollama Service Not Running

**Symptoms**:

- `Error: Failed to connect to Ollama service`
- `ECONNREFUSED` connection errors
- Timeout errors during AI operations

**Diagnosis**:

```bash
# Check if Ollama is running
ps aux | grep ollama

# Check if port is available
netstat -tlnp | grep :11434

# Test Ollama API directly
curl http://localhost:11434/api/tags
```

**Solutions**:

1. **Start Ollama Service**:

   ```bash
   # Start Ollama in background
   ollama serve &

   # Or start with specific configuration
   ollama serve --host 0.0.0.0 --port 11434
   ```

2. **Install Ollama**:

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Verify installation
   ollama --version
   ```

3. **Check Firewall/Network**:

   ```bash
   # Allow port through firewall (ufw)
   sudo ufw allow 11434

   # Check if port is blocked
   telnet localhost 11434
   ```

#### Model Not Available

**Symptoms**:

- `Error: Model 'qwen3:8b' not found`
- `404 Model not found` responses
- Analysis returns empty or malformed results

**Diagnosis**:

```bash
# List available models
ollama list

# Check if specific model exists
ollama show qwen3:8b
```

**Solutions**:

1. **Pull Required Model**:

   ```bash
   # Pull the default model
   ollama pull qwen3:8b

   # Or pull alternative models
   ollama pull llama2
   ollama pull codellama
   ```

2. **Update Model Configuration**:

   ```typescript
   const aiManager = new TaskAIManager({
     model: 'llama2', // Use available model
     baseUrl: 'http://localhost:11434',
   });
   ```

3. **Use Different Model Source**:

   ```bash
   # Pull from different registry
   ollama pull mistral/mistral-7b

   # List all available models
   ollama list
   ```

### 2. Performance Issues

#### Slow Response Times

**Symptoms**:

- Operations taking > 60 seconds
- Frequent timeout errors
- Poor user experience

**Diagnosis**:

```typescript
// Monitor response times
const startTime = Date.now();
const result = await aiManager.analyzeTask(request);
const responseTime = Date.now() - startTime;
console.log(`Response time: ${responseTime}ms`);
```

**Solutions**:

1. **Optimize Configuration**:

   ```typescript
   const aiManager = new TaskAIManager({
     timeout: 120000,        // Increase timeout
     maxTokens: 2048,        // Reduce token usage
     temperature: 0.1         // More deterministic
     model: 'llama2'         // Use faster model
   });
   ```

2. **System Optimization**:

   ```bash
   # Check system resources
   htop
   df -h

   # Monitor Ollama resource usage
   ps aux | grep ollama

   # Increase memory if needed
   # Add swap space or increase RAM
   ```

3. **Request Optimization**:

   ```typescript
   // Use simpler analysis types
   const result = await aiManager.analyzeTask({
     uuid: 'task-123',
     analysisType: 'quality', // Faster than 'complexity'
   });

   // Reduce context size
   const result = await aiManager.analyzeTask({
     uuid: 'task-123',
     analysisType: 'quality',
     context: {
       // Only essential context
       projectInfo: 'E-commerce platform',
     },
   });
   ```

#### Memory Issues

**Symptoms**:

- Out of memory errors
- System crashes during AI operations
- High memory usage

**Diagnosis**:

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Monitor during AI operation
watch -n 1 'free -h'
```

**Solutions**:

1. **Reduce Model Size**:

   ```bash
   # Use smaller models
   ollama pull qwen3:4b
   ollama pull gemma:2b
   ```

2. **Optimize Token Usage**:

   ```typescript
   const aiManager = new TaskAIManager({
     maxTokens: 1024, // Reduce memory usage
     timeout: 30000,
   });
   ```

3. **System Configuration**:

   ```bash
   # Add swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile

   # Configure Ollama memory limits
   ollama serve --max-ram 4G
   ```

### 3. Task and Content Issues

#### Task Not Found

**Symptoms**:

- `Error: Task ${uuid} not found`
- Analysis returns null/undefined
- File system errors

**Diagnosis**:

```typescript
// Verify task exists
const contentManager = createTaskContentManager('./docs/agile/tasks');
const task = await contentManager.readTask(uuid);

if (!task) {
  console.error(`Task ${uuid} not found`);
  // List available tasks
  const allTasks = await getAllTasks();
  console.log(
    'Available tasks:',
    allTasks.map((t) => t.uuid),
  );
}
```

**Solutions**:

1. **Verify Task UUID**:

   ```bash
   # Find task file
   find docs/agile/tasks -name "*.md" -exec grep -l "uuid: ${uuid}" {} \;

   # Check task content
   grep -r "uuid: ${uuid}" docs/agile/tasks/
   ```

2. **Check File Structure**:

   ```bash
   # Verify task directory structure
   ls -la docs/agile/tasks/

   # Check file permissions
   ls -la docs/agile/tasks/*.md
   ```

3. **Recreate Task if Needed**:

   ```typescript
   // Create missing task
   const newTask = {
     uuid: 'missing-uuid',
     title: 'Recovered Task',
     status: 'todo',
     content: 'Task content recovered from backup',
     created_at: new Date().toISOString(),
   };

   await contentManager.writeTask(newTask);
   ```

#### Invalid Task Content

**Symptoms**:

- Parsing errors in task content
- Frontmatter validation failures
- Malformed markdown

**Diagnosis**:

```typescript
// Validate task structure
import { parseTaskContent, validateTaskContent } from './parser.js';

const parsed = parseTaskContent(task.content);
const validation = validateTaskContent(task.content);

if (!validation.valid) {
  console.error('Task validation errors:', validation.errors);
  console.error('Task validation warnings:', validation.warnings);
}
```

**Solutions**:

1. **Fix Frontmatter**:

   ```yaml
   ---
   uuid: task-123
   title: 'Valid Task Title'
   status: todo
   priority: medium
   created_at: '2024-01-01T00:00:00.000Z'
   labels: [bug, enhancement]
   ---
   # Task content here
   ```

2. **Validate Markdown**:

   ```typescript
   // Use markdown parser
   import { marked } from 'marked';

   try {
     const html = marked(task.content);
     console.log('Markdown is valid');
   } catch (error) {
     console.error('Invalid markdown:', error);
   }
   ```

3. **Use Content Manager**:

   ```typescript
   // Let content manager handle validation
   const result = await contentManager.updateTaskBody({
     uuid: task.uuid,
     content: newContent,
     options: {
       validateStructure: true,
       createBackup: true,
     },
   });

   if (!result.success) {
     console.error('Update failed:', result.error);
   }
   ```

### 4. AI Response Issues

#### Poor Quality Responses

**Symptoms**:

- Generic or unhelpful suggestions
- Low analysis scores
- Irrelevant recommendations

**Diagnosis**:

```typescript
// Analyze response quality
const result = await aiManager.analyzeTask(request);

if (result.success) {
  const { suggestions, risks, dependencies } = result.analysis;

  // Check for generic responses
  const genericSuggestions = suggestions.filter(
    (s) => s.includes('consider') || s.includes('ensure') || s.length < 10,
  );

  if (genericSuggestions.length > suggestions.length * 0.5) {
    console.warn('AI response appears generic');
  }
}
```

**Solutions**:

1. **Improve Prompts**:

   ```typescript
   // Add context to requests
   const result = await aiManager.analyzeTask({
     uuid: 'task-123',
     analysisType: 'quality',
     context: {
       projectInfo: 'E-commerce platform with React and Node.js',
       teamContext: 'Senior developers with 5+ years experience',
       deadlines: ['2024-03-15'],
       dependencies: ['Database schema approval', 'API design review'],
     },
   });
   ```

2. **Adjust Temperature**:

   ```typescript
   // Lower temperature for more deterministic responses
   const aiManager = new TaskAIManager({
     temperature: 0.1, // More deterministic
     maxTokens: 2048, // Shorter, focused responses
   });
   ```

3. **Use Specialized Models**:
   ```typescript
   // Use different models for different tasks
   const securityAI = new TaskAIManager({ model: 'gpt-4' });
   const documentationAI = new TaskAIManager({ model: 'codellama' });
   ```

#### Inconsistent Results

**Symptoms**:

- Different results for same input
- Non-deterministic behavior
- Random quality variations

**Diagnosis**:

```typescript
// Test consistency
const results = await Promise.all([
  aiManager.analyzeTask({ uuid: 'test', analysisType: 'quality' }),
  aiManager.analyzeTask({ uuid: 'test', analysisType: 'quality' }),
  aiManager.analyzeTask({ uuid: 'test', analysisType: 'quality' }),
]);

const scores = results.map((r) => r.analysis.qualityScore);
const variance = Math.max(...scores) - Math.min(...scores);

if (variance > 20) {
  console.warn('High variance in results:', scores);
}
```

**Solutions**:

1. **Lower Temperature**:

   ```typescript
   const aiManager = new TaskAIManager({
     temperature: 0.0, // Maximum determinism
   });
   ```

2. **Use Same Seed**:

   ```typescript
   // Note: This requires custom model implementation
   const aiManager = new TaskAIManager({
     seed: 42, // Consistent random seed
   });
   ```

3. **Cache Results**:

   ```typescript
   const cache = new Map();

   async function cachedAnalysis(uuid: string, analysisType: string) {
     const key = `${uuid}-${analysisType}`;

     if (cache.has(key)) {
       return cache.get(key);
     }

     const result = await aiManager.analyzeTask({ uuid, analysisType });
     cache.set(key, result);
     return result;
   }
   ```

### 5. Integration Issues

#### Git Hook Failures

**Symptoms**:

- Pre-commit hooks failing
- Git operations blocked
- CI/CD pipeline failures

**Diagnosis**:

```bash
# Test git hook manually
cd /path/to/repo
./.git/hooks/pre-commit

# Check hook permissions
ls -la .git/hooks/
chmod +x .git/hooks/pre-commit

# Test with sample commit
git commit --allow-empty -m "Test commit"
```

**Solutions**:

1. **Fix Hook Permissions**:

   ```bash
   # Make hooks executable
   chmod +x .git/hooks/*

   # Check hook shebang
   head -n 1 .git/hooks/pre-commit
   ```

2. **Debug Hook Script**:

   ```bash
   # Run hook with debug output
   DEBUG=* ./git/hooks/pre-commit

   # Check Node.js version
   node --version
   which node
   ```

3. **Update Hook Dependencies**:

   ```bash
   # Install dependencies in hook directory
   cd .git/hooks
   npm install

   # Or use absolute paths
   #!/usr/bin/env node
   require('/absolute/path/to/ai-hook.js');
   ```

#### API Integration Failures

**Symptoms**:

- HTTP 500 errors
- Request timeouts
- Malformed responses

**Diagnosis**:

```typescript
// Test API endpoint directly
const response = await fetch('http://localhost:3000/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uuid: 'test-123',
    analysisType: 'quality',
  }),
});

console.log('Response status:', response.status);
console.log('Response body:', await response.text());
```

**Solutions**:

1. **Check Server Logs**:

   ```bash
   # Check application logs
   tail -f logs/app.log
   tail -f logs/error.log

   # Check Ollama logs
   journalctl -u ollama -f
   ```

2. **Verify Request Format**:

   ```typescript
   // Validate request before sending
   const request = {
     uuid: 'task-123',
     analysisType: 'quality',
   };

   if (!request.uuid || !request.analysisType) {
     throw new Error('Invalid request format');
   }
   ```

3. **Check Network Connectivity**:

   ```bash
   # Test connection to AI service
   curl -v http://localhost:11434/api/tags

   # Test connection to API
   curl -v http://localhost:3000/api/health

   # Check firewall rules
   sudo iptables -L | grep 11434
   sudo iptables -L | grep 3000
   ```

### 6. Environment-Specific Issues

#### Development Environment

**Common Issues**:

- Inconsistent model availability
- Variable performance
- Debugging overhead

**Solutions**:

1. **Use Mock AI Manager**:

   ```typescript
   import { MockTaskAIManager } from './test/mock-ai-manager.js';

   // Use mock in development
   const aiManager =
     process.env.NODE_ENV === 'development' ? new MockTaskAIManager() : new TaskAIManager();
   ```

2. **Development Configuration**:
   ```typescript
   const devConfig = {
     model: 'qwen3:4b',     // Faster for development
     timeout: 30000,         // Shorter timeouts
     maxTokens: 1024,         // Reduce costs
     temperature: 0.2          // Some creativity
     baseUrl: 'http://localhost:11434'
   };
   ```

#### Production Environment

**Common Issues**:

- Resource constraints
- High availability requirements
- Monitoring gaps

**Solutions**:

1. **Production Configuration**:

   ```typescript
   const prodConfig = {
     model: 'qwen3:8b', // Higher quality
     timeout: 120000, // Longer timeouts
     maxTokens: 4096, // Comprehensive responses
     temperature: 0.1, // More deterministic
     baseUrl: process.env.OLLAMA_URL || 'http://ollama:11434',
   };
   ```

2. **Monitoring Setup**:

   ```typescript
   // Add comprehensive monitoring
   const monitoredAI = createMonitoredAIManager(prodConfig);

   // Set up alerts
   setInterval(() => {
     const metrics = monitoredAI.getMetrics();

     if (metrics.errorRate > 0.1) {
       alert('High error rate detected');
     }

     if (metrics.avgResponseTime > 60000) {
       alert('Slow response times detected');
     }
   }, 60000); // Check every minute
   ```

3. **Health Checks**:
   ```typescript
   // Implement health check endpoint
   app.get('/api/ai/health', async (req, res) => {
     try {
       const testResult = await aiManager.analyzeTask({
         uuid: 'health-check',
         analysisType: 'quality',
       });

       res.json({
         status: testResult.success ? 'healthy' : 'unhealthy',
         timestamp: new Date().toISOString(),
         model: aiManager.config.model,
       });
     } catch (error) {
       res.status(500).json({
         status: 'unhealthy',
         error: error.message,
       });
     }
   });
   ```

## Debugging Tools

### Logging Configuration

```typescript
// Enable detailed logging
const aiManager = new TaskAIManager({
  // ... other config
});

// Wrap methods for logging
const loggedAIManager = {
  async analyzeTask(request) {
    console.log(`[AI] Starting analysis: ${request.uuid} - ${request.analysisType}`);
    const start = Date.now();

    try {
      const result = await aiManager.analyzeTask(request);
      const duration = Date.now() - start;

      console.log(`[AI] Analysis completed: ${result.success} in ${duration}ms`);
      if (!result.success) {
        console.error(`[AI] Analysis failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(`[AI] Analysis error:`, error);
      throw error;
    }
  },
};
```

### Performance Monitoring

```typescript
// Monitor AI performance
class AIPerformanceMonitor {
  private metrics = {
    requests: 0,
    errors: 0,
    totalTime: 0,
    minTime: Infinity,
    maxTime: 0,
  };

  record(duration: number, success: boolean) {
    this.metrics.requests++;
    this.metrics.totalTime += duration;
    this.metrics.minTime = Math.min(this.metrics.minTime, duration);
    this.metrics.maxTime = Math.max(this.metrics.maxTime, duration);

    if (!success) {
      this.metrics.errors++;
    }

    // Log performance warnings
    if (duration > 60000) {
      console.warn(`[AI] Slow operation: ${duration}ms`);
    }

    if (this.metrics.errors / this.metrics.requests > 0.1) {
      console.warn(`[AI] High error rate: ${this.metrics.errors / this.metrics.requests}`);
    }
  }

  getReport() {
    const avgTime = this.metrics.totalTime / this.metrics.requests;
    const errorRate = this.metrics.errors / this.metrics.requests;

    return {
      totalRequests: this.metrics.requests,
      errorRate: `${(errorRate * 100).toFixed(1)}%`,
      avgTime: `${avgTime.toFixed(0)}ms`,
      minTime: `${this.metrics.minTime}ms`,
      maxTime: `${this.metrics.maxTime}ms`,
    };
  }
}

// Usage
const monitor = new AIPerformanceMonitor();

const originalAnalyze = aiManager.analyzeTask.bind(aiManager);
aiManager.analyzeTask = async function (request) {
  const start = Date.now();
  try {
    const result = await originalAnalyze(request);
    monitor.record(Date.now() - start, result.success);
    return result;
  } catch (error) {
    monitor.record(Date.now() - start, false);
    throw error;
  }
};
```

### Health Check Script

```bash
#!/bin/bash
# ai-health-check.sh - Comprehensive AI system health check

echo "=== AI System Health Check ==="
echo

# Check Ollama service
echo "1. Checking Ollama service..."
if pgrep -x "ollama" > /dev/null; then
    echo "✅ Ollama is running"
    OLLAMA_PID=$(pgrep -x "ollama")
    echo "   PID: $OLLAMA_PID"
else
    echo "❌ Ollama is not running"
    echo "   Starting Ollama..."
    ollama serve &
    sleep 5
fi

# Check model availability
echo "2. Checking model availability..."
if ollama list | grep -q "qwen3:8b"; then
    echo "✅ qwen3:8b model is available"
else
    echo "❌ qwen3:8b model not found"
    echo "   Pulling qwen3:8b..."
    ollama pull qwen3:8b
fi

# Check API connectivity
echo "3. Checking API connectivity..."
if curl -s -f http://localhost:11434/api/tags > /dev/null; then
    echo "✅ API is accessible"
else
    echo "❌ API is not accessible"
    echo "   Checking port availability..."
    netstat -tlnp | grep :11434 || echo "   Port 11434 is not listening"
fi

# Check system resources
echo "4. Checking system resources..."
MEMORY=$(free -h | awk '/^Mem:/ {print $7}')
echo "   Available memory: $MEMORY"

CPU_LOAD=$(uptime | awk -F'load average:' '{print $4}' | awk '{print $1}')
echo "   CPU load: $CPU_LOAD"

# Check disk space
DISK=$(df -h / | awk 'NR==2 {print $4}')
echo "   Available disk: $DISK"

# Test AI functionality
echo "5. Testing AI functionality..."
echo "   Creating test task..."
TEST_UUID="health-check-$(date +%s)"

# Create a simple test task file
cat > "docs/agile/tasks/${TEST_UUID}.md" << EOF
---
uuid: ${TEST_UUID}
title: "Health Check Task"
status: todo
priority: medium
created_at: "$(date -Iseconds)"
---

This is a health check task to verify AI functionality.
EOF

echo "   Testing task analysis..."
if node -e "
const { TaskAIManager } = require('./dist/lib/task-content/ai.js');
const manager = new TaskAIManager({ timeout: 30000 });

manager.analyzeTask({
  uuid: '${TEST_UUID}',
  analysisType: 'quality'
}).then(result => {
  if (result.success) {
    console.log('✅ AI analysis successful');
    console.log('   Quality score:', result.analysis.qualityScore);
    process.exit(0);
  } else {
    console.log('❌ AI analysis failed');
    console.log('   Error:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.log('❌ AI analysis error');
  console.log('   Error:', error.message);
  process.exit(1);
});
"; then
    echo "✅ AI functionality test passed"
else
    echo "❌ AI functionality test failed"
fi

# Cleanup
echo "6. Cleaning up..."
rm -f "docs/agile/tasks/${TEST_UUID}.md"

echo
echo "=== Health Check Complete ==="
```

## Recovery Procedures

### Automatic Recovery

```typescript
// Implement automatic recovery
class ResilientTaskAIManager extends TaskAIManager {
  private retryCount = new Map<string, number>();
  private lastFailure = new Map<string, number>();

  async analyzeTask(request) {
    const key = `${request.uuid}-${request.analysisType}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await super.analyzeTask(request);

        if (result.success) {
          this.retryCount.delete(key);
          return result;
        }

        // Check if we should retry
        if (this.shouldRetry(request, result, attempt)) {
          console.warn(`[AI] Attempt ${attempt} failed, retrying...`);
          await this.delay(1000 * attempt); // Exponential backoff
          continue;
        }

        return result;
      } catch (error) {
        console.error(`[AI] Attempt ${attempt} error:`, error);

        if (attempt === 3) {
          // Final attempt failed, use fallback
          return this.getFallbackResult(request);
        }

        await this.delay(1000 * attempt);
      }
    }
  }

  private shouldRetry(request: any, result: any, attempt: number): boolean {
    // Don't retry certain errors
    const nonRetryableErrors = [
      'Task not found',
      'Invalid request format',
      'Authentication failed',
    ];

    if (result.error && nonRetryableErrors.includes(result.error)) {
      return false;
    }

    return attempt < 3;
  }

  private getFallbackResult(request: any) {
    return {
      success: true,
      taskUuid: request.uuid,
      analysisType: request.analysisType,
      analysis: {
        qualityScore: 50,
        suggestions: ['Manual review required due to AI unavailability'],
        risks: ['AI analysis unavailable'],
        dependencies: [],
        subtasks: [],
      },
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: 'fallback-system',
        model: 'none',
        processingTime: 0,
      },
      error: 'AI service unavailable, using fallback analysis',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Manual Recovery

```bash
#!/bin/bash
# ai-recovery.sh - Manual AI system recovery

echo "=== AI System Recovery ==="
echo

# Stop all AI services
echo "1. Stopping AI services..."
pkill -f "ollama"
pkill -f "node.*ai"

# Clear caches
echo "2. Clearing caches..."
rm -rf ~/.cache/ollama/*
rm -rf ./node_modules/.cache/*

# Restart services
echo "3. Restarting services..."
ollama serve &
sleep 10

# Verify models
echo "4. Verifying models..."
ollama list
if ! ollama list | grep -q "qwen3:8b"; then
    echo "   Pulling required model..."
    ollama pull qwen3:8b
fi

# Test functionality
echo "5. Testing functionality..."
./scripts/test-ai-functionality.sh

echo "✅ Recovery complete"
```

This troubleshooting guide provides comprehensive solutions for common issues encountered with the TaskAIManager system.
