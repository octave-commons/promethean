import { config } from "../../config/ava.config.mjs";

export default config({
  files: ["src/**/*.test.ts"],
  typescript: {
    rewritePaths: {
      "src/": "dist/"
    }
  }
});
