# Test Knowledge Graph

This is a test document for the knowledge graph system.

## Features

- [[Markdown Processing]] for extracting links
- [[TypeScript Analysis]] for import extraction
- [[Dependency Management]] for package.json analysis

## External Links

- [Remark.js](https://remark.js.org/) for markdown parsing
- [Babel](https://babeljs.io/) for TypeScript processing
- [SQLite](https://sqlite.org/) for graph storage

## Code Example

```typescript
import { KnowledgeGraphBuilder } from './src/builder.js'
import { Database } from './src/database/index.js'

const builder = new KnowledgeGraphBuilder(repository)
await builder.buildRepositoryGraph('./test-repo')
```