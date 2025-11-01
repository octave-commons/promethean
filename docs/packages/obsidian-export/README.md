# Obsidian Export Package

Export and convert Obsidian vaults to various formats.

## Overview

The `@promethean-os/obsidian-export` package provides Obsidian vault functionality:

- Vault reading and parsing
- Wikilink resolution
- Format conversion
- Metadata extraction

## Features

- **Vault Parsing**: Complete Obsidian vault reading
- **Wikilink Resolution**: Convert `[[links]]` to proper format
- **Format Conversion**: Export to Markdown, HTML, JSON
- **Metadata Extraction**: Extract tags, properties, and structure

## Usage

```typescript
import { createObsidianExporter } from '@promethean-os/obsidian-export';

const exporter = createObsidianExporter({
  vaultPath: './my-vault',
  outputFormat: 'markdown',
  resolveWikilinks: true,
  includeMetadata: true,
});

// Export entire vault
await exporter.exportVault({
  outputPath: './export',
  format: 'html',
});

// Export specific files
await exporter.exportFiles(['docs/Home.md', 'docs/Projects.md'], {
  outputPath: './selected-export',
  format: 'markdown',
});
```

## Configuration

```typescript
interface ObsidianExportConfig {
  vaultPath: string;
  outputFormat: 'markdown' | 'html' | 'json';
  resolveWikilinks: boolean;
  includeMetadata: boolean;
  preserveFolderStructure: boolean;
  embedAttachments: boolean;
}
```

## Wikilink Conversion

The package handles various Obsidian link formats:

```markdown
[[Simple Link]] → [Simple Link](simple-link.md)
[[Link|Display Text]] → [Display Text](link.md)
[[Folder/File]] → [Folder/File](folder/file.md)
[[File#Section]] → [File](file.md#section)
```

## 📁 Implementation

### Core Files
- **Main Entry**: [`src/convert.ts`](../../../packages/obsidian-export/src/convert.ts) (194 lines)
- **CLI Interface**: [`src/cli.ts`](../../../packages/obsidian-export/src/cli.ts) (25 lines)

### Key Functions
- **convertVault()**: [`convertVault()`](../../../packages/obsidian-export/src/convert.ts#L8) - Convert entire Obsidian vault
- **convertMarkdown()**: [`convertMarkdown()`](../../../packages/obsidian-export/src/convert.ts#L51) - Convert individual markdown files

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/obsidian-export/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/obsidian-export/src)

## 📚 API Reference

### Functions

#### convertVault()
**Location**: [`src/convert.ts`](../../../packages/obsidian-export/src/convert.ts#L8)

**Description**: Converts an entire Obsidian vault to specified format.

**Parameters**:
- `vaultPath` - Path to the Obsidian vault
- `outputPath` - Output directory path
- `options` - Conversion options including format and wikilink handling

**Returns**: Promise<void> - Completes when conversion is finished

#### convertMarkdown()
**Location**: [`src/convert.ts`](../../../packages/obsidian-export/src/convert.ts#L51)

**Description**: Converts individual markdown files with wikilink resolution.

**Parameters**:
- `files` - Array of file paths to convert
- `options` - Conversion options

**Returns**: Promise<void> - Completes when conversion is finished

## Development Status

✅ **Active** - Core export functionality implemented and tested.

## Dependencies

- `@promethean-os/markdown` - Markdown processing
- `@promethean-os/fs` - File system operations
- `@promethean-os/logger` - Export logging

## Related Packages

- [[markdown]] - Markdown processing
- [[docops]] - Document operations
- [[github-sync]] - GitHub integration
