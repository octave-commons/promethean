import tsParser from "@typescript-eslint/parser";
export default [
  {
    files: ["**/*.{ts,js}"],
    languageOptions: { parser: tsParser },
    rules: {},
  },
];
