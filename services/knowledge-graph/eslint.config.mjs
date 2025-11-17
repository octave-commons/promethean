{
  "extends": ["../../../eslint.config.mjs"],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "max-lines": ["error", { "max": 800, "skipBlankLines": true, "skipComments": true }],
    "max-lines-per-function": ["error", { "max": 100, "skipBlankLines": true, "skipComments": true }]
  }
}