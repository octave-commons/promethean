```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/providers
```
**Folder:** `packages/providers`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/providers"]
  D1["@promethean-os/platform"]
  R1["@promethean-os/discord"]
  A --> D1["@promethean-os/platform"]
  R1["@promethean-os/discord"] --> A
  click D1 "../platform/README.md" "@promethean-os/platform"
  click R1 "../discord/README.md" "@promethean-os/discord"
```
## Dependencies
- @promethean-os/platform$../platform/README.md
## Dependents
- @promethean-os/discord$../discord/README.md
```


## 📁 Implementation

### Core Files

- [5](../../../packages/providers/src/5)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/providers/src)
- [VS Code](vscode://file/packages/providers/src)


## 📚 API Reference

### Interfaces

#### [- **discord/normalize.test.ts**](../../../packages/providers/src/[src/discord/normalize.test.ts](../../../packages/providers/src/discord/normalize.test.ts) (27 lines)#L1)

#### [- **discord/normalize.ts**](../../../packages/providers/src/[src/discord/normalize.ts](../../../packages/providers/src/discord/normalize.ts) (22 lines)#L1)

#### [- **discord/voice/gateway.ts**](../../../packages/providers/src/[src/discord/voice/gateway.ts](../../../packages/providers/src/discord/voice/gateway.ts) (6 lines)#L1)

#### [- **discord/voice/normalize.ts**](../../../packages/providers/src/[src/discord/voice/normalize.ts](../../../packages/providers/src/discord/voice/normalize.ts) (10 lines)#L1)

#### [- **discord/voice/rtp.ts**](../../../packages/providers/src/[src/discord/voice/rtp.ts](../../../packages/providers/src/discord/voice/rtp.ts) (11 lines)#L1)

#### [- **normalizeDiscordMessage()**](../../../packages/providers/src/[normalizeDiscordMessage()](../../../packages/providers/src/discord/normalize.ts#L3)

#### [- **connectVoiceGateway()**](../../../packages/providers/src/[connectVoiceGateway()](../../../packages/providers/src/discord/voice/gateway.ts#L2)

#### [- **normalizeRtpToPcm()**](../../../packages/providers/src/[normalizeRtpToPcm()](../../../packages/providers/src/discord/voice/normalize.ts#L2)

#### [- **decodeOpusPacket()**](../../../packages/providers/src/[decodeOpusPacket()](../../../packages/providers/src/discord/voice/rtp.ts#L2)

#### [- **encodeOpusFrame()**](../../../packages/providers/src/[encodeOpusFrame()](../../../packages/providers/src/discord/voice/rtp.ts#L7)

#### [- **GitHub**](../../../packages/providers/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/providers/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/providers/src/[normalizeDiscordMessage()](../../../packages/providers/src/discord/normalize.ts#L3)

#### [**Description**](../../../packages/providers/src/Key function for normalizediscordmessage operations.#L1)

#### [**File**](../../../packages/providers/src/`src/discord/normalize.ts`#L1)

#### [**Location**](../../../packages/providers/src/[connectVoiceGateway()](../../../packages/providers/src/discord/voice/gateway.ts#L2)

#### [**Description**](../../../packages/providers/src/Key function for connectvoicegateway operations.#L1)

#### [**File**](../../../packages/providers/src/`src/discord/voice/gateway.ts`#L1)

#### [**Location**](../../../packages/providers/src/[normalizeRtpToPcm()](../../../packages/providers/src/discord/voice/normalize.ts#L2)

#### [**Description**](../../../packages/providers/src/Key function for normalizertptopcm operations.#L1)

#### [**File**](../../../packages/providers/src/`src/discord/voice/normalize.ts`#L1)

#### [**Location**](../../../packages/providers/src/[decodeOpusPacket()](../../../packages/providers/src/discord/voice/rtp.ts#L2)

#### [**Description**](../../../packages/providers/src/Key function for decodeopuspacket operations.#L1)

#### [**File**](../../../packages/providers/src/`src/discord/voice/rtp.ts`#L1)

#### [**Location**](../../../packages/providers/src/[encodeOpusFrame()](../../../packages/providers/src/discord/voice/rtp.ts#L7)

#### [**Description**](../../../packages/providers/src/Key function for encodeopusframe operations.#L1)

#### [**File**](../../../packages/providers/src/`src/discord/voice/rtp.ts`#L1)

#### [Code links saved to](../../../packages/providers/src//home/err/devel/promethean/tmp/providers-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*