```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/apply-patch
```
**Folder:** `packages/apply-patch`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/apply-patch"]
  R1["@promethean-os/legacy"]
  R1["@promethean-os/legacy"] --> A
  click R1 "../legacy/README.md" "@promethean-os/legacy"
```
## Dependencies
- _None_
## Dependents
- @promethean-os/legacy$../legacy/README.md
```


## 📁 Implementation

### Core Files

- [18](../../../packages/apply-patch/src/18)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/apply-patch/src)
- [VS Code](vscode://file/packages/apply-patch/src)


## 📚 API Reference

### Interfaces

#### [- **cli.ts**](../../../packages/apply-patch/src/[src/cli.ts](../../../packages/apply-patch/src/cli.ts) (256 lines)#L1)

#### [- **diff.ts**](../../../packages/apply-patch/src/[src/diff.ts](../../../packages/apply-patch/src/diff.ts) (274 lines)#L1)

#### [- **github-response.ts**](../../../packages/apply-patch/src/[src/github-response.ts](../../../packages/apply-patch/src/github-response.ts) (189 lines)#L1)

#### [- **github-types.ts**](../../../packages/apply-patch/src/[src/github-types.ts](../../../packages/apply-patch/src/github-types.ts) (24 lines)#L1)

#### [- **github-utils.ts**](../../../packages/apply-patch/src/[src/github-utils.ts](../../../packages/apply-patch/src/github-utils.ts) (205 lines)#L1)

#### [- **github.ts**](../../../packages/apply-patch/src/[src/github.ts](../../../packages/apply-patch/src/github.ts) (224 lines)#L1)

#### [- **index.ts**](../../../packages/apply-patch/src/[src/index.ts](../../../packages/apply-patch/src/index.ts) (22 lines)#L1)

#### [- **json-edits.ts**](../../../packages/apply-patch/src/[src/json-edits.ts](../../../packages/apply-patch/src/json-edits.ts) (170 lines)#L1)

#### [- **sanitize.ts**](../../../packages/apply-patch/src/[src/sanitize.ts](../../../packages/apply-patch/src/sanitize.ts) (53 lines)#L1)

#### [- **tests/github.test.ts**](../../../packages/apply-patch/src/[src/tests/github.test.ts](../../../packages/apply-patch/src/tests/github.test.ts) (288 lines)#L1)

#### [- **tests/parse-plan.test.ts**](../../../packages/apply-patch/src/[src/tests/parse-plan.test.ts](../../../packages/apply-patch/src/tests/parse-plan.test.ts) (20 lines)#L1)

#### [- **types.ts**](../../../packages/apply-patch/src/[src/types.ts](../../../packages/apply-patch/src/types.ts) (105 lines)#L1)

#### [- **runApplyPatch()**](../../../packages/apply-patch/src/[runApplyPatch()](../../../packages/apply-patch/src/cli.ts#L204)

#### [- **parseUnifiedDiff()**](../../../packages/apply-patch/src/[parseUnifiedDiff()](../../../packages/apply-patch/src/diff.ts#L263)

#### [- **buildSuccess()**](../../../packages/apply-patch/src/[buildSuccess()](../../../packages/apply-patch/src/github-response.ts#L16)

#### [- **handleGraphqlResponse()**](../../../packages/apply-patch/src/[handleGraphqlResponse()](../../../packages/apply-patch/src/github-response.ts#L154)

#### [- **summarizeFiles()**](../../../packages/apply-patch/src/[summarizeFiles()](../../../packages/apply-patch/src/github-utils.ts#L13)

#### [- **GitHub**](../../../packages/apply-patch/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/apply-patch/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/apply-patch/src/[runApplyPatch()](../../../packages/apply-patch/src/cli.ts#L204)

#### [**Description**](../../../packages/apply-patch/src/Key function for runapplypatch operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/cli.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[parseUnifiedDiff()](../../../packages/apply-patch/src/diff.ts#L263)

#### [**Description**](../../../packages/apply-patch/src/Key function for parseunifieddiff operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/diff.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[buildSuccess()](../../../packages/apply-patch/src/github-response.ts#L16)

#### [**Description**](../../../packages/apply-patch/src/Key function for buildsuccess operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-response.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[handleGraphqlResponse()](../../../packages/apply-patch/src/github-response.ts#L154)

#### [**Description**](../../../packages/apply-patch/src/Key function for handlegraphqlresponse operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-response.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[summarizeFiles()](../../../packages/apply-patch/src/github-utils.ts#L13)

#### [**Description**](../../../packages/apply-patch/src/Key function for summarizefiles operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[appendTrailers()](../../../packages/apply-patch/src/github-utils.ts#L27)

#### [**Description**](../../../packages/apply-patch/src/Key function for appendtrailers operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[runGit()](../../../packages/apply-patch/src/github-utils.ts#L36)

#### [**Description**](../../../packages/apply-patch/src/Key function for rungit operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[computeAdditions()](../../../packages/apply-patch/src/github-utils.ts#L112)

#### [**Description**](../../../packages/apply-patch/src/Key function for computeadditions operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[computeDeletions()](../../../packages/apply-patch/src/github-utils.ts#L123)

#### [**Description**](../../../packages/apply-patch/src/Key function for computedeletions operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[ensureCheckSucceeds()](../../../packages/apply-patch/src/github-utils.ts#L134)

#### [**Description**](../../../packages/apply-patch/src/Key function for ensurechecksucceeds operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[buildGraphqlPayload()](../../../packages/apply-patch/src/github-utils.ts#L154)

#### [**Description**](../../../packages/apply-patch/src/Key function for buildgraphqlpayload operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[ensureDiffProvided()](../../../packages/apply-patch/src/github-utils.ts#L187)

#### [**Description**](../../../packages/apply-patch/src/Key function for ensurediffprovided operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github-utils.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[DEFAULT_GITHUB_GRAPHQL_URL()](../../../packages/apply-patch/src/github.ts#L22)

#### [**Description**](../../../packages/apply-patch/src/Key function for default_github_graphql_url operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[createGithubCommit()](../../../packages/apply-patch/src/github.ts#L186)

#### [**Description**](../../../packages/apply-patch/src/Key function for creategithubcommit operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/github.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[applyJsonEdits()](../../../packages/apply-patch/src/json-edits.ts#L154)

#### [**Description**](../../../packages/apply-patch/src/Key function for applyjsonedits operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/json-edits.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[sanitizeHeaderValue()](../../../packages/apply-patch/src/sanitize.ts#L1)

#### [**Description**](../../../packages/apply-patch/src/Key function for sanitizeheadervalue operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/sanitize.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[sanitizeHeaders()](../../../packages/apply-patch/src/sanitize.ts#L11)

#### [**Description**](../../../packages/apply-patch/src/Key function for sanitizeheaders operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/sanitize.ts`#L1)

#### [**Location**](../../../packages/apply-patch/src/[sanitizeForLog()](../../../packages/apply-patch/src/sanitize.ts#L26)

#### [**Description**](../../../packages/apply-patch/src/Key function for sanitizeforlog operations.#L1)

#### [**File**](../../../packages/apply-patch/src/`src/sanitize.ts`#L1)

#### [Code links saved to](../../../packages/apply-patch/src//home/err/devel/promethean/tmp/apply-patch-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*