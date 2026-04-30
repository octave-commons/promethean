export default {
  // Covers all packages in the monorepo - both Clojure and TypeScript sources.
  includePaths: ['packages'],
  ignoreDirectories: [
    'node_modules',
    'dist',
    'build',
    'target',
    '.shadow-cljs',
    '.clj-kondo',
    '.git',
    '.cpcache',
    'resources',
  ],
  ignoreSuffixes: ['.d.ts'],
  thresholdsByExtension: {
    '.clj':  { warn: 350, error: 500 },
    '.cljc': { warn: 350, error: 500 },
    '.cljs': { warn: 350, error: 500 },
    '.ts':   { warn: 350, error: 500 },
    '.tsx':  { warn: 350, error: 500 },
  },
};
