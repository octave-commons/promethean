#!/usr/bin/env node

/**
 * Standardized Agent Launcher
 *
 * Usage:
 *   node scripts/launch-agents.mjs cephalon              # Launch single agent
 *   node scripts/launch-agents.mjs --all                 # Launch all agents
 *   node scripts/launch-agents.mjs --dev                 # Development mode
 *   node scripts/launch-agents.mjs --production          # Production mode
 *   node scripts/launch-agents.mjs --list                # List available agents
 */

import { execSync } from 'child_process';

const AGENTS = {
  cephalon: {
    package: '@promethean/cephalon',
    description: 'Discord voice agent',
    devScript: 'start:dev',
    startScript: 'start',
    healthEndpoint: '/health',
  },
  'duck-web': {
    package: '@promethean/duck-web',
    description: 'Web interface for Duck agent',
    devScript: 'dev',
    startScript: 'preview',
    healthEndpoint: '/',
  },
  'enso-browser-gateway': {
    package: '@promethean/enso-browser-gateway',
    description: 'ENSO browser WebSocket gateway',
    devScript: 'dev',
    startScript: 'dev',
    healthEndpoint: null, // WebSocket service
  },
  'smartgpt-bridge': {
    package: '@promethean/smartgpt-bridge',
    description: 'SmartGPT bridge service',
    devScript: 'dev',
    startScript: 'start',
    healthEndpoint: '/health',
  },
  broker: {
    package: '@promethean/broker',
    description: 'Message broker service',
    devScript: 'dev',
    startScript: 'start',
    healthEndpoint: '/health',
  },
  'llm-service': {
    package: '@promethean/llm',
    description: 'LLM service',
    devScript: 'dev',
    startScript: 'start',
    healthEndpoint: '/health',
  },
  'voice-service': {
    package: '@promethean/voice',
    description: 'Voice processing service',
    devScript: 'dev',
    startScript: 'start',
    healthEndpoint: '/health',
  },
};

function printUsage() {
  console.log(`
🚀 Promethean Agent Launcher

Usage: node scripts/launch-agents.mjs [options] [agent-name]

Options:
  --all              Launch all agents
  --dev              Development mode (default)
  --production       Production mode
  --list             List available agents
  --health           Check health of running agents
  --stop [agent]     Stop agent(s)
  --restart [agent]  Restart agent(s)
  --status           Show status of all agents

Examples:
  node scripts/launch-agents.mjs cephalon
  node scripts/launch-agents.mjs --all --dev
  node scripts/launch-agents.mjs --production --all
  node scripts/launch-agents.mjs --list
  node scripts/launch-agents.mjs --health
  node scripts/launch-agents.mjs --stop cephalon
  node scripts/launch-agents.mjs --status

Available agents:
${Object.entries(AGENTS)
  .map(([key, info]) => `  ${key.padEnd(20)} ${info.description}`)
  .join('\n')}
`);
}

function listAgents() {
  console.log('\n📋 Available Agents:\n');
  Object.entries(AGENTS).forEach(([key, info]) => {
    console.log(`  ${key.padEnd(20)} ${info.description}`);
    console.log(`    Package: ${info.package}`);
    console.log(`    Dev: pnpm ${info.devScript}`);
    console.log(`    Start: pnpm ${info.startScript}`);
    if (info.healthEndpoint) {
      console.log(`    Health: ${info.healthEndpoint}`);
    }
    console.log('');
  });
}

function launchAgent(agentName, mode = 'dev') {
  const agent = AGENTS[agentName];
  if (!agent) {
    console.error(`❌ Unknown agent: ${agentName}`);
    console.log('Use --list to see available agents');
    process.exit(1);
  }

  const script = mode === 'production' ? agent.startScript : agent.devScript;
  const command = `pnpm --filter ${agent.package} ${script}`;

  console.log(`🚀 Launching ${agentName} in ${mode} mode...`);
  console.log(`📦 Package: ${agent.package}`);
  console.log(`🔧 Script: ${script}`);
  console.log(`⚡ Command: ${command}`);
  console.log('');

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error(`❌ Failed to launch ${agentName}:`, error.message);
    process.exit(1);
  }
}

function launchAllAgents(mode = 'dev') {
  console.log(`🚀 Launching all agents in ${mode} mode...\n`);

  Object.keys(AGENTS).forEach((agentName, index) => {
    setTimeout(() => {
      console.log(`\n--- Launching ${agentName} (${index + 1}/${Object.keys(AGENTS).length}) ---`);
      launchAgent(agentName, mode);
    }, index * 2000); // Stagger launches by 2 seconds
  });
}

function checkHealth() {
  console.log('🏥 Checking agent health...\n');

  Object.entries(AGENTS).forEach(([agentName, agent]) => {
    if (!agent.healthEndpoint) {
      console.log(`⚪ ${agentName}: No health endpoint configured`);
      return;
    }

    try {
      // Try to determine port from package.json or use default
      const port = getAgentPort(agentName);
      const url = `http://localhost:${port}${agent.healthEndpoint}`;

      execSync(`curl -f -s ${url} > /dev/null`, { stdio: 'ignore' });
      console.log(`✅ ${agentName}: Healthy (${url})`);
    } catch (error) {
      console.log(`❌ ${agentName}: Unreachable`);
    }
  });
}

function getAgentPort(agentName) {
  // Default port mappings - could be made configurable
  const portMap = {
    cephalon: 8081,
    'duck-web': 3000,
    'enso-browser-gateway': 8082,
    'smartgpt-bridge': 3210,
    broker: 7000,
    'llm-service': 8888,
    'voice-service': 8083,
  };

  return portMap[agentName] || 3000;
}

function stopAgents(agentName = null) {
  if (agentName) {
    console.log(`🛑 Stopping ${agentName}...`);
    try {
      execSync(`pm2 stop ${agentName}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(`⚠️  ${agentName} may not be running in PM2`);
    }
  } else {
    console.log('🛑 Stopping all agents...');
    try {
      execSync('pm2 stop all', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  No PM2 processes running');
    }
  }
}

function restartAgents(agentName = null) {
  if (agentName) {
    console.log(`🔄 Restarting ${agentName}...`);
    try {
      execSync(`pm2 restart ${agentName}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(`⚠️  ${agentName} may not be running in PM2, attempting to start...`);
      launchAgent(agentName);
    }
  } else {
    console.log('🔄 Restarting all agents...');
    try {
      execSync('pm2 restart all', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  No PM2 processes running, launching all agents...');
      launchAllAgents();
    }
  }
}

function showStatus() {
  console.log('📊 Agent Status:\n');

  try {
    const pm2List = execSync('pm2 jlist', { encoding: 'utf8' });
    const processes = JSON.parse(pm2List);

    Object.entries(AGENTS).forEach(([agentName]) => {
      const process = processes.find((p) => p.name === agentName);

      if (process) {
        const status = process.pm2_env.status === 'online' ? '✅ Online' : '❌ Offline';
        const memory = process.monit
          ? `${Math.round(process.monit.memory / 1024 / 1024)}MB`
          : 'N/A';
        const uptime = process.pm2_env.pm_uptime
          ? `${Math.round(process.pm2_env.pm_uptime / 1000)}s`
          : 'N/A';

        console.log(
          `${agentName.padEnd(20)} ${status.padEnd(10)} Memory: ${memory.padEnd(8)} Uptime: ${uptime}`,
        );
      } else {
        console.log(`${agentName.padEnd(20)} ⚪ Not running`);
      }
    });
  } catch (error) {
    console.log('⚠️  Could not get PM2 status');
    console.log('Try: pm2 list');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const mode = args.includes('--production') ? 'production' : 'dev';
  const isAll = args.includes('--all');
  const isList = args.includes('--list');
  const isHealth = args.includes('--health');
  const isStop = args.includes('--stop');
  const isRestart = args.includes('--restart');
  const isStatus = args.includes('--status');

  if (isList) {
    listAgents();
    return;
  }

  if (isHealth) {
    checkHealth();
    return;
  }

  if (isStatus) {
    showStatus();
    return;
  }

  if (isStop) {
    const agentName = args.find((arg) => !arg.startsWith('--'));
    stopAgents(agentName);
    return;
  }

  if (isRestart) {
    const agentName = args.find((arg) => !arg.startsWith('--'));
    restartAgents(agentName);
    return;
  }

  if (isAll) {
    launchAllAgents(mode);
    return;
  }

  // Launch specific agent
  const agentName = args.find((arg) => !arg.startsWith('--'));
  if (agentName) {
    launchAgent(agentName, mode);
  } else {
    console.error('❌ Please specify an agent name or use --all');
    printUsage();
    process.exit(1);
  }
}

main();
