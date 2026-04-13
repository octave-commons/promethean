#!/usr/bin/env node
/**
 * Sintel CLI
 * 
 * Command-line interface for infrastructure signals intelligence.
 */

import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h', description: 'Show help' },
      version: { type: 'boolean', short: 'v', description: 'Show version' },
      strategy: { 
        type: 'string', 
        short: 's', 
        default: 'passive',
        description: 'Discovery strategy: passive, bounded, unrestricted'
      },
      output: {
        type: 'string',
        short: 'o',
        default: 'json',
        description: 'Output format: json, yaml, table'
      },
      exclude: {
        type: 'string',
        short: 'e',
        multiple: true,
        description: 'Exclusion categories'
      },
      config: {
        type: 'string',
        short: 'c',
        description: 'Path to config file'
      }
    }
  });

  if (values.help) {
    console.log(`
Sintel - Infrastructure Signals Intelligence

Usage: sintel [command] [options] <targets...>

Commands:
  discover    Discover signals for targets
  verify      Verify existing observations
  aggregate   Aggregate and score signals
  workflow    Manage workflows

Options:
  -s, --strategy <type>  Discovery strategy (default: passive)
  -o, --output <format>  Output format (default: json)
  -e, --exclude <cat>    Exclusion categories (multiple)
  -c, --config <path>    Path to config file
  -h, --help             Show this help
  -v, --version          Show version

Examples:
  # Passive DNS discovery
  sintel discover example.com

  # Bounded HTTP/TLS probing
  sintel discover -s bounded example.com --ports 80,443

  # Aggregate multiple targets
  sintel aggregate target1.com target2.com target3.com

  # With exclusions
  sintel discover -e healthcare -e critical_infrastructure example.com
`);
    process.exit(0);
  }

  if (values.version) {
    console.log(`sintel v${pkg.version}`);
    process.exit(0);
  }

  const [command, ...args] = positionals;

  switch (command) {
    case 'discover':
      await handleDiscover(args, values);
      break;
    case 'verify':
      await handleVerify(args, values);
      break;
    case 'aggregate':
      await handleAggregate(args, values);
      break;
    case 'workflow':
      await handleWorkflow(args, values);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run `sintel --help` for usage');
      process.exit(1);
  }
}

async function handleDiscover(
  targets: string[],
  options: Record<string, unknown>
) {
  const { SignalAggregator, createAggregator } = await import('../aggregate/aggregator.js');
  const { CONSTITUTIONAL_EXCLUSIONS, createExclusion } = await import('../policy/exclusions.js');

  if (targets.length === 0) {
    console.error('Error: No targets specified');
    process.exit(1);
  }

  console.error(`Discovering signals for ${targets.length} target(s)...`);

  // Build discovery targets
  const discoveryTargets = targets.map(t => ({
    id: crypto.randomUUID(),
    hostname: t,
    scope: 'cli'
  }));

  // Build exclusion set
  const exclusions = {
    global: CONSTITUTIONAL_EXCLUSIONS,
    org: [],
    workflow: [],
    effective: CONSTITUTIONAL_EXCLUSIONS
  };

  // Create aggregator
  const aggregator = createAggregator({
    passive_sources: ['dns'],
    bounded_sources: ['http', 'tls'],
    bounds: { timeout_ms: 5000 }
  });

  // Run aggregation
  const results = await aggregator.aggregateAll(discoveryTargets, exclusions);

  // Output
  if (options.output === 'json') {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(results);
  }
}

async function handleVerify(
  args: string[],
  options: Record<string, unknown>
) {
  console.error('Verify command not yet implemented');
  process.exit(1);
}

async function handleAggregate(
  targets: string[],
  options: Record<string, unknown>
) {
  // Same as discover but with different output
  await handleDiscover(targets, { ...options, output: 'json' });
}

async function handleWorkflow(
  args: string[],
  options: Record<string, unknown>
) {
  const subcommand = args[0];

  if (!subcommand) {
    console.error('Workflow subcommand required: create, list, status');
    process.exit(1);
  }

  const { WorkflowEngine } = await import('../workflow/engine.js');
  const { InMemoryWorkflowStore } = await import('../memory/store.js');

  switch (subcommand) {
    case 'create': {
      const engine = new WorkflowEngine(new InMemoryWorkflowStore());
      const workflow = await engine.create({
        goal: args[1] || 'CLI workflow',
        strategy: options.strategy as any || 'passive',
        exclusions: { global: [], org: [], workflow: [], effective: [] },
        created_by: 'cli-user'
      });
      console.log(JSON.stringify(workflow, null, 2));
      break;
    }
    case 'list': {
      console.log('[]');
      break;
    }
    default:
      console.error(`Unknown workflow subcommand: ${subcommand}`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});