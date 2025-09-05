import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import functional from "eslint-plugin-functional";
import importPlugin from "eslint-plugin-import";
import promise from "eslint-plugin-promise";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/dist/**", "**/.cache/**", "./scripts/**", "./templates/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true, // uses your tsconfig.* automatically
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      functional,
      import: importPlugin,
      promise,
    },
    rules: {
      // TypeScript strictness (lint-side)
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": [
        "error",
        {
          // these avoid most transient-symbol pitfalls
          ignoreInferredTypes: true,
          checkParameterProperties: false,
          // optional: if DOM/3rd-party types cause noise, allow them:
          // allow: [{ from: "lib", name: ["HTMLElement", "Event"] }]
        },
      ],

      // FP: immutability & purity
      "functional/no-let": "error",
      "functional/no-try-statements": "off", // flip to "error" if you want
      "functional/prefer-immutable-types": [
        "error",
        {
          enforcement: "ReadonlyDeep",
          ignoreInferredTypes: true, // avoids noise on inferred literals
        },
      ],
      "functional/immutable-data": ["error", { ignoreClasses: "fieldsOnly" }],
      "functional/no-loop-statements": "error",
      "functional/no-method-signature": "off", // keep TS ergonomics
      "functional/prefer-tacit": "off", // readability first

      // Side-effect control
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",

      // Imports hygiene
      "import/first": "error",
      "import/no-default-export": "error",
      "import/no-cycle": ["error", { maxDepth: 1 }],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: [
      "**/*.test.{ts,tsx,js}",
      "**/*.spec.{ts,tsx,js}",
      "**/tests/**/*.{ts,tsx,js}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='setTimeout'][arguments.0.type='Identifier']",
          message:
            "Use sleep from @promethean/test-utils instead of setTimeout for sleeps in tests.",
        },
      ],
    },
  },
];
