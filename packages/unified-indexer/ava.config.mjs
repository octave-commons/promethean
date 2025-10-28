import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default {
    files: [
        'dist/tests/**/*.test.js',
    ],
    workerThreads: false,
    concurrency: 1,
    timeout: '30s',
    environmentVariables: {
        NODE_ENV: 'test',
    },
    require: [
        // Add any test setup files here
    ],
    nodeArguments: [
        '--experimental-import-meta-resolve',
        '--no-warnings',
    ],
};