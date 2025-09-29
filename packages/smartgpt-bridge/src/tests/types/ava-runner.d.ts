declare module "ava/lib/runner.js" {
  export type RunnerPrototype = {
    runTest: (...args: any[]) => Promise<unknown>;
    [key: symbol]: boolean | undefined;
  };

  const Runner: { prototype: RunnerPrototype };
  export default Runner;
}
