export default {
  files: ["src/tests/**/*.test.ts"],
  extensions: {
    ts: "module",
  },
  nodeArguments: ["--loader=ts-node/esm"],
  environmentVariables: {
    TS_NODE_PROJECT: "./tsconfig.json",
  },
};
