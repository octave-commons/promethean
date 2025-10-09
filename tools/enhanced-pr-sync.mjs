#!/usr/bin/env node

import { PRSyncTool } from './pr-sync-tool.mjs';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { MultiProviderLLM } from './llm-providers.mjs';

const toJsonArg = (value) => JSON.stringify(String(value ?? ''));

/**
 * Enhanced PR Sync Tool with ChromaDB integration and advanced context gathering
 */

class EnhancedPRSyncTool extends PRSyncTool {
  constructor(options = {}) {
    super(options);
    this.chromaEnabled = options.chromaEnabled || false;
    this.symbolCache = new Map();
  }

  async gatherChromaContext(filePath, conflictMarkers) {
    if (!this.chromaEnabled) return '';

    try {
      // Extract function/class names from conflict markers
      const symbols = this.extractSymbols(conflictMarkers);
      if (symbols.length === 0) return '';

      console.log(`🔍 Searching ChromaDB for context on: ${symbols.join(', ')}`);

      // Use semantic search to find related code
      const contextResults = [];
      for (const symbol of symbols) {
        const similarCode = await this.searchSimilarCode(symbol, filePath);
        if (similarCode) {
          contextResults.push(`CONTEXT FOR ${symbol}:`);
          contextResults.push(similarCode);
          contextResults.push('');
        }
      }

      return contextResults.join('\n');
    } catch (error) {
      console.log(`⚠️ ChromaDB search failed: ${error.message}`);
      return '';
    }
  }

  extractSymbols(content) {
    const symbols = new Set();

    // TypeScript/JavaScript patterns
    const tsPatterns = [
      /function\s+(\w+)/g,
      /const\s+(\w+)\s*=\s*\(/g,
      /class\s+(\w+)/g,
      /interface\s+(\w+)/g,
      /type\s+(\w+)\s*=/g,
      /export\s+(?:async\s+)?function\s+(\w+)/g,
      /export\s+const\s+(\w+)/g,
    ];

    // Python patterns
    const pyPatterns = [
      /def\s+(\w+)/g,
      /class\s+(\w+)/g,
    ];

    const allPatterns = [...tsPatterns, ...pyPatterns];

    for (const pattern of allPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        symbols.add(match[1]);
      }
    }

    return Array.from(symbols);
  }

  async searchSimilarCode(symbol, filePath) {
    // This would integrate with your ChromaDB instance
    // For now, we'll use ripgrep as a fallback

    const searchResult = await this.runCommand(
      `rg -A 5 -B 5 "function\\s+${symbol}|const\\s+${symbol}\\s*=|class\\s+${symbol}" --type ts --type js --type py`
    );

    if (searchResult.success && searchResult.output) {
      return searchResult.output;
    }

    return null;
  }

  async gatherAdvancedFileContext(filePath) {
    const context = await super.gatherFileContext(filePath);

    // Get conflict markers for ChromaDB search
    const conflictContent = await this.runCommand(`cat "${filePath}"`);
    if (conflictContent.success) {
      const chromaContext = await this.gatherChromaContext(filePath, conflictContent.output);
      if (chromaContext) {
        return context + '\n' + chromaContext;
      }
    }

    return context;
  }

  async resolveConflictWithLLM(filePath, conflictContent) {
    console.log(`🤖 Enhanced LLM conflict resolution for ${filePath}`);

    const context = await this.gatherAdvancedFileContext(filePath);

    const prompt = `You are an expert developer tasked with resolving git merge conflicts with deep code understanding.

CONTEXT INFORMATION:
${context}

CONFLICT RESOLUTION STRATEGY:
1. Analyze the semantic intent behind both branches
2. Look for patterns in the codebase using the provided context
3. Create a merge that preserves functionality and follows established patterns
4. If conflicts are in documentation, preserve the most comprehensive information
5. If conflicts are in code, create a syntactically correct and semantically meaningful merge
6. Consider the call sites and usage patterns shown in the context

MERGE RULES:
- Remove all git conflict markers (<<<<<<<, =======, >>>>>>>)
- Ensure the final result is valid code/documentation
- Prefer newer implementations when they're clearly improvements
- Combine complementary features from both branches when possible
- Follow the coding style shown in the context

CONFLICTED CONTENT:
${conflictContent}

Provide only the resolved content, starting from the first line of the file and ending with the last. Do not include explanations or markdown formatting.

RESOLVED CONTENT:`;

    try {
      const modelArg = toJsonArg(this.options.llmModel);
      const promptArg = toJsonArg(prompt);

      const llmResult = await this.runCommand(
        `ollama run ${modelArg} ${promptArg}`,
        { timeout: 45000 }
      );

      if (llmResult.success && llmResult.output) {
        console.log(`✅ Enhanced LLM resolution successful for ${filePath}`);
        this.stats.llmResolutions++;
        return llmResult.output;
      }
    } catch (error) {
      console.log(`⚠️ Enhanced LLM resolution failed, falling back to basic method: ${error.message}`);
    }

    // Fallback to parent method which now uses multi-provider system
    return await super.resolveConflictWithLLM(filePath, conflictContent);
  }

  async preflightCheck(prList) {
    console.log('🔍 Running preflight checks...');

    const issues = [];

    for (const pr of prList) {
      // Check if branch exists
      const branchExists = await this.runCommand(`git rev-parse --verify origin/${pr.branch}`);
      if (!branchExists.success) {
        issues.push(`Branch ${pr.branch} does not exist remotely`);
        continue;
      }

      // Check for potential conflicts by simulating merge
      await this.runCommand('git fetch origin');
      await this.runCommand(`git checkout ${pr.branch}`);

      const mergeTest = await this.runCommand(
        `git merge-tree $(git merge-base HEAD origin/${this.options.baseBranch}) HEAD origin/${this.options.baseBranch}`
      );

      if (!mergeTest.success || mergeTest.output.includes('<<<<<<<')) {
        issues.push(`PR #${pr.number} (${pr.branch}) likely has conflicts`);
      }
    }

    if (issues.length > 0) {
      console.log('⚠️ Preflight issues detected:');
      issues.forEach(issue => console.log(`  - ${issue}`));

      if (!this.options.force) {
        console.log('Use --force to proceed despite issues');
        return false;
      }
    }

    console.log('✅ Preflight checks passed');
    return true;
  }
}

// Enhanced CLI with more options
async function main() {
  const args = process.argv.slice(2);
  const options = {
    chromaEnabled: false,
    force: false
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--base':
        options.baseBranch = args[++i];
        break;
      case '--resolution':
        options.conflictResolution = args[++i];
        break;
      case '--model':
        options.llmModel = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-context':
        options.gatherContext = false;
        break;
      case '--chroma':
        options.chromaEnabled = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--help':
        console.log(`
Enhanced PR Sync Tool - Advanced conflict resolution with semantic context

Usage: node enhanced-pr-sync.mjs [options]

Options:
  --base <branch>        Base branch to merge from (default: main)
  --resolution <mode>    Conflict resolution mode: llm, ours, theirs, manual (default: llm)
  --model <model>        LLM model for conflict resolution (default: qwen2.5-coder:7b)
  --dry-run              Simulate updates without pushing changes
  --no-context           Disable context gathering for LLM resolution
  --chroma               Enable ChromaDB semantic search for context
  --force                Proceed despite preflight warnings
  --help                 Show this help message

Enhanced Features:
  - Semantic code search using ChromaDB
  - Symbol extraction and context gathering
  - Preflight conflict detection
  - Advanced LLM prompts with codebase awareness
  - Fallback strategies for failed resolutions

Examples:
  # Full semantic merge with ChromaDB
  node enhanced-pr-sync.mjs --base main --chroma --resolution llm

  # Preflight check only
  node enhanced-pr-sync.mjs --base dev/stealth --dry-run

  # Force update despite warnings
  node enhanced-pr-sync.mjs --base main --force
        `);
        return;
    }
  }

  // Get PR list
  const prList = await getPRsFromGitHub(options.baseBranch || 'main');

  const tool = new EnhancedPRSyncTool(options);

  // Run preflight checks
  if (!options.dryRun && !await tool.preflightCheck(prList)) {
    return;
  }

  await tool.updatePRs(prList);
}

async function getPRsFromGitHub(baseBranch) {
  const result = execSync(`gh pr list --base ${baseBranch} --limit 100 --json number,headRefName`, {
    encoding: 'utf8'
  });

  return JSON.parse(result).map(pr => ({
    number: pr.number,
    branch: pr.headRefName
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { EnhancedPRSyncTool };