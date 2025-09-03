// SPDX-License-Identifier: GPL-3.0-only
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,ts,mjs}"],
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {},
    // Biome handles formatting; Prettier config removed
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
    ],
  },
];
