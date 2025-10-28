import config from "../../config/eslint.config.base";

export default [
  ...config,
  {
    rules: {
      ...config[0].rules,
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];