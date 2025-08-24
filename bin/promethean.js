#!/usr/bin/env node

// Promethean CLI Entrypoint
// Replaces legacy kit-shell/npm scripts with a unified command interface.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Map CLI commands to dev/*.sibilant scripts
const commands = {
    compile: 'compile.sibilant',
    bundle: 'bundle.sibilant',
    watch: 'watch.sibilant',
    server: 'server.sibilant',
    build: 'build.sibilant',
    index: 'index.sibilant',
};

function runSibilant(script, args = []) {
    const devPath = path.resolve(__dirname, '../dev', script);
    if (!fs.existsSync(devPath)) {
        console.error(`Error: script ${script} not found in dev/`);
        process.exit(1);
    }

    const child = spawn('kit-shell', ['<', devPath, ...args], {
        stdio: 'inherit',
        shell: true,
    });

    child.on('exit', (code) => process.exit(code));
}

function main() {
    const [, , cmd, ...args] = process.argv;

    if (!cmd || !(cmd in commands)) {
        console.log(`Promethean CLI\n`);
        console.log(`Usage: prom <command> [args...]\n`);
        console.log(`Available commands:`);
        Object.keys(commands).forEach((c) => console.log(`  ${c}`));
        process.exit(1);
    }

    runSibilant(commands[cmd], args);
}

main();
