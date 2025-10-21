export {
    files: ['dist/**/*.test.js'],
    concurrency: 5,
    verbose: true,
    timeout: '30s',
    nodeArguments: ['--experimental-vm-modules'],
};