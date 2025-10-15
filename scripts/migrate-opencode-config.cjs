#!/usr/bin/env node

/**
 * OpenCode Configuration Migration Script
 *
 * Migrates from the custom Promethean configuration format
 * to the official OpenCode configuration schema.
 */

const fs = require('fs');

// Model mapping from old format to valid OpenCode model IDs
const MODEL_MAPPING = {
  'qwen2.5-coder:7b': 'openrouter.qwen2.5-coder-7b-instruct',
  'qwen2.5:7b': 'openrouter.qwen2.5-7b-instruct',
  'qwen3:8b': 'openrouter.qwen3-8b',
  'qwen3:14b': 'openrouter.qwen3-14b',
  'gpt-oss:20b': 'openrouter.deepseek-r1-distill-llama-70b',
  'gpt-oss:120b-cloud': 'openrouter.deepseek-r1',
  'qwen3-coder:408b-cloud': 'openrouter.qwen3-coder-408b',
};

class ConfigMigrator {
  constructor() {
    this.migrations = [];
  }

  migrateConfig(inputPath, outputPath) {
    console.log(`🔄 Migrating ${inputPath} to ${outputPath}...`);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const oldConfig = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const newConfig = this.transformConfig(oldConfig);

    fs.writeFileSync(outputPath, JSON.stringify(newConfig, null, 2));

    console.log(`✅ Migration complete!`);
    this.printMigrationSummary();

    return newConfig;
  }

  transformConfig(oldConfig) {
    const newConfig = {
      $schema: 'https://opencode.ai/config.json',
      providers: this.transformProviders(oldConfig.provider || {}),
      agents: this.transformAgents(oldConfig.agents || {}),
      mcp: oldConfig.mcp || {},
      lsp: oldConfig.lsp || {},
      instructions: oldConfig.instructions || [],
      tools: oldConfig.tools || {},
    };

    return newConfig;
  }

  transformProviders(oldProviders) {
    const newProviders = {};

    // Add OpenRouter provider for most models
    if (oldProviders.ollama) {
      newProviders.openrouter = {
        provider: 'openrouter',
        apiKey: '{env:OPENROUTER_API_KEY}',
        disabled: false,
      };
      this.migrations.push('Added OpenRouter provider for model access');
    }

    // Add Z.AI provider
    if (oldProviders['zai-coding-plan']) {
      newProviders['zai-coding-plan'] = {
        provider: 'custom',
        apiKey: '{env:Z_AI_API_KEY}',
        disabled: false,
      };
      this.migrations.push('Added Z.AI provider configuration');
    }

    return newProviders;
  }

  transformAgents(oldAgents) {
    const newAgents = {};

    if (oldAgents.model_assignments) {
      for (const assignment of Object.values(oldAgents.model_assignments)) {
        const primaryModel = MODEL_MAPPING[assignment.primary] || assignment.primary;

        if (assignment.agents) {
          for (const agentName of assignment.agents) {
            newAgents[agentName] = {
              model: primaryModel,
              maxTokens: 32768,
              reasoningEffort: this.mapReasoningEffort(assignment.options?.reasoning_effort),
              temperature: assignment.options?.temperature || 0.2,
            };

            this.migrations.push(`Migrated agent ${agentName} to model ${primaryModel}`);
          }
        }
      }
    }

    return newAgents;
  }

  mapReasoningEffort(oldEffort) {
    const mapping = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      maximum: 'high', // OpenCode schema only supports up to 'high'
    };

    return mapping[oldEffort] || 'medium';
  }

  printMigrationSummary() {
    console.log('\n📋 Migration Summary:');
    this.migrations.forEach((migration, index) => {
      console.log(`  ${index + 1}. ${migration}`);
    });

    console.log('\n📝 Next Steps:');
    console.log('  1. Set required environment variables:');
    console.log('     - OPENROUTER_API_KEY (for most models)');
    console.log('     - Z_AI_API_KEY (for Z.AI services)');
    console.log('  2. Test the new configuration');
    console.log('  3. Validate with: node scripts/validate-opencode-config.cjs <new-config>');
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node migrate-opencode-config.cjs <input-config> <output-config>');
    console.log('Example: node migrate-opencode-config.cjs opencode.json opencode-migrated.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const migrator = new ConfigMigrator();

  try {
    migrator.migrateConfig(inputPath, outputPath);
    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    console.error(`❌ Migration failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConfigMigrator;
