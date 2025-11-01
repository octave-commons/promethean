# Platform Core Package

Core platform utilities and abstractions for Promethean.

## Overview

The `@promethean-os/platform-core` package provides fundamental platform functionality:

- System abstraction layer
- Cross-platform compatibility
- Core utilities
- Environment detection

## Features

- **Platform Detection**: Identify operating system and architecture
- **Cross-platform APIs**: Unified interface across platforms
- **System Integration**: OS-specific functionality
- **Environment Management**: Runtime environment handling

## Usage

```typescript
import { createPlatformCore } from '@promethean-os/platform-core';

const platform = createPlatformCore();

// Get platform information
const info = platform.getPlatformInfo();
console.log(`Running on ${info.os} ${info.arch}`);

// Cross-platform file operations
const path = platform.joinPaths('folder', 'file.txt');
const home = platform.getHomeDirectory();

// Environment-specific operations
if (platform.isWindows()) {
  await platform.runWindowsCommand('dir');
} else if (platform.isMacOS()) {
  await platform.runMacOSCommand('ls -la');
}
```

## Configuration

```typescript
interface PlatformConfig {
  enableNativeIntegration: boolean;
  fallbackMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  customPaths: Record<string, string>;
}
```

## Platform Support

- **Windows**: Windows 10/11 with native integration
- **macOS**: macOS 10.15+ with native features
- **Linux**: Most distributions with standard utilities

## 📁 Implementation

### Core Files
- **detection/runtime-detector.ts**: [src/detection/runtime-detector.ts](../../../packages/platform-core/src/detection/runtime-detector.ts) (349 lines)
- **interfaces/IPlatform.ts**: [src/interfaces/IPlatform.ts](../../../packages/platform-core/src/interfaces/IPlatform.ts) (59 lines)
- **models/Capabilities.ts**: [src/models/Capabilities.ts](../../../packages/platform-core/src/models/Capabilities.ts) (421 lines)
- **models/RuntimeInfo.ts**: [src/models/RuntimeInfo.ts](../../../packages/platform-core/src/models/RuntimeInfo.ts) (206 lines)
- **registry/feature-registry.ts**: [src/registry/feature-registry.ts](../../../packages/platform-core/src/registry/feature-registry.ts) (276 lines)
- **tests/feature-registry.test.ts**: [src/tests/feature-registry.test.ts](../../../packages/platform-core/src/tests/feature-registry.test.ts) (275 lines)
- **tests/runtime-detector.test.ts**: [src/tests/runtime-detector.test.ts](../../../packages/platform-core/src/tests/runtime-detector.test.ts) (124 lines)

### Key Classes & Functions
- **FeatureRegistry**: [FeatureRegistry](../../../packages/platform-core/src/registry/feature-registry.ts#L87) - Main class
- **detectRuntimeEnvironment()**: [detectRuntimeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L29) - Key function
- **detectNodeEnvironment()**: [detectNodeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L67) - Key function
- **detectDenoEnvironment()**: [detectDenoEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L90) - Key function
- **detectBrowserEnvironment()**: [detectBrowserEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L112) - Key function
- **detectEdgeEnvironment()**: [detectEdgeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L135) - Key function
- _... and 5 more_

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/platform-core/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/platform-core/src)




## 📚 API Reference

### Classes

#### FeatureRegistry
**Location**: [FeatureRegistry](../../../packages/platform-core/src/registry/feature-registry.ts#L87)

**Description**: Main class for featureregistry functionality.

**File**: `src/registry/feature-registry.ts`

### Functions

#### detectRuntimeEnvironment()
**Location**: [detectRuntimeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L29)

**Description**: Key function for detectruntimeenvironment operations.

**File**: `src/detection/runtime-detector.ts`

#### detectNodeEnvironment()
**Location**: [detectNodeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L67)

**Description**: Key function for detectnodeenvironment operations.

**File**: `src/detection/runtime-detector.ts`

#### detectDenoEnvironment()
**Location**: [detectDenoEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L90)

**Description**: Key function for detectdenoenvironment operations.

**File**: `src/detection/runtime-detector.ts`

#### detectBrowserEnvironment()
**Location**: [detectBrowserEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L112)

**Description**: Key function for detectbrowserenvironment operations.

**File**: `src/detection/runtime-detector.ts`

#### detectEdgeEnvironment()
**Location**: [detectEdgeEnvironment()](../../../packages/platform-core/src/detection/runtime-detector.ts#L135)

**Description**: Key function for detectedgeenvironment operations.

**File**: `src/detection/runtime-detector.ts`

#### getRuntimeGlobal()
**Location**: [getRuntimeGlobal()](../../../packages/platform-core/src/detection/runtime-detector.ts#L317)

**Description**: Key function for getruntimeglobal operations.

**File**: `src/detection/runtime-detector.ts`

#### supportsGlobalAPI()
**Location**: [supportsGlobalAPI()](../../../packages/platform-core/src/detection/runtime-detector.ts#L345)

**Description**: Key function for supportsglobalapi operations.

**File**: `src/detection/runtime-detector.ts`

#### createFeatureRegistry()
**Location**: [createFeatureRegistry()](../../../packages/platform-core/src/registry/feature-registry.ts#L266)

**Description**: Key function for createfeatureregistry operations.

**File**: `src/registry/feature-registry.ts`

#### globalFeatureRegistry()
**Location**: [globalFeatureRegistry()](../../../packages/platform-core/src/registry/feature-registry.ts#L275)

**Description**: Key function for globalfeatureregistry operations.

**File**: `src/registry/feature-registry.ts`

### Interfaces

#### RuntimeDetectionResult
**Location**: [RuntimeDetectionResult](../../../packages/platform-core/src/detection/runtime-detector.ts#L11)

**Description**: Type definition for runtimedetectionresult.

**File**: `src/detection/runtime-detector.ts`

#### IPlatform
**Location**: [IPlatform](../../../packages/platform-core/src/interfaces/IPlatform.ts#L15)

**Description**: Type definition for iplatform.

**File**: `src/interfaces/IPlatform.ts`

#### PlatformCapabilities
**Location**: [PlatformCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L10)

**Description**: Type definition for platformcapabilities.

**File**: `src/models/Capabilities.ts`

#### RuntimeCapabilities
**Location**: [RuntimeCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L33)

**Description**: Type definition for runtimecapabilities.

**File**: `src/models/Capabilities.ts`

#### FilesystemCapabilities
**Location**: [FilesystemCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L77)

**Description**: Type definition for filesystemcapabilities.

**File**: `src/models/Capabilities.ts`

#### NetworkCapabilities
**Location**: [NetworkCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L115)

**Description**: Type definition for networkcapabilities.

**File**: `src/models/Capabilities.ts`

#### SecurityCapabilities
**Location**: [SecurityCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L153)

**Description**: Type definition for securitycapabilities.

**File**: `src/models/Capabilities.ts`

#### PerformanceCapabilities
**Location**: [PerformanceCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L188)

**Description**: Type definition for performancecapabilities.

**File**: `src/models/Capabilities.ts`

#### PlatformSpecificCapabilities
**Location**: [PlatformSpecificCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L223)

**Description**: Type definition for platformspecificcapabilities.

**File**: `src/models/Capabilities.ts`

#### NodeCapabilities
**Location**: [NodeCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L240)

**Description**: Type definition for nodecapabilities.

**File**: `src/models/Capabilities.ts`

#### BrowserCapabilities
**Location**: [BrowserCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L275)

**Description**: Type definition for browsercapabilities.

**File**: `src/models/Capabilities.ts`

#### DenoCapabilities
**Location**: [DenoCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L310)

**Description**: Type definition for denocapabilities.

**File**: `src/models/Capabilities.ts`

#### EdgeCapabilities
**Location**: [EdgeCapabilities](../../../packages/platform-core/src/models/Capabilities.ts#L345)

**Description**: Type definition for edgecapabilities.

**File**: `src/models/Capabilities.ts`

#### FeatureResult
**Location**: [FeatureResult](../../../packages/platform-core/src/models/Capabilities.ts#L380)

**Description**: Type definition for featureresult.

**File**: `src/models/Capabilities.ts`

#### FeatureSet
**Location**: [FeatureSet](../../../packages/platform-core/src/models/Capabilities.ts#L403)

**Description**: Type definition for featureset.

**File**: `src/models/Capabilities.ts`

#### RuntimeInfo
**Location**: [RuntimeInfo](../../../packages/platform-core/src/models/RuntimeInfo.ts#L22)

**Description**: Type definition for runtimeinfo.

**File**: `src/models/RuntimeInfo.ts`

#### RuntimeMetadata
**Location**: [RuntimeMetadata](../../../packages/platform-core/src/models/RuntimeInfo.ts#L46)

**Description**: Type definition for runtimemetadata.

**File**: `src/models/RuntimeInfo.ts`

#### NodeMetadata
**Location**: [NodeMetadata](../../../packages/platform-core/src/models/RuntimeInfo.ts#L66)

**Description**: Type definition for nodemetadata.

**File**: `src/models/RuntimeInfo.ts`

#### BrowserMetadata
**Location**: [BrowserMetadata](../../../packages/platform-core/src/models/RuntimeInfo.ts#L102)

**Description**: Type definition for browsermetadata.

**File**: `src/models/RuntimeInfo.ts`

#### DenoMetadata
**Location**: [DenoMetadata](../../../packages/platform-core/src/models/RuntimeInfo.ts#L147)

**Description**: Type definition for denometadata.

**File**: `src/models/RuntimeInfo.ts`

#### EdgeMetadata
**Location**: [EdgeMetadata](../../../packages/platform-core/src/models/RuntimeInfo.ts#L178)

**Description**: Type definition for edgemetadata.

**File**: `src/models/RuntimeInfo.ts`

#### FeatureRegistryConfig
**Location**: [FeatureRegistryConfig](../../../packages/platform-core/src/registry/feature-registry.ts#L17)

**Description**: Type definition for featureregistryconfig.

**File**: `src/registry/feature-registry.ts`

#### IFeatureRegistry
**Location**: [IFeatureRegistry](../../../packages/platform-core/src/registry/feature-registry.ts#L31)

**Description**: Type definition for ifeatureregistry.

**File**: `src/registry/feature-registry.ts`




## Development Status

✅ **Active** - Core platform abstraction implemented and tested.

## Dependencies

- `@promethean-os/logger` - Platform logging
- `@promethean-os/utils` - Utility functions

## Related Packages

- [[platform]] - Platform-specific implementations
- [[utils]] - General utilities
- [[fs]] - File system abstraction
