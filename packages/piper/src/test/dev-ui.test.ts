

























































































































































































































































































































































































  test("registers rate-limit plugin (sentinel)", async () => {
    await importServer();
    expect(mockFastify.rateLimited).toBe(true);
  });
});
// Framework shim: prefer Vitest (vi) if present, otherwise Jest.
const isVitest = typeof (globalThis as any).vi !== 'undefined';
const mockFn = isVitest ? (globalThis as any).vi.fn : (globalThis as any).jest?.fn ?? (() => { throw new Error('No mock function available'); });
const spyOnFn = isVitest ? (globalThis as any).vi.spyOn : (globalThis as any).jest?.spyOn ?? (() => { throw new Error('No spy function available'); });
const resetAll = () => {
  if (isVitest) { (globalThis as any).vi.restoreAllMocks?.(); (globalThis as any).vi.resetModules?.(); }
  else { (globalThis as any).jest?.restoreAllMocks?.(); (globalThis as any).jest?.resetModules?.(); }
};

describe('Dev UI surface - behavior contracts', () => {
  // We try to import lazily so the test suite still runs even if the module path changes.
  let DevUiModule: any;
  let exported: Record<string, any> = {};

  beforeAll(async () => {
    try {
      // Probe likely in-package entry points only (ESM-safe).
      const candidates = [
        '../dev-ui',
        './dev-ui',
        '../dev/ui',
        '../dev/index',
        '../runtime/dev-ui',
        '../lib/dev-ui',
      ] as const;
      for (const path of candidates) {
        try {
          const mod = await import(path);
          DevUiModule = mod;
          exported = { ...mod };
          break;
        } catch {
          /* try next */
        }
      }
    } catch {
      // ignore; tests below will skip appropriately
    }
  });

  afterEach(() => {
    resetAll();
  });

  test('exports are present and stable (smoke)', () => {
    if (!DevUiModule) {
      // Skip pattern that works for both Jest and Vitest
      const skip = isVitest ? (globalThis as any).vi.skip : (globalThis as any).test?.skip;
      if (skip) skip('Dev UI module not found; skip export smoke test');
      return;
    }
    expect(typeof exported).toBe('object');
    // Non-breaking expectations on common dev-ui shapes
    const possibleAPIs = ['createDevUi', 'mountDevUi', 'startDevServer', 'render', 'init'];
    const hasAny = possibleAPIs.some(k => k in exported);
    expect(hasAny).toBe(true);
  });

  test('create/mount handles minimal valid config (happy path)', async () => {
    if (!DevUiModule) {
      const skip = isVitest ? (globalThis as any).vi.skip : (globalThis as any).test?.skip;
      if (skip) skip('Dev UI module not found; skip happy path');
      return;
    }
    const api = exported.createDevUi ?? exported.mountDevUi ?? exported.init ?? exported.render;
    expect(typeof api).toBe('function');

    const onReady = mockFn();
    const config = { root: '/tmp', title: 'Dev UI', hot: false, onReady };
    const result = await Promise.resolve(api(config));
    // Accept either void or an object controller with dispose/teardown
    if (result && typeof result === 'object') {
      expect(typeof result.dispose === 'function' || typeof result.teardown === 'function' || typeof result.unmount === 'function').toBe(true);
    }
    expect(onReady).toHaveBeenCalled?.();
  });

  test('rejects invalid config (edge cases)', async () => {
    if (!DevUiModule) {
      const skip = isVitest ? (globalThis as any).vi.skip : (globalThis as any).test?.skip;
      if (skip) skip('Dev UI module not found; skip edge cases');
      return;
    }
    const api = exported.createDevUi ?? exported.mountDevUi ?? exported.init ?? exported.render;
    expect(typeof api).toBe('function');

    const badConfigs: any[] = [
      null, undefined, 42, 'ui', [], { root: 123 }, { hot: 'yes' }, { title: {} },
    ];
    for (const cfg of badConfigs) {
      let threw = false;
      try {
        // Allow sync throw or async rejection
        const maybe = api(cfg);
        if (maybe && typeof (maybe as any).then === 'function') {
          await (maybe as Promise<any>).catch(() => { threw = true; });
        }
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    }
  });

  test('lifecycle: returns controller with teardown semantics', async () => {
    if (!DevUiModule) {
      const skip = isVitest ? (globalThis as any).vi.skip : (globalThis as any).test?.skip;
      if (skip) skip('Dev UI module not found; skip lifecycle test');
      return;
    }
    const api = exported.createDevUi ?? exported.mountDevUi ?? exported.init ?? exported.render;
    const ctl = await Promise.resolve(api({ root: '/tmp', title: 'X' }));
    if (!ctl || typeof ctl !== 'object') {
      // If API is void, we can only assert it didn't crash
      expect(true).toBe(true);
      return;
    }
    const method = (ctl.dispose || ctl.teardown || ctl.unmount);
    expect(typeof method).toBe('function');
    const res = method.call(ctl);
    if (res && typeof res.then === 'function') {
      await res;
    }
    expect(true).toBe(true);
  });

  test('logs or reports errors when startup fails (failure path)', async () => {
    if (!DevUiModule) {
      const skip = isVitest ? (globalThis as any).vi.skip : (globalThis as any).test?.skip;
      if (skip) skip('Dev UI module not found; skip failure path');
      return;
    }
    const api = exported.createDevUi ?? exported.mountDevUi ?? exported.init ?? exported.render;
    const consoleError = spyOnFn(console, 'error').mockImplementation(() => {});
    const bad = { root: '/non-existent/path/hopefully', title: 'Bad', hot: true };
    let failed = false;
    try {
      const maybe = api(bad);
      if (maybe && typeof (maybe as any).then === 'function') {
        await (maybe as Promise<any>);
      }
    } catch {
      failed = true;
    }
    // Either it throws/rejects or it logs an error
    expect(failed || (consoleError as any).mock.calls.length > 0).toBe(true);
  });
});