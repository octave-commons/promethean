// Compatibility shim for @promethean-os/$pkg
// Re-exports from @promethean-os/pantheon-${pkg#agent-} for backward compatibility

export * from '@promethean-os/pantheon-${pkg#agent-}';

// Deprecation warning
console.warn(
  '[@promethean-os/$pkg] DEPRECATED: Use @promethean-os/pantheon-${pkg#agent-} instead. ' +
  'This package will be removed in a future release.'
);
