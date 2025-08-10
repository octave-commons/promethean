import { defineApp } from "./dev/pm2Helpers.js";

/**
 * Convert a lightweight service declaration into a PM2 ecosystem.
 *
 * @param {Object} cfg - top level configuration
 * @param {Array} cfg.services - list of services to launch
 * @param {string} cfg.services[].name - process name
 * @param {string[]} cfg.services[].command - command and args
 * @param {string} [cfg.services[].cwd] - working directory
 * @param {Object} [cfg.services[].env] - environment variables
 * @returns {Object} PM2 ecosystem config
 */
export default function loadEcosystem({ services = [] }) {
  const apps = services.map(({ name, command, cwd, env = {} }) => {
    const [script, ...args] = command;
    return defineApp(name, script, args, { cwd, env });
  });
  return { apps };
}
