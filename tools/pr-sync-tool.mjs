#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MultiProviderLLM } from './llm-providers.mjs';

/**
 * General-purpose PR batch update tool with LLM-powered conflict resolution
 *
 * Features:
 * - Batch update multiple PR branches
 * - Intelligent conflict resolution using local LLMs
 * - Context gathering with symbol search and ChromaDB
 * - Automatic fallback strategies
 * - Detailed logging and reporting
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PRSyncTool {
  constructor(options = {}) {
    this.options = {
      baseBranch: 'main',
      conflictResolution: 'llm', // 'llm', 'theirs', 'ours', 'manual'
      llmModel: 'qwen2.5-coder:7b', // fallback model
      maxRetries: 3,
      dryRun: false,
      contextWindow: 8000,
      gatherContext: true,
      testProviders: true, // test providers on startup
      ...options
    };

    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      conflicts: 0,
      llmResolutions: 0,
      providerFallbacks: 0
    };

    // Initialize multi-provider LLM system
    this.llm = MultiProviderLLM.createFromConfig();
  }

  async runCommand(cmd, options = {}) {
    try {
      const result = execSync(cmd, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options
      });
      return { success: true, output: result.trim(), error: null };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || ''
      };
    }
  }

  async getConflictedFiles() {
    const statusResult = await this.runCommand('git status --porcelain=v1');
    if (!statusResult.success) return [];

    const lines = statusResult.output.split('\n');
    const conflictedFiles = [];

    for (const line of lines) {
      if (line.startsWith('UU ') || line.startsWith('AA ') || line.startsWith('DU ') || line.startsWith('AU ')) {
        conflictedFiles.push(line.substring(3));
      }
    }

    return conflictedFiles;
  }

  async gatherFileContext(filePath) {
    if (!this.options.gatherContext) return '';

    const context = [];

    // Get file content with conflict markers
    const conflictContent = await this.runCommand(`cat "${filePath}"`);
    if (conflictContent.success) {
      context.push(`CONFLICT FILE: ${filePath}`);
      context.push('CONFLICT CONTENT:');
      context.push('```');
      context.push(conflictContent.output);
      context.push('```');
      context.push('');
    }

    // Get git diff for context
    const diffResult = await this.runCommand(`git diff --HEAD "${filePath}"`);
    if (diffResult.success && diffResult.output) {
      context.push('GIT DIFF:');
      context.push('```diff');
      context.push(diffResult.output);
      context.push('```');
      context.push('');
    }

    // Get symbol search results if it's a code file
    if (this.isCodeFile(filePath)) {
      const symbolContext = await this.gatherSymbolContext(filePath);
      if (symbolContext) {
        context.push('SYMBOL CONTEXT:');
        context.push(symbolContext);
        context.push('');
      }
    }

    // Get git history for the file
    const historyResult = await this.runCommand(`git log --oneline -10 "${filePath}"`);
    if (historyResult.success && historyResult.output) {
      context.push('RECENT COMMITS:');
      context.push('```');
      context.push(historyResult.output);
      context.push('```');
      context.push('');
    }

    return context.join('\n');
  }

  isCodeFile(filePath) {
    const codeExtensions = ['.js', '.mjs', '.ts', '.tsx', '.py', '.rs', '.go', '.java', '.cpp', '.c', '.h'];
    return codeExtensions.some(ext => filePath.endsWith(ext));
  }

  async gatherSymbolContext(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js') && !filePath.endsWith('.mjs')) {
      return '';
    }

    // Try to find related symbols and their usage
    const fileName = filePath.split('/').pop();
    const fileBase = fileName.replace(/\.(ts|js|mjs)$/, '');

    // Look for imports/exports of this module
    const importsResult = await this.runCommand(`rg "from.*['\"].*${fileBase}['\"]" --type ts --type js -A 1 -B 1`);
    if (importsResult.success && importsResult.output) {
      return `IMPORTS/USAGE:\n${importsResult.output}`;
    }

    return '';
  }

  async resolveConflictWithLLM(filePath, conflictContent) {
    console.log(`🤖 Attempting LLM conflict resolution for ${filePath}`);

    const context = await this.gatherFileContext(filePath);

    const prompt = `You are an expert developer tasked with resolving git merge conflicts. Your goal is to create a clean, working merge that preserves the intent of both branches.

RULES:
1. Remove all git conflict markers (<<<<<<<, =======, >>>>>>>)
2. Create a semantically correct merge of both versions
3. Prioritize functional correctness over preserving both implementations
4. If one version is clearly newer/better, prefer it
5. Ensure the final code is syntactically correct
6. Don't add explanatory comments - just provide the resolved code

CONTEXT:
${context}

MERGE INSTRUCTIONS:
Provide only the resolved file content. Start with the first line of the file and end with the last. Do not include any explanations or markdown formatting.

CONFLICTED CONTENT:
${conflictContent}

RESOLVED CONTENT:`;

    try {
      const resolvedContent = await this.llm.resolveConflict(prompt, {
        model: this.options.llmModel,
        timeout: 45000
      });

      if (resolvedContent) {
        console.log(`✅ ${this.llm.getCurrentProvider()} successfully resolved conflicts in ${filePath}`);
        this.stats.llmResolutions++;
        return resolvedContent;
      }
    } catch (error) {
      console.log(`⚠️ All LLM providers failed for ${filePath}: ${error.message}`);
      console.log(`📋 Fallback log: ${JSON.stringify(this.llm.getFallbackLog(), null, 2)}`);
    }

    return null;
  }

  async testLLMProviders() {
    if (!this.options.testProviders) return;

    console.log('🔍 Testing LLM providers...\n');
    const results = await this.llm.testAllProviders();

    const availableProviders = results.filter(r => r.success);
    if (availableProviders.length === 0) {
      console.log('❌ No LLM providers available. LLM conflict resolution will be disabled.');
      console.log('💡 Set up one of the following:');
      console.log('   - Ollama: ollama pull qwen2.5-coder:7b');
      console.log('   - OpenAI: export OPENAI_API_KEY=your_key');
      console.log('   - ZAI: export ZAI_API_KEY=your_key ZAI_BASE_URL=your_url');
      console.log('   - OpenRouter: export OPENROUTER_API_KEY=your_key');

      // Fall back to non-LLM resolution
      this.options.conflictResolution = 'theirs';
    } else {
      console.log(`✅ ${availableProviders.length} LLM providers available for conflict resolution`);
    }
  }

  async resolveConflicts(conflictedFiles) {
    console.log(`🔧 Resolving ${conflictedFiles.length} conflicted files...`);

    for (const filePath of conflictedFiles) {
      let resolved = false;

      // Special handling for lock files
      if (filePath.includes('lock') || filePath.includes('package-lock')) {
        console.log(`🔒 Using base branch version for lock file: ${filePath}`);
        const result = await this.runCommand(`git checkout --theirs "${filePath}"`);
        if (result.success) {
          await this.runCommand(`git add "${filePath}"`);
          resolved = true;
        }
        continue;
      }

      // Try LLM resolution for code files
      if (this.options.conflictResolution === 'llm' && this.isCodeFile(filePath)) {
        const conflictContent = await this.runCommand(`cat "${filePath}"`);
        if (conflictContent.success) {
          const resolvedContent = await this.resolveConflictWithLLM(filePath, conflictContent.output);
          if (resolvedContent) {
            writeFileSync(filePath, resolvedContent, 'utf8');
            await this.runCommand(`git add "${filePath}"`);
            resolved = true;
          }
        }
      }

      // Fallback strategies
      if (!resolved) {
        if (this.options.conflictResolution === 'theirs') {
          console.log(`📥 Using their version for ${filePath}`);
          await this.runCommand(`git checkout --theirs "${filePath}"`);
        } else if (this.options.conflictResolution === 'ours') {
          console.log(`📤 Using our version for ${filePath}`);
          await this.runCommand(`git checkout --ours "${filePath}"`);
        } else {
          console.log(`⚠️ Manual resolution needed for ${filePath}`);
          // For manual resolution, we'll keep the conflict markers for now
          continue;
        }

        await this.runCommand(`git add "${filePath}"`);
      }
    }

    // Check if conflicts are resolved
    const remainingConflicts = await this.getConflictedFiles();
    return remainingConflicts.length === 0;
  }

  async updatePRBranch(pr) {
    console.log(`\n🔄 Updating PR #${pr.number}: ${pr.branch}`);

    try {
      // Fetch latest changes
      await this.runCommand('git fetch origin');

      // Checkout PR branch
      const checkoutResult = await this.runCommand(`git checkout ${pr.branch}`);
      if (!checkoutResult.success) {
        console.log(`❌ Failed to checkout ${pr.branch}: ${checkoutResult.error}`);
        return false;
      }

      // Attempt to merge base branch
      const mergeResult = await this.runCommand(
        `git merge origin/${this.options.baseBranch} -m "Merge latest ${this.options.baseBranch} changes"`
      );

      if (!mergeResult.success) {
        console.log(`⚠️ Merge conflicts detected for PR #${pr.number}`);
        this.stats.conflicts++;

        const conflictedFiles = await this.getConflictedFiles();
        console.log(`📋 Conflicted files: ${conflictedFiles.join(', ')}`);

        const resolved = await this.resolveConflicts(conflictedFiles);

        if (resolved) {
          console.log(`✅ Successfully resolved conflicts for PR #${pr.number}`);
          await this.runCommand('git commit --no-edit');
        } else {
          console.log(`❌ Failed to resolve conflicts for PR #${pr.number}`);
          await this.runCommand('git merge --abort');
          return false;
        }
      } else {
        console.log(`✅ Clean merge for PR #${pr.number}`);
      }

      // Push changes if not dry run
      if (!this.options.dryRun) {
        const pushResult = await this.runCommand(
          `git push origin ${pr.branch} --force-with-lease`
        );
        if (!pushResult.success) {
          console.log(`⚠️ Failed to push PR #${pr.number}: ${pushResult.error}`);
        }
      }

      this.stats.success++;
      return true;

    } catch (error) {
      console.log(`❌ Error updating PR #${pr.number}: ${error.message}`);
      this.stats.failed++;
      return false;
    }
  }

  async updatePRs(prList) {
    console.log(`🚀 Starting PR batch update to ${this.options.baseBranch}...\n`);

    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be pushed\n');
    }

    // Test LLM providers if needed
    if (this.options.conflictResolution === 'llm') {
      await this.testLLMProviders();
    }

    // Save current branch
    const currentBranch = await this.runCommand('git branch --show-current');
    if (!currentBranch.success) {
      console.log('❌ Could not determine current branch');
      return;
    }

    console.log(`💾 Current branch: ${currentBranch.output}`);

    this.stats.total = prList.length;

    for (const pr of prList) {
      await this.updatePRBranch(pr);
    }

    // Return to original branch
    await this.runCommand(`git checkout ${currentBranch.output}`);

    this.printSummary();
  }

  printSummary() {
    console.log(`\n📊 PR Batch Update Summary:`);
    console.log(`Total PRs: ${this.stats.total}`);
    console.log(`✅ Successfully updated: ${this.stats.success}`);
    console.log(`❌ Failed to update: ${this.stats.failed}`);
    console.log(`⚠️ Conflicts encountered: ${this.stats.conflicts}`);
    console.log(`🤖 LLM resolutions: ${this.stats.llmResolutions}`);

    if (this.stats.llmResolutions > 0) {
      console.log(`🎯 LLM resolution rate: ${Math.round((this.stats.llmResolutions / this.stats.conflicts) * 100)}%`);
    }

    // Show provider information
    if (this.llm && this.options.conflictResolution === 'llm') {
      const currentProvider = this.llm.getCurrentProvider();
      if (currentProvider) {
        console.log(`🔧 Primary LLM provider: ${currentProvider}`);
      }

      const fallbackLog = this.llm.getFallbackLog();
      if (fallbackLog.length > 0) {
        console.log(`🔄 Provider fallbacks: ${fallbackLog.length}`);
        fallbackLog.forEach(log => {
          console.log(`   - ${log.provider}: ${log.error}`);
        });
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

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
      case '--help':
        console.log(`
PR Sync Tool - Batch update PR branches with intelligent conflict resolution

Usage: node pr-sync-tool.mjs [options]

Options:
  --base <branch>        Base branch to merge from (default: main)
  --resolution <mode>    Conflict resolution mode: llm, ours, theirs, manual (default: llm)
  --model <model>        LLM model for conflict resolution (default: qwen2.5-coder:7b)
  --dry-run              Simulate updates without pushing changes
  --no-context           Disable context gathering for LLM resolution
  --help                 Show this help message

Examples:
  # Update all PRs to main with LLM conflict resolution
  node pr-sync-tool.mjs --base main --resolution llm

  # Dry run to see what would happen
  node pr-sync-tool.mjs --base dev/stealth --dry-run

  # Use automatic "theirs" resolution for lock files only
  node pr-sync-tool.mjs --base main --resolution theirs
        `);
        return;
    }
  }

  // Get PR list from command line or stdin
  let prInput = '';
  if (!process.stdin.isTTY) {
    prInput = await new Promise(resolve => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data));
    });
  }

  const prList = prInput ? parsePRInput(prInput) : await getPRsFromGitHub(options.baseBranch);

  const tool = new PRSyncTool(options);
  await tool.updatePRs(prList);
}

function parsePRInput(input) {
  // Parse JSON array of PR objects
  try {
    return JSON.parse(input);
  } catch {
    // Parse simple branch names (one per line)
    return input.trim().split('\n').map((line, index) => ({
      number: index + 1,
      branch: line.trim()
    })).filter(pr => pr.branch);
  }
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

export { PRSyncTool };