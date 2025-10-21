import baseConfig from '../../config/ava.config.mjs';

// Override files pattern to exclude Playwright tests
const kanbanConfig = {
  ...baseConfig,
  files: [...baseConfig.files.filter((pattern) => !pattern.includes('dark-mode-ui'))],
};

export default kanbanConfig;
