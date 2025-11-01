```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/shadow-conf
```
**Folder:** `packages/shadow-conf`
```
```
**Version:** `0.0.0`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/shadow-conf"]
  D1["@promethean-os/pm2-helpers"]
  A --> D1["@promethean-os/pm2-helpers"]
  click D1 "../pm2-helpers/README.md" "@promethean-os/pm2-helpers"
```
## Dependencies
- @promethean-os/pm2-helpers$../pm2-helpers/README.md
## Dependents
- _None_
```


## 📁 Implementation

### Core Files

- [30](../../../packages/shadow-conf/src/30)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/shadow-conf/src)
- [VS Code](vscode://file/packages/shadow-conf/src)


## 📚 API Reference

### Interfaces

#### [- **ai-security-evaluator.ts**](../../../packages/shadow-conf/src/[src/ai-security-evaluator.ts](../../../packages/shadow-conf/src/ai-security-evaluator.ts) (444 lines)#L1)

#### [- **bin/shadow-conf-secure.ts**](../../../packages/shadow-conf/src/[src/bin/shadow-conf-secure.ts](../../../packages/shadow-conf/src/bin/shadow-conf-secure.ts) (234 lines)#L1)

#### [- **bin/shadow-conf.ts**](../../../packages/shadow-conf/src/[src/bin/shadow-conf.ts](../../../packages/shadow-conf/src/bin/shadow-conf.ts) (192 lines)#L1)

#### [- **ecosystem-secure.ts**](../../../packages/shadow-conf/src/[src/ecosystem-secure.ts](../../../packages/shadow-conf/src/ecosystem-secure.ts) (494 lines)#L1)

#### [- **ecosystem.ts**](../../../packages/shadow-conf/src/[src/ecosystem.ts](../../../packages/shadow-conf/src/ecosystem.ts) (505 lines)#L1)

#### [- **edn-fixed.ts**](../../../packages/shadow-conf/src/[src/edn-fixed.ts](../../../packages/shadow-conf/src/edn-fixed.ts) (128 lines)#L1)

#### [- **edn-new.ts**](../../../packages/shadow-conf/src/[src/edn-new.ts](../../../packages/shadow-conf/src/edn-new.ts) (174 lines)#L1)

#### [- **edn.ts**](../../../packages/shadow-conf/src/[src/edn.ts](../../../packages/shadow-conf/src/edn.ts) (175 lines)#L1)

#### [- **index.ts**](../../../packages/shadow-conf/src/[src/index.ts](../../../packages/shadow-conf/src/index.ts) (7 lines)#L1)

#### [- **jsedn.d.ts**](../../../packages/shadow-conf/src/[src/jsedn.d.ts](../../../packages/shadow-conf/src/jsedn.d.ts) (22 lines)#L1)

#### [- **security-utils.ts**](../../../packages/shadow-conf/src/[src/security-utils.ts](../../../packages/shadow-conf/src/security-utils.ts) (430 lines)#L1)

#### [- **tests/ai-security-evaluator.test.ts**](../../../packages/shadow-conf/src/[src/tests/ai-security-evaluator.test.ts](../../../packages/shadow-conf/src/tests/ai-security-evaluator.test.ts) (69 lines)#L1)

#### [- **tests/ecosystem.test.ts**](../../../packages/shadow-conf/src/[src/tests/ecosystem.test.ts](../../../packages/shadow-conf/src/tests/ecosystem.test.ts) (179 lines)#L1)

#### [- **tests/security-final.test.ts**](../../../packages/shadow-conf/src/[src/tests/security-final.test.ts](../../../packages/shadow-conf/src/tests/security-final.test.ts) (303 lines)#L1)

#### [- **types/jsedn.d.ts**](../../../packages/shadow-conf/src/[src/types/jsedn.d.ts](../../../packages/shadow-conf/src/types/jsedn.d.ts) (10 lines)#L1)

#### [- **EDN**](../../../packages/shadow-conf/src/[EDN](../../../packages/shadow-conf/src/types/jsedn.d.ts#L5)

#### [- **DEFAULT_AI_SECURITY_CONFIG()**](../../../packages/shadow-conf/src/[DEFAULT_AI_SECURITY_CONFIG()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L64)

#### [- **createAISecurityEvaluator()**](../../../packages/shadow-conf/src/[createAISecurityEvaluator()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L78)

#### [- **createOllamaAdapter()**](../../../packages/shadow-conf/src/[createOllamaAdapter()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L323)

#### [- **createMockOpenCodeAdapter()**](../../../packages/shadow-conf/src/[createMockOpenCodeAdapter()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L434)

#### [- **DEFAULT_OUTPUT_FILE_NAME()**](../../../packages/shadow-conf/src/[DEFAULT_OUTPUT_FILE_NAME()](../../../packages/shadow-conf/src/ecosystem-secure.ts#L29)

#### [- **GitHub**](../../../packages/shadow-conf/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/shadow-conf/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/shadow-conf/src/[EDN](../../../packages/shadow-conf/src/types/jsedn.d.ts#L5)

#### [**Description**](../../../packages/shadow-conf/src/Main class for edn functionality.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/types/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[DEFAULT_AI_SECURITY_CONFIG()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L64)

#### [**Description**](../../../packages/shadow-conf/src/Key function for default_ai_security_config operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[createAISecurityEvaluator()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L78)

#### [**Description**](../../../packages/shadow-conf/src/Key function for createaisecurityevaluator operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[createOllamaAdapter()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L323)

#### [**Description**](../../../packages/shadow-conf/src/Key function for createollamaadapter operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[createMockOpenCodeAdapter()](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L434)

#### [**Description**](../../../packages/shadow-conf/src/Key function for createmockopencodeadapter operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[DEFAULT_OUTPUT_FILE_NAME()](../../../packages/shadow-conf/src/ecosystem-secure.ts#L29)

#### [**Description**](../../../packages/shadow-conf/src/Key function for default_output_file_name operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ecosystem-secure.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[generateEcosystem()](../../../packages/shadow-conf/src/ecosystem-secure.ts#L164)

#### [**Description**](../../../packages/shadow-conf/src/Key function for generateecosystem operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ecosystem-secure.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[DEFAULT_OUTPUT_FILE_NAME()](../../../packages/shadow-conf/src/ecosystem.ts#L38)

#### [**Description**](../../../packages/shadow-conf/src/Key function for default_output_file_name operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ecosystem.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[generateEcosystem()](../../../packages/shadow-conf/src/ecosystem.ts#L72)

#### [**Description**](../../../packages/shadow-conf/src/Key function for generateecosystem operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ecosystem.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[loadEdnFile()](../../../packages/shadow-conf/src/edn-fixed.ts#L69)

#### [**Description**](../../../packages/shadow-conf/src/Key function for loadednfile operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/edn-fixed.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[loadEdnFile()](../../../packages/shadow-conf/src/edn-new.ts#L60)

#### [**Description**](../../../packages/shadow-conf/src/Key function for loadednfile operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/edn-new.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[loadEdnFile()](../../../packages/shadow-conf/src/edn.ts#L61)

#### [**Description**](../../../packages/shadow-conf/src/Key function for loadednfile operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/edn.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[parse()](../../../packages/shadow-conf/src/jsedn.d.ts#L12)

#### [**Description**](../../../packages/shadow-conf/src/Key function for parse operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[stringify()](../../../packages/shadow-conf/src/jsedn.d.ts#L13)

#### [**Description**](../../../packages/shadow-conf/src/Key function for stringify operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[toJS()](../../../packages/shadow-conf/src/jsedn.d.ts#L14)

#### [**Description**](../../../packages/shadow-conf/src/Key function for tojs operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[DEFAULT_SECURITY_CONFIG()](../../../packages/shadow-conf/src/security-utils.ts#L42)

#### [**Description**](../../../packages/shadow-conf/src/Key function for default_security_config operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateAndSanitizePath()](../../../packages/shadow-conf/src/security-utils.ts#L73)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validateandsanitizepath operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateAndSanitizeFilename()](../../../packages/shadow-conf/src/security-utils.ts#L190)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validateandsanitizefilename operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validatePathBoundaries()](../../../packages/shadow-conf/src/security-utils.ts#L264)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validatepathboundaries operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateRecursionDepth()](../../../packages/shadow-conf/src/security-utils.ts#L291)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validaterecursiondepth operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateFileSize()](../../../packages/shadow-conf/src/security-utils.ts#L314)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validatefilesize operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateFileExtension()](../../../packages/shadow-conf/src/security-utils.ts#L336)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validatefileextension operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[sanitizeForJsonSerialization()](../../../packages/shadow-conf/src/security-utils.ts#L359)

#### [**Description**](../../../packages/shadow-conf/src/Key function for sanitizeforjsonserialization operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[validateCliArguments()](../../../packages/shadow-conf/src/security-utils.ts#L417)

#### [**Description**](../../../packages/shadow-conf/src/Key function for validatecliarguments operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[parse()](../../../packages/shadow-conf/src/types/jsedn.d.ts#L2)

#### [**Description**](../../../packages/shadow-conf/src/Key function for parse operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/types/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[stringify()](../../../packages/shadow-conf/src/types/jsedn.d.ts#L3)

#### [**Description**](../../../packages/shadow-conf/src/Key function for stringify operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/types/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[toJS()](../../../packages/shadow-conf/src/types/jsedn.d.ts#L4)

#### [**Description**](../../../packages/shadow-conf/src/Key function for tojs operations.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/types/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[SecurityThreatAssessment](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L17)

#### [**Description**](../../../packages/shadow-conf/src/Type definition for securitythreatassessment.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[AISecurityConfig](../../../packages/shadow-conf/src/ai-security-evaluator.ts#L46)

#### [**Description**](../../../packages/shadow-conf/src/Type definition for aisecurityconfig.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/ai-security-evaluator.ts`#L1)

#### [**Location**](../../../packages/shadow-conf/src/[SecurityConfig](../../../packages/shadow-conf/src/security-utils.ts#L22)

#### [**Description**](../../../packages/shadow-conf/src/Type definition for securityconfig.#L1)

#### [**File**](../../../packages/shadow-conf/src/`src/security-utils.ts`#L1)

#### [Code links saved to](../../../packages/shadow-conf/src//home/err/devel/promethean/tmp/shadow-conf-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*