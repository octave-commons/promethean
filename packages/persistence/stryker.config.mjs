// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    _comment:
        "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
    packageManager: 'pnpm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'tap',
    testRunner_comment:
        'Take a look at https://stryker-mutator.io/docs/stryker-js/tap-runner for information about the tap plugin.',
    coverageAnalysis: 'perTest',
    buildCommand: 'pnpm build',
    plugins: ['@stryker-mutator/tap-runner'],
};
export default config;
