// Compatibility shim for @promethean-os/$pkg
// Re-exports from @promethean-os/pantheon-generator for backward compatibility

export * from '@promethean-os/pantheon-generator';

// Deprecation warning
console.warn(
  '[@promethean-os/$pkg] DEPRECATED: Use @promethean-os/pantheon-generator instead. ' +
  'This package will be removed in a future release.'
);
