export default {
  files: ["src/tests/**/*.test.ts"],
  extensions: ["ts"],
  timeout: "30s",
  nodeArguments: ["--loader=ts-node/esm", "--enable-source-maps"],
};
