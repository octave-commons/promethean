export class LocalPool {
  async run(modOrName: string, input: any) {
    // Synchronous fallback: dynamic import & call handle()
    const m = await import(/* @vite-ignore */ modOrName).catch(() => ({
      default: (x: any) => x,
    }));
    const fn = (m.handle ?? m.default) as any;
    return fn ? fn(input) : input;
  }
  async close() {}
}
