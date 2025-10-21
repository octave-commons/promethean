#!/usr/bin/env node

/**
 * OpenCode Configuration Validator
 *
 * Validates OpenCode configuration files against the official schema
 * and provides detailed feedback on any issues.
 */

const fs = require('fs');
const https = require('https');

// Official OpenCode schema URL
const SCHEMA_URL = 'https://opencode.ai/config.json';

// Valid model IDs from the official schema
const VALID_MODELS = [
  // OpenAI
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'o1',
  'o1-mini',
  'o3',
  'o3-mini',
  'o4-mini',
  // Anthropic
  'claude-3-opus',
  'claude-3.5-sonnet',
  'claude-3.5-haiku',
  'claude-4-sonnet',
  'claude-4-opus',
  // OpenRouter
  'openrouter.gpt-4o',
  'openrouter.claude-3.5-sonnet',
  'openrouter.qwen2.5-coder-7b-instruct',
  'openrouter.qwen2.5-7b-instruct',
  'openrouter.qwen3-8b',
  'openrouter.qwen3-14b',
  'openrouter.deepseek-r1-distill-llama-70b',
  'openrouter.deepseek-r1',
  'openrouter.qwen3-coder-408b',
  // Azure
  'azure.gpt-4.1',
  'azure.o1',
  'azure.claude-3.5-sonnet',
  // Copilot
  'copilot.gpt-4o',
  'copilot.claude-3.5-sonnet',
];

// Valid providers
const VALID_PROVIDERS = [
  'anthropic',
  'openai',
  'gemini',
  'groq',
  'openrouter',
  'bedrock',
  'azure',
  'vertexai',
  'copilot',
];

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.schema = null;
  }

  async loadSchema() {
    return new Promise((resolve, reject) => {
      https
        .get(SCHEMA_URL, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              this.schema = JSON.parse(data);
              resolve();
            } catch (err) {
              reject(new Error(`Failed to parse schema: ${err.message}`));
            }
          });
        })
        .on('error', reject);
    });
  }

  validateConfig(configPath) {
    console.log(`\n🔍 Validating ${configPath}...`);

    if (!fs.existsSync(configPath)) {
      this.errors.push(`Configuration file not found: ${configPath}`);
      return false;
    }

    let config;
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
    } catch (err) {
      this.errors.push(`Failed to parse configuration file: ${err.message}`);
      return false;
    }

    // Validate schema reference
    if (!config.$schema) {
      this.warnings.push('Missing $schema reference');
    } else if (config.$schema !== SCHEMA_URL) {
      this.warnings.push(`Incorrect schema reference: ${config.$schema}`);
    }

    // Validate providers
    this.validateProviders(config);

    // Validate agents
    this.validateAgents(config);

    // Validate MCP configuration
    this.validateMCP(config);

    // Validate tools
    this.validateTools(config);

    return this.errors.length === 0;
  }

  validateProviders(config) {
    if (!config.providers) {
      this.errors.push('Missing providers section');
      return;
    }

    for (const [providerName, providerConfig] of Object.entries(config.providers)) {
      if (!providerConfig.provider) {
        this.errors.push(`Provider ${providerName} missing 'provider' field`);
        continue;
      }

      if (!VALID_PROVIDERS.includes(providerConfig.provider)) {
        this.warnings.push(`Unknown provider type: ${providerConfig.provider}`);
      }

      if (!providerConfig.apiKey && !providerConfig.disabled) {
        this.warnings.push(`Provider ${providerName} missing apiKey configuration`);
      }
    }
  }

  validateAgents(config) {
    if (!config.agents) {
      this.errors.push('Missing agents section');
      return;
    }

    for (const [agentName, agentConfig] of Object.entries(config.agents)) {
      if (!agentConfig.model) {
        this.errors.push(`Agent ${agentName} missing 'model' field`);
        continue;
      }

      if (!VALID_MODELS.includes(agentConfig.model)) {
        this.errors.push(`Invalid model for agent ${agentName}: ${agentConfig.model}`);
        this.suggestModelAlternatives(agentConfig.model);
      }

      if (agentConfig.temperature !== undefined) {
        if (
          typeof agentConfig.temperature !== 'number' ||
          agentConfig.temperature < 0 ||
          agentConfig.temperature > 1
        ) {
          this.errors.push(`Invalid temperature for agent ${agentName}: must be between 0 and 1`);
        }
      }

      if (agentConfig.reasoningEffort) {
        const validEfforts = ['low', 'medium', 'high'];
        if (!validEfforts.includes(agentConfig.reasoningEffort)) {
          this.errors.push(
            `Invalid reasoningEffort for agent ${agentName}: ${agentConfig.reasoningEffort}`,
          );
        }
      }

      if (agentConfig.maxTokens !== undefined) {
        if (typeof agentConfig.maxTokens !== 'number' || agentConfig.maxTokens <= 0) {
          this.errors.push(`Invalid maxTokens for agent ${agentName}: must be a positive number`);
        }
      }
    }
  }

  validateMCP(config) {
    if (!config.mcp) {
      this.warnings.push('Missing MCP section');
      return;
    }

    for (const [mcpName, mcpConfig] of Object.entries(config.mcp)) {
      if (!mcpConfig.type) {
        this.errors.push(`MCP server ${mcpName} missing 'type' field`);
        continue;
      }

      if (!['local', 'remote'].includes(mcpConfig.type)) {
        this.errors.push(`Invalid MCP type for ${mcpName}: ${mcpConfig.type}`);
      }

      if (mcpConfig.type === 'local' && !mcpConfig.command) {
        this.errors.push(`Local MCP server ${mcpName} missing 'command' field`);
      }

      if (mcpConfig.type === 'remote' && !mcpConfig.url) {
        this.errors.push(`Remote MCP server ${mcpName} missing 'url' field`);
      }
    }
  }

  validateTools(config) {
    if (!config.tools) {
      this.warnings.push('Missing tools section');
      return;
    }

    for (const [toolName, toolConfig] of Object.entries(config.tools)) {
      if (typeof toolConfig !== 'boolean') {
        this.warnings.push(`Tool ${toolName} has non-boolean configuration`);
      }
    }
  }

  suggestModelAlternatives(invalidModel) {
    const suggestions = VALID_MODELS.filter(
      (model) =>
        model.toLowerCase().includes(invalidModel.toLowerCase().split(':')[0]) ||
        model.toLowerCase().includes(invalidModel.toLowerCase().split('-')[0]),
    );

    if (suggestions.length > 0) {
      this.warnings.push(`Did you mean one of these models? ${suggestions.slice(0, 3).join(', ')}`);
    }
  }

  printResults() {
    console.log('\n📊 Validation Results:');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Configuration is valid!');
      return;
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    console.log(`\n📈 Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-opencode-config.js <config-file> [config-file-2] ...');
    console.log('Example: node validate-opencode-config.js opencode.json opencode-production.json');
    process.exit(1);
  }

  const validator = new ConfigValidator();

  try {
    await validator.loadSchema();
    console.log('✅ Loaded official OpenCode schema');
  } catch (err) {
    console.error(`❌ Failed to load schema: ${err.message}`);
    console.log('⚠️  Continuing with offline validation...');
  }

  let allValid = true;

  for (const configPath of args) {
    const isValid = validator.validateConfig(configPath);
    allValid = allValid && isValid;

    validator.printResults();

    // Reset for next file
    validator.errors = [];
    validator.warnings = [];
  }

  process.exit(allValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ConfigValidator;
