# Cross-Platform Compatibility Layer - Code Examples

This document provides practical code examples demonstrating the implementation and usage of the cross-platform compatibility layer.

## 1. Core Platform Detection

### Basic Platform Detection
```typescript
// Detect current platform and capabilities
import { PlatformFactory, FeatureDetectionAPI } from '@promethean-os/platform-core';

async function initializePlatform() {
  // Auto-detect current platform
  const platform = await PlatformFactory.getPlatform();
  
  console.log(`Platform: ${platform.name}`);
  console.log(`Version: ${platform.version}`);
  console.log(`Architecture: ${platform.architecture}`);
  console.log(`Runtime: ${platform.runtime}`);
  
  // Get platform capabilities
  const capabilities = platform.getCapabilities();
  console.log('File System:', capabilities.fileSystem);
  console.log('Network:', capabilities.network);
  console.log('Process:', capabilities.process);
  
  return platform;
}

// Usage
const platform = await initializePlatform();
```

### Feature Detection Examples
```typescript
// Check for specific features
import { FeatureDetectionAPI } from '@promethean-os/platform-core';

async function checkFeatures() {
  const features = new FeatureDetectionAPI();
  
  // Check if file system is available
  const hasFileSystem = await features.isFeatureAvailable('filesystem');
  console.log('File System Available:', hasFileSystem);
  
  // Check for specific capabilities
  const hasWebWorkers = await features.isFeatureAvailable('webworkers');
  const hasSharedArrayBuffer = await features.isFeatureAvailable('sharedarraybuffer');
  
  console.log('Web Workers:', hasWebWorkers);
  console.log('Shared Array Buffer:', hasSharedArrayBuffer);
  
  // Get feature version
  const nodeVersion = await features.getFeatureVersion('node');
  if (nodeVersion) {
    console.log('Node.js Version:', nodeVersion);
  }
  
  // Check multiple requirements
  const requirements = [
    { feature: 'filesystem', version: '1.0.0' },
    { feature: 'network', capabilities: ['http', 'https'] }
  ];
  
  const meetsRequirements = await features.checkRequirements(requirements);
  console.log('Meets Requirements:', meetsRequirements);
}

checkFeatures();
```

## 2. Configuration Management

### Hierarchical Configuration
```typescript
// Configuration management with platform-specific overrides
import { ConfigurationManager, FileConfigurationLayer, EnvironmentConfigurationLayer } from '@promethean-os/platform-core';

async function setupConfiguration() {
  const manager = new ConfigurationManager();
  
  // Add configuration layers in priority order
  manager.addLayer(new EnvironmentConfigurationLayer()); // Priority: 100
  manager.addLayer(new FileConfigurationLayer('./config/default.json', 'json')); // Priority: 200
  manager.addLayer(new FileConfigurationLayer('./config/production.json', 'json')); // Priority: 300
  
  // Get configuration values
  const apiPort = await manager.get('api.port', 3000);
  const dbUrl = await manager.get('database.url');
  
  // Get platform-specific configuration
  const nodeConfig = await manager.getWithPlatform('api.timeout', 'node');
  const browserConfig = await manager.getWithPlatform('api.timeout', 'browser');
  
  console.log('API Port:', apiPort);
  console.log('Database URL:', dbUrl);
  console.log('Node Timeout:', nodeConfig);
  console.log('Browser Timeout:', browserConfig);
  
  return manager;
}

// Configuration file example (config/default.json)
{
  "api": {
    "port": 3000,
    "timeout": 5000
  },
  "database": {
    "url": "${DATABASE_URL}",
    "poolSize": 10
  },
  "logging": {
    "level": "info"
  }
}

// Platform-specific override (config/node.json)
{
  "api": {
    "timeout": 10000
  },
  "database": {
    "poolSize": 20
  }
}
```

### Dynamic Configuration with Validation
```typescript
// Configuration with validation and resolvers
import { ConfigurationManager, IConfigurationResolver, IConfigurationValidator } from '@promethean-os/platform-core';

// Custom resolver for environment variables
class EnvResolver implements IConfigurationResolver {
  async resolve(value: any): Promise<any> {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const envVar = value.slice(2, -1);
      return process.env[envVar] || value;
    }
    return value;
  }
}

// Custom validator for port numbers
class PortValidator implements IConfigurationValidator {
  validate(key: string, value: any): boolean {
    if (key.endsWith('.port')) {
      const port = Number(value);
      return Number.isInteger(port) && port > 0 && port <= 65535;
    }
    return true;
  }
}

async function setupAdvancedConfiguration() {
  const manager = new ConfigurationManager();
  
  // Register custom resolver and validator
  manager.registerResolver('environment', new EnvResolver());
  manager.registerValidator('port', new PortValidator());
  
  // Add configuration layer with custom resolver
  const configLayer = new FileConfigurationLayer('./config/app.json', 'json');
  configLayer.type = 'environment'; // Use custom resolver
  
  manager.addLayer(configLayer);
  
  try {
    const port = await manager.get('server.port');
    console.log('Validated Port:', port);
  } catch (error) {
    console.error('Configuration validation failed:', error.message);
  }
}
```

## 3. File System Abstraction

### Cross-Platform File Operations
```typescript
// File system operations that work across platforms
import { PlatformFactory } from '@promethean-os/platform-core';

async function fileSystemExample() {
  const platform = await PlatformFactory.getPlatform();
  const fs = platform.getFileSystem();
  
  try {
    // Check if file exists
    const exists = await fs.exists('./data/config.json');
    console.log('Config file exists:', exists);
    
    if (exists) {
      // Read file
      const content = await fs.readFile('./data/config.json');
      const config = JSON.parse(content.toString());
      console.log('Configuration:', config);
    } else {
      // Create directory and file
      await fs.mkdir('./data', { recursive: true });
      const defaultConfig = { theme: 'dark', language: 'en' };
      await fs.writeFile('./data/config.json', Buffer.from(JSON.stringify(defaultConfig, null, 2)));
    }
    
    // List directory contents
    const files = await fs.readdir('./data');
    console.log('Files in data directory:', files);
    
    // Get file stats
    const stats = await fs.stat('./data/config.json');
    console.log('File stats:', {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      modified: stats.modified
    });
    
  } catch (error) {
    console.error('File system error:', error);
  }
}

// Browser-specific file handling
async function browserFileExample() {
  const platform = await PlatformFactory.getPlatform();
  const fs = platform.getFileSystem();
  
  // In browser, this might use IndexedDB or File System Access API
  try {
    const data = await fs.readFile('/user-data/preferences.json');
    console.log('User preferences:', JSON.parse(data.toString()));
  } catch (error) {
    console.log('No preferences found, using defaults');
  }
}
```

### File Watching
```typescript
// Cross-platform file watching
import { PlatformFactory } from '@promethean-os/platform-core';

async function watchFiles() {
  const platform = await PlatformFactory.getPlatform();
  const fs = platform.getFileSystem();
  
  // Watch for file changes
  const watcher = fs.watch('./config', { recursive: true });
  
  watcher.on('change', (filePath, stats) => {
    console.log(`File changed: ${filePath}`);
    console.log('New stats:', stats);
    
    // Reload configuration
    reloadConfiguration(filePath);
  });
  
  watcher.on('error', (error) => {
    console.error('Watch error:', error);
  });
  
  console.log('Watching ./config for changes...');
  
  // Cleanup when done
  setTimeout(() => {
    watcher.close();
    console.log('File watcher closed');
  }, 60000); // Watch for 1 minute
}

function reloadConfiguration(filePath: string) {
  // Implementation to reload configuration
  console.log(`Reloading configuration from ${filePath}`);
}
```

## 4. Network Abstraction

### HTTP Requests Across Platforms
```typescript
// Network operations that work everywhere
import { PlatformFactory } from '@promethean-os/platform-core';

async function networkExample() {
  const platform = await PlatformFactory.getPlatform();
  const network = platform.getNetworkManager();
  
  try {
    // Make HTTP request
    const response = await network.request({
      url: 'https://api.example.com/data',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Promethean/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
    } else {
      console.error('Request failed:', response.status, response.statusText);
    }
    
    // POST request with data
    const postResponse = await network.request({
      url: 'https://api.example.com/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Data',
        timestamp: Date.now()
      })
    });
    
    console.log('POST Response:', postResponse.status);
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Platform-specific network features
async function advancedNetworkExample() {
  const platform = await PlatformFactory.getPlatform();
  const network = platform.getNetworkManager();
  
  // Get network interfaces (Node.js only)
  if (platform.name === 'node') {
    const interfaces = network.getNetworkInterfaces();
    console.log('Network interfaces:', interfaces);
  }
  
  // DNS resolution
  try {
    const addresses = await network.resolveHostname('example.com');
    console.log('Resolved addresses:', addresses);
  } catch (error) {
    console.error('DNS resolution failed:', error);
  }
}
```

### Server Creation
```typescript
// Cross-platform server creation
import { PlatformFactory } from '@promethean-os/platform-core';

async function createServer() {
  const platform = await PlatformFactory.getPlatform();
  const network = platform.getNetworkManager();
  
  // Create HTTP server
  const server = network.createServer({
    port: 3000,
    host: '0.0.0.0'
  });
  
  server.on('request', async (request, response) => {
    console.log(`${request.method} ${request.url}`);
    
    if (request.url === '/api/health') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        status: 'healthy',
        platform: platform.name,
        timestamp: Date.now()
      }));
    } else {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not Found');
    }
  });
  
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  await server.start();
  console.log(`Server running on ${platform.name}`);
  
  return server;
}

// Browser-specific server (using Service Worker)
async function createBrowserServer() {
  const platform = await PlatformFactory.getPlatform();
  
  if (platform.name === 'browser') {
    // In browser, this might set up a Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  }
}
```

## 5. Process Management

### Cross-Platform Process Operations
```typescript
// Process management across platforms
import { PlatformFactory } from '@promethean-os/platform-core';

async function processExample() {
  const platform = await PlatformFactory.getPlatform();
  const processManager = platform.getProcessManager();
  
  try {
    // Execute command
    const result = await processManager.exec('ls -la', {
      cwd: './',
      timeout: 5000
    });
    
    console.log('Command output:', result.stdout);
    console.log('Command stderr:', result.stderr);
    console.log('Exit code:', result.code);
    
    // Spawn long-running process
    const childProcess = processManager.spawn('node', ['server.js'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    childProcess.on('stdout', (data) => {
      console.log('Process output:', data.toString());
    });
    
    childProcess.on('stderr', (data) => {
      console.error('Process error:', data.toString());
    });
    
    childProcess.on('exit', (code) => {
      console.log('Process exited with code:', code);
    });
    
    // List running processes
    const processes = await processManager.listProcesses();
    console.log('Running processes:', processes);
    
  } catch (error) {
    console.error('Process error:', error);
  }
}

// Browser process management (Web Workers)
async function browserProcessExample() {
  const platform = await PlatformFactory.getPlatform();
  
  if (platform.name === 'browser') {
    const processManager = platform.getProcessManager();
    
    // Create Web Worker
    const worker = await processManager.spawn('/worker.js', [], {
      type: 'module'
    });
    
    worker.postMessage({ command: 'start', data: { id: 123 } });
    
    worker.onmessage = (event) => {
      console.log('Worker message:', event.data);
    };
    
    // Terminate worker after 10 seconds
    setTimeout(() => {
      processManager.kill(worker.id);
    }, 10000);
  }
}
```

## 6. Error Handling

### Platform-Agnostic Error Handling
```typescript
// Error handling across platforms
import { PlatformFactory, ErrorHandler, PlatformError } from '@promethean-os/platform-core';

async function errorHandlingExample() {
  const platform = await PlatformFactory.getPlatform();
  const errorHandler = new ErrorHandler(new DefaultErrorHandler());
  
  // Register custom error handlers
  errorHandler.registerHandler('FileSystemError', new FileSystemErrorHandler());
  errorHandler.registerHandler('NetworkError', new NetworkErrorHandler());
  
  try {
    const fs = platform.getFileSystem();
    await fs.readFile('/nonexistent/file.txt');
  } catch (error) {
    const result = await errorHandler.handleError(error, {
      platform: platform.name,
      operation: 'readFile',
      parameters: { path: '/nonexistent/file.txt' },
      retryCount: 0,
      timestamp: Date.now()
    });
    
    if (result.recovered) {
      console.log('Error recovered:', result.value);
    } else {
      console.error('Error not recoverable:', result.error);
    }
  }
}

// Custom error handler
class FileSystemErrorHandler implements IErrorHandler {
  async handle(error: Error, context: ErrorContext): Promise<ErrorResult> {
    if (error.code === 'ENOENT') {
      // File not found - create default file
      console.log('Creating default file...');
      return {
        recovered: true,
        value: { created: true, content: '{}' }
      };
    }
    
    if (error.code === 'EACCES') {
      // Permission denied - try alternative location
      console.log('Trying alternative location...');
      return {
        recovered: true,
        value: { alternativePath: '/tmp/default-file.txt' }
      };
    }
    
    return { recovered: false, error };
  }
}

// Error wrapping for operations
async function safeOperation<T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext>
): Promise<T> {
  const platform = await PlatformFactory.getPlatform();
  const errorAPI = platform.getErrorHandlingAPI();
  
  return await errorAPI.wrap(operation, context);
}

// Usage
const result = await safeOperation(
  () => fs.readFile('./config.json'),
  { operation: 'readConfig', retryCount: 0 }
);
```

## 7. Plugin System

### Custom Platform Plugin
```typescript
// Creating a custom platform plugin
import { IPlatformPlugin, PluginContext } from '@promethean-os/platform-core';

class CustomPlatformPlugin implements IPlatformPlugin {
  readonly name = 'custom-platform';
  readonly version = '1.0.0';
  readonly supportedRuntimes = [RuntimeEnvironment.NODE];
  
  async detect(): Promise<boolean> {
    // Detect if this platform is available
    return process.env.CUSTOM_PLATFORM === 'true';
  }
  
  async create(): Promise<IPlatform> {
    return new CustomPlatform();
  }
  
  getFeatureDetectors(): IFeatureDetector[] {
    return [
      new CustomFeatureDetector(),
      new CustomCapabilityDetector()
    ];
  }
  
  getConfigurationLayers(): ConfigurationLayer[] {
    return [
      new CustomConfigurationLayer()
    ];
  }
  
  async initialize(context: PluginContext): Promise<void> {
    // Initialize plugin with context
    console.log('Initializing custom platform plugin...');
    console.log('Platform:', context.platform.name);
    console.log('Features:', await context.features.getAllFeatures());
  }
}

// Custom feature detector
class CustomFeatureDetector implements IFeatureDetector {
  readonly name = 'custom-feature';
  readonly dependencies: string[] = [];
  
  async detect(): Promise<FeatureResult> {
    const available = checkCustomFeatureAvailability();
    
    return {
      available,
      version: available ? '1.0.0' : undefined,
      capabilities: available ? ['read', 'write', 'execute'] : [],
      limitations: available ? ['max-size-10mb'] : [],
      performance: available ? { latency: 50, throughput: 1000 } : undefined,
      expiresAt: Date.now() + 300000 // 5 minutes
    };
  }
}

function checkCustomFeatureAvailability(): boolean {
  // Custom detection logic
  return typeof process !== 'undefined' && process.versions.custom;
}
```

### Plugin Registration and Usage
```typescript
// Plugin registration and usage
import { PlatformPluginRegistry } from '@promethean-os/platform-core';

async function setupPlugins() {
  const registry = new PlatformPluginRegistry();
  
  // Register custom plugin
  registry.register(new CustomPlatformPlugin());
  
  // Detect and create platform
  const platform = await registry.createPlatform();
  console.log('Created platform:', platform.name);
  
  // Load additional plugins
  const pluginManager = new PluginManager({
    platform,
    configuration: platform.getConfiguration(),
    features: platform.getFeatureDetectionAPI(),
    logger: platform.getLogger()
  });
  
  // Load feature plugins
  await pluginManager.loadPlugin(new DatabasePlugin());
  await pluginManager.loadPlugin(new CachePlugin());
  
  return { platform, pluginManager };
}
```

## 8. Performance Optimization

### Lazy Loading and Caching
```typescript
// Performance-optimized platform usage
import { PlatformFactory, CacheManager } from '@promethean-os/platform-core';

class OptimizedPlatformManager {
  private static instance: Promise<IPlatform>;
  private static cache = new CacheManager();
  
  static async getPlatform(): Promise<IPlatform> {
    if (!this.instance) {
      this.instance = this.createPlatform();
    }
    return await this.instance;
  }
  
  private static async createPlatform(): Promise<IPlatform> {
    // Cache platform detection result
    const cached = await this.cache.get<IPlatform>('current-platform');
    if (cached) {
      return cached;
    }
    
    const platform = await PlatformFactory.getPlatform();
    await this.cache.set('current-platform', platform, 300000); // 5 minutes
    
    return platform;
  }
  
  static async getFeatureWithCache(featureName: string): Promise<FeatureResult> {
    const cacheKey = `feature-${featureName}`;
    const cached = await this.cache.get<FeatureResult>(cacheKey);
    
    if (cached && !cached.isExpired()) {
      return cached;
    }
    
    const platform = await this.getPlatform();
    const features = platform.getFeatureDetectionAPI();
    const result = await features.detectFeature(featureName);
    
    await this.cache.set(cacheKey, result, result.expiresAt - Date.now());
    return result;
  }
}

// Usage with performance monitoring
async function performantOperation() {
  const start = performance.now();
  
  const platform = await OptimizedPlatformManager.getPlatform();
  const hasFeature = await OptimizedPlatformManager.getFeatureWithCache('advanced-feature');
  
  const end = performance.now();
  console.log(`Operation completed in ${end - start}ms`);
  
  if (hasFeature.available) {
    // Use advanced feature
    return await useAdvancedFeature();
  } else {
    // Use fallback
    return await useFallbackFeature();
  }
}
```

## 9. Testing Examples

### Cross-Platform Testing
```typescript
// Testing across multiple platforms
import { PlatformFactory } from '@promethean-os/platform-core';

describe('Cross-Platform Tests', () => {
  const platforms = ['node', 'browser', 'deno'];
  
  platforms.forEach(platformName => {
    describe(`${platformName} Platform`, () => {
      let platform: IPlatform;
      
      beforeAll(async () => {
        platform = await PlatformFactory.getPlatform(platformName);
      });
      
      test('should have correct platform information', () => {
        expect(platform.name).toBe(platformName);
        expect(platform.version).toBeDefined();
        expect(platform.architecture).toBeDefined();
        expect(platform.runtime).toBeDefined();
      });
      
      test('should provide valid capabilities', () => {
        const capabilities = platform.getCapabilities();
        
        expect(capabilities).toHaveProperty('fileSystem');
        expect(capabilities).toHaveProperty('network');
        expect(capabilities).toHaveProperty('process');
        expect(capabilities).toHaveProperty('storage');
        expect(capabilities).toHaveProperty('concurrency');
        expect(capabilities).toHaveProperty('security');
      });
      
      test('should detect features correctly', async () => {
        const features = await platform.detectFeatures();
        
        expect(features).toBeDefined();
        expect(typeof features).toBe('object');
        
        // Validate feature structure
        Object.values(features).forEach(feature => {
          expect(feature).toHaveProperty('available');
          expect(typeof feature.available).toBe('boolean');
          expect(feature).toHaveProperty('expiresAt');
          expect(typeof feature.expiresAt).toBe('number');
        });
      });
    });
  });
});

// Mock platform for testing
class MockPlatform implements IPlatform {
  readonly name = 'mock';
  readonly version = '1.0.0';
  readonly architecture = 'x64';
  readonly runtime = RuntimeEnvironment.NODE;
  
  getCapabilities(): PlatformCapabilities {
    return {
      fileSystem: { read: true, write: true, watch: false, permissions: false, symlinks: false },
      network: { http: true, https: true, websockets: false, tcp: false, udp: false },
      process: { spawn: false, exec: false, kill: false, signals: false },
      storage: { localStorage: true, sessionStorage: true, indexedDB: false, fileSystem: false },
      concurrency: { workers: false, sharedArrayBuffer: false, atomics: false },
      security: { permissions: false, sandbox: true, cors: true }
    };
  }
  
  async detectFeatures(): Promise<FeatureSet> {
    return {
      'mock-feature': {
        available: true,
        version: '1.0.0',
        capabilities: ['test'],
        expiresAt: Date.now() + 300000
      }
    };
  }
  
  getConfiguration(): PlatformConfiguration {
    return new MockConfigurationAPI();
  }
  
  getFileSystem(): IFileSystem {
    return new MockFileSystem();
  }
  
  getNetworkManager(): INetworkManager {
    return new MockNetworkManager();
  }
  
  getProcessManager(): IProcessManager {
    return new MockProcessManager();
  }
}
```

These code examples demonstrate practical implementations of the cross-platform compatibility layer, showing how it can be used to create platform-agnostic applications that work seamlessly across different runtime environments.