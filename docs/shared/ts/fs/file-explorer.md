# File Explorer

The file explorer utilities provide safe access to repository contents.

## API

### `listDir(root, rel=".")`
List directory entries under `root` joined with `rel`.

### `readFile(root, rel, maxBytes=65536)`
Read a file under `root` with optional size limit.

### `searchFiles(root, query, limit=20)`
Fuzzy-search file paths relative to `root`.

## Example

```ts
import { listDir, readFile, searchFiles } from '@shared/ts/dist/fs/fileExplorer.js';

const files = await listDir('/repo');
const content = await readFile('/repo', 'README.md');
const matches = await searchFiles('/repo', 'readme');
```
