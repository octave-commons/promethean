// ⚠️ DEPRECATED: @promethean-os/agent-ecs is deprecated
// Please use @promethean-os/pantheon-ecs instead
// Migration guide: https://github.com/promethean-os/promethean/blob/main/MIGRATION_PLAN.md

export * from '@promethean-os/pantheon-ecs';

// Enhanced deprecation warning with migration guidance
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const warning = [
    '',
    '⚠️  DEPRECATION WARNING:',
    '@promethean-os/agent-ecs is deprecated and will be removed in v2.0.0',
    '',
    '📖 MIGRATION REQUIRED:',
    '  Replace: import { ... } from "@promethean-os/agent-ecs"',
    '  With:     import { ... } from "@promethean-os/pantheon-ecs"',
    '',
    '📚 Documentation:',
    '  Migration Guide: https://github.com/promethean-os/promethean/blob/main/MIGRATION_PLAN.md',
    '  Package Docs:  https://github.com/promethean-os/promethean/tree/main/packages/pantheon-ecs',
    '',
  ].join('\n');

  console.warn(warning);
}
