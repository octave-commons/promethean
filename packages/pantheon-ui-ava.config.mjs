import { defaultConfig } from '../../config/ava.config.mjs'

export default {
  ...defaultConfig,
  files: ['src/**/*.test.{ts,tsx}'],
  require: ['@testing-library/react/dont-cleanup-after-each'],
}