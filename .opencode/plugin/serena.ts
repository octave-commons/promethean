import { type Plugin } from '@opencode-ai/plugin';

// Comprehensive .env file patterns
const ENV_PATTERNS = [
  /\.env(\.[a-zA-Z0-9_-]+)?$/,  // .env, .env.local, .env.production, etc.
  /^\.env$/i,                   // Case-insensitive .env
  /\/\.env(\.[a-zA-Z0-9_-]+)?$/,  // Path ending with .env variants
];

// Tools that can access files and need protection
const FILE_ACCESS_TOOLS = [
  'read', 'write', 'edit', 'glob', 'grep', 'list', 'bash', 
  'serena_read_file', 'serena_create_text_file', 'serena_list_dir',
  'serena_find_file', 'serena_search_for_pattern', 'serena_execute_shell_command'
];

export const EnvProtection: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      const { tool } = input;
      const { args } = output;

      // Check if this tool can access files
      if (!FILE_ACCESS_TOOLS.includes(tool)) {
        return;
      }

      // Extract file paths from different argument structures
      const filePaths = extractFilePaths(tool, args);
      
      // Check each file path against .env patterns
      for (const filePath of filePaths) {
        if (isEnvFile(filePath)) {
          const error = new Error(`Access to .env file denied: ${filePath}`);
          error.name = 'EnvProtectionError';
          throw error;
        }
      }
    },
  };
};

/**
 * Extract file paths from tool arguments
 */
function extractFilePaths(tool: string, args: any): string[] {
  const paths: string[] = [];
  
  switch (tool) {
    case 'read':
    case 'write':
    case 'edit':
    case 'serena_read_file':
    case 'serena_create_text_file':
      if (args.filePath || args.path) {
        paths.push(args.filePath || args.path);
      }
      break;
      
    case 'glob':
    case 'grep':
    case 'serena_find_file':
    case 'serena_search_for_pattern':
      if (args.pattern || args.substring_pattern) {
        // Check if pattern could match .env files
        const pattern = args.pattern || args.substring_pattern;
        if (pattern && typeof pattern === 'string') {
          if (ENV_PATTERNS.some(regex => regex.test(pattern))) {
            paths.push(pattern);
          }
        }
      }
      if (args.path || args.relative_path) {
        paths.push(args.path || args.relative_path);
      }
      break;
      
    case 'list':
    case 'serena_list_dir':
      if (args.path || args.relative_path) {
        paths.push(args.path || args.relative_path);
      }
      break;
      
    case 'bash':
    case 'serena_execute_shell_command':
      if (args.command) {
        // Check command for .env references
        const command = args.command;
        if (typeof command === 'string') {
          const envMatches = command.match(/\.env(\.[a-zA-Z0-9_-]+)?/gi);
          if (envMatches) {
            paths.push(...envMatches);
          }
        }
      }
      break;
  }
  
  return paths;
}

/**
 * Check if a file path matches .env patterns
 */
function isEnvFile(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  
  // Normalize path for consistent matching
  const normalizedPath = filePath.trim();
  
  // Check against all .env patterns
  return ENV_PATTERNS.some(pattern => pattern.test(normalizedPath));
}
