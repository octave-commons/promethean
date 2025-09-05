// Centralized AVA config for the monorepo
// Applies consistent file globs and a default timeout to prevent hanging tests.
export default {
  files: [
    "services/**/src/**/*.test.{ts,js}",
    "services/**/src/**/tests/**/*.{ts,js}",
    "packages/**/src/**/*.test.{ts,js}",
    "packages/**/src/**/test/**/*.{ts,js}",
    "packages/**/src/**/tests/**/*.{ts,js}",
    "packages/**/tests/**/*.{ts,js}",
    "shared/**/src/**/*.test.{ts,js}",
    "shared/**/src/**/tests/**/*.{ts,js}",
    "templates/**/src/**/tests/**/*.{ts,js}",
    "tests/**/*.{ts,js}",
    "!**/*integration*.*",
    "!**/*e2e*.*",
    "!**/integration/**",
    "!**/e2e/**",
    "!**/system/**",
  ],
  timeout: "30s",
  failFast: false,
  concurrency: 0,
  nodeArguments: ["--import", "tsx", "--enable-source-maps"],
};
