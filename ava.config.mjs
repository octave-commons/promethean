export default {
  files: ["**/*.{test,spec}.ts"],
  extensions: { ts: 'module' },
  nodeArguments: ["--loader=ts-node/esm"],
  timeout: '30s',
};
