// Compatibility shim for @promethean-os/agent-ecs
// Re-exports from @promethean-os/pantheon-ecs for backward compatibility

export * from '@promethean-os/pantheon-ecs';

// Deprecation warning
console.warn(
  '[@promethean-os/agent-ecs] DEPRECATED: Use @promethean-os/pantheon-ecs instead. ' +
    'This package will be removed in a future release.',
);
