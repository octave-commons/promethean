```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/migrations
```
**Folder:** `packages/migrations`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/migrations"]
  D1["@promethean-os/embedding"]
  D2["@promethean-os/persistence"]
  R1["@promethean-os/discord"]
  A --> D1["@promethean-os/embedding"]
  A --> D2["@promethean-os/persistence"]
  R1["@promethean-os/discord"] --> A
  click D1 "../embedding/README.md" "@promethean-os/embedding"
  click D2 "../persistence/README.md" "@promethean-os/persistence"
  click R1 "../discord/README.md" "@promethean-os/discord"
```
## Dependencies
- @promethean-os/embedding$../embedding/README.md
- @promethean-os/persistence$../persistence/README.md
## Dependents
- @promethean-os/discord$../discord/README.md
```


## 📁 Implementation

### Core Files

- [12](../../../packages/migrations/src/12)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/migrations/src)
- [VS Code](vscode://file/packages/migrations/src)


## 📚 API Reference

### Interfaces

#### [- **cdc.ts**](../../../packages/migrations/src/[src/cdc.ts](../../../packages/migrations/src/cdc.ts) (265 lines)#L1)

#### [- **checkpoints.ts**](../../../packages/migrations/src/[src/checkpoints.ts](../../../packages/migrations/src/checkpoints.ts) (92 lines)#L1)

#### [- **chroma.test.ts**](../../../packages/migrations/src/[src/chroma.test.ts](../../../packages/migrations/src/chroma.test.ts) (27 lines)#L1)

#### [- **chroma.ts**](../../../packages/migrations/src/[src/chroma.ts](../../../packages/migrations/src/chroma.ts) (42 lines)#L1)

#### [- **contract.ts**](../../../packages/migrations/src/[src/contract.ts](../../../packages/migrations/src/contract.ts) (48 lines)#L1)

#### [- **cutover.ts**](../../../packages/migrations/src/[src/cutover.ts](../../../packages/migrations/src/cutover.ts) (5 lines)#L1)

#### [- **embedder.test.ts**](../../../packages/migrations/src/[src/embedder.test.ts](../../../packages/migrations/src/embedder.test.ts) (26 lines)#L1)

#### [- **embedder.ts**](../../../packages/migrations/src/[src/embedder.ts](../../../packages/migrations/src/embedder.ts) (20 lines)#L1)

#### [- **index.ts**](../../../packages/migrations/src/[src/index.ts](../../../packages/migrations/src/index.ts) (88 lines)#L1)

#### [- **integrity.ts**](../../../packages/migrations/src/[src/integrity.ts](../../../packages/migrations/src/integrity.ts) (31 lines)#L1)

#### [- **migrations/001-labels-to-tags.ts**](../../../packages/migrations/src/[src/migrations/001-labels-to-tags.ts](../../../packages/migrations/src/migrations/001-labels-to-tags.ts) (45 lines)#L1)

#### [- **migrations/002-agent-context-schema.ts**](../../../packages/migrations/src/[src/migrations/002-agent-context-schema.ts](../../../packages/migrations/src/migrations/002-agent-context-schema.ts) (163 lines)#L1)

#### [- **rollback.ts**](../../../packages/migrations/src/[src/rollback.ts](../../../packages/migrations/src/rollback.ts) (4 lines)#L1)

#### [- **MongoCheckpointStore**](../../../packages/migrations/src/[MongoCheckpointStore](../../../packages/migrations/src/checkpoints.ts#L22)

#### [- **makeCheckpointStore()**](../../../packages/migrations/src/[makeCheckpointStore()](../../../packages/migrations/src/checkpoints.ts#L81)

#### [- **makeChromaWrapper()**](../../../packages/migrations/src/[makeChromaWrapper()](../../../packages/migrations/src/chroma.ts#L22)

#### [- **validateMongoContract()**](../../../packages/migrations/src/[validateMongoContract()](../../../packages/migrations/src/contract.ts#L18)

#### [- **validateChromaContract()**](../../../packages/migrations/src/[validateChromaContract()](../../../packages/migrations/src/contract.ts#L40)

#### [- **makeDeterministicEmbedder()**](../../../packages/migrations/src/[makeDeterministicEmbedder()](../../../packages/migrations/src/embedder.ts#L17)

#### [- **GitHub**](../../../packages/migrations/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/migrations/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/migrations/src/[MongoCheckpointStore](../../../packages/migrations/src/checkpoints.ts#L22)

#### [**Description**](../../../packages/migrations/src/Main class for mongocheckpointstore functionality.#L1)

#### [**File**](../../../packages/migrations/src/`src/checkpoints.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[makeCheckpointStore()](../../../packages/migrations/src/checkpoints.ts#L81)

#### [**Description**](../../../packages/migrations/src/Key function for makecheckpointstore operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/checkpoints.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[makeChromaWrapper()](../../../packages/migrations/src/chroma.ts#L22)

#### [**Description**](../../../packages/migrations/src/Key function for makechromawrapper operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/chroma.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[validateMongoContract()](../../../packages/migrations/src/contract.ts#L18)

#### [**Description**](../../../packages/migrations/src/Key function for validatemongocontract operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/contract.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[validateChromaContract()](../../../packages/migrations/src/contract.ts#L40)

#### [**Description**](../../../packages/migrations/src/Key function for validatechromacontract operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/contract.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[makeDeterministicEmbedder()](../../../packages/migrations/src/embedder.ts#L17)

#### [**Description**](../../../packages/migrations/src/Key function for makedeterministicembedder operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/embedder.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[sha256()](../../../packages/migrations/src/integrity.ts#L3)

#### [**Description**](../../../packages/migrations/src/Key function for sha256 operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/integrity.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[checksumFor()](../../../packages/migrations/src/integrity.ts#L15)

#### [**Description**](../../../packages/migrations/src/Key function for checksumfor operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/integrity.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[id()](../../../packages/migrations/src/migrations/001-labels-to-tags.ts#L6)

#### [**Description**](../../../packages/migrations/src/Key function for id operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/migrations/001-labels-to-tags.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[name()](../../../packages/migrations/src/migrations/001-labels-to-tags.ts#L7)

#### [**Description**](../../../packages/migrations/src/Key function for name operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/migrations/001-labels-to-tags.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[up()](../../../packages/migrations/src/migrations/001-labels-to-tags.ts#L18)

#### [**Description**](../../../packages/migrations/src/Key function for up operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/migrations/001-labels-to-tags.ts`#L1)

#### [**Location**](../../../packages/migrations/src/[migration()](../../../packages/migrations/src/migrations/002-agent-context-schema.ts#L3)

#### [**Description**](../../../packages/migrations/src/Key function for migration operations.#L1)

#### [**File**](../../../packages/migrations/src/`src/migrations/002-agent-context-schema.ts`#L1)

#### [Code links saved to](../../../packages/migrations/src//home/err/devel/promethean/tmp/migrations-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*