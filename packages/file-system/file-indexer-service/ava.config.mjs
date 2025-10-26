export {
    files: ['src/**/*.test.ts', 'dist/**/*.test.js'],
    concurrency: 5,
    verbose: true,
    timeout: '30s',
    nodeArguments: ['--experimental-vm-modules'],
};