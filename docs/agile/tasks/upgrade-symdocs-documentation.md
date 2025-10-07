---
uuid: a2b3c4d5-e6f7-8901-bcde-f23456789012
title: Upgrade symdocs to generate meaningful API documentation
status: incoming
priority: P2
labels: [symdocs, documentation, enhancement, ai, pipeline]
created_at: 2025-10-06T23:45:00.000Z
estimates: {}
---

# Upgrade symdocs to generate meaningful API documentation

## Problem Statement

Current symdocs pipeline only generates dependency graphs and metadata. The AI documentation generation step appears to be working but the resulting README files lack:

1. **Actual function signatures and class descriptions** - No API details beyond package metadata
2. **Usage examples and code samples** - No practical guidance for developers
3. **Meaningful package descriptions and purpose** - Generic templates that don't explain what packages do
4. **API documentation beyond just dependency relationships** - Missing the core value developers need

The system successfully extracts symbols and uses LLM to generate documentation, but the final output is generic templates instead of useful developer documentation.

## Investigation Tasks

- [ ] Debug why AI-generated docs aren't being integrated into final README output
- [ ] Review the 02-docs.ts AI generation step and verify it's producing meaningful content
- [ ] Check if 03-write.ts is properly merging AI content with templates
- [ ] Examine if there's a disconnect between symbol extraction and documentation writing
- [ ] Verify LLM integration is working and generating quality content

## Enhancement Tasks

- [ ] **Improve documentation templates** - Include actual API documentation sections
- [ ] **Enhance prompt engineering** - Get better, more detailed documentation from LLM
- [ ] **Add usage example generation** - Include practical code samples for major functions
- [ ] **Include TypeScript type definitions** - Show interfaces, types, and signatures in docs
- [ ] **Make output developer-friendly** - Less repetitive, more informative structure
- [ ] **Add package purpose descriptions** - Clearly explain what each package does and when to use it

## Success Criteria

1. Generated READMEs contain actual function/class documentation
2. Include practical usage examples for major APIs
3. Clear descriptions of package purpose and functionality
4. TypeScript signatures and type information visible
5. Developers can understand how to use packages without reading source code

## Technical Notes

- Uses LevelDB for caching incremental updates
- Pipeline steps: scan → docs → write → graph
- LLM integration via Ollama (qwen3:4b model)
- Outputs to `docs/packages/` directory structure
- Preserves existing manual content while updating auto-generated sections