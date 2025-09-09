/**
 * Framework note:
 * - This test suite is compatible with Vitest or Jest.
 * - It uses jsdom-style DOM; ensure the test environment is jsdom.
 * - If @testing-library/dom is in the project, these tests will import it; otherwise they fallback to native DOM queries.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const vi: any;
declare const jest: any;

const runner = (globalThis as any).vi ?? (globalThis as any).jest ?? {};
const isVitest = !!(globalThis as any).vi;
const isJest = !!(globalThis as any).jest;

// Minimal expect typings for TS; actual runner provides real 'expect'
declare const expect: any, describe: any, it: any, beforeEach: any, afterEach: any;

let testingLibraryDom: any = null;
try {
  // Prefer installed testing-library/dom if present
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  testingLibraryDom = require('@testing-library/dom');
} catch {}

const { getByRole, getAllByRole, queryByRole } = testingLibraryDom ?? {
  getByRole: (container: Element | Document, role: string, opts: any = {}) => {
    const name = opts?.name?.toLowerCase?.();
    const match = Array.from(
      (container as Document | Element).querySelectorAll<HTMLElement>('[role]')
    ).find((el) => el.getAttribute('role') === role && (!name || (el.getAttribute('aria-label') || el.textContent || '').toLowerCase().includes(name)));
    if (!match) throw new Error(`No element with role=${role} name=${opts?.name ?? ''}`);
    return match;
  },
  getAllByRole: (container: Element | Document, role: string) => {
    return Array.from(
      (container as Document | Element).querySelectorAll<HTMLElement>('[role="' + role + '"]')
    );
  },
  queryByRole: (container: Element | Document, role: string, opts: any = {}) => {
    try { return (testingLibraryDom ?? ({} as any)).getByRole?.(container, role, opts) } catch { return null }
  },
};

// Module path resolution from the test file location:
// file-tree implementation is expected at ../../frontend/file-tree.js relative to tests/frontend/*
// The implementation imports "../api.js", "../selection.js", "../render.js" from its directory.
const implModulePath = require.resolve ? '../../frontend/file-tree.js' : '../../frontend/file-tree.js';

// Provide module mocks that work in both Vitest and Jest
const doMock = (mod: string, factory: () => any) => {
  if (isVitest) {
    vi.mock(mod, factory as any);
  } else if (isJest) {
    jest.mock(mod, factory as any);
  } else {
    // Fallback no-op (runner will likely be one of the above)
  }
};

// Spy helper
const spyOn = (obj: any, key: string) => {
  if (isVitest) return vi.spyOn(obj, key as any);
  if (isJest) return jest.spyOn(obj, key as any);
  throw new Error('No supported spy API found');
};

// Reset mocks between tests
const resetAll = async () => {
  if (isVitest) {
    vi.resetModules?.();
    vi.clearAllMocks?.();
  } else if (isJest) {
    jest.resetModules?.();
    jest.clearAllMocks?.();
  }
};

describe('FileTree Web Component', () => {
  const mockGetFilesImpl = async (dir: string, opts: any) => {
    return {
      dir: dir || '/root',
      tree: [
        {
          type: 'dir', name: 'docs', children: [
            { type: 'file', name: 'a.md', size: 600 * 1024 },
            { type: 'file', name: 'b.mdx', size: 1.5 * 1024 * 1024 },
          ]
        },
        { type: 'file', name: 'readme.md', size: 256 * 1024 },
      ],
    };
  };

  let setSelectionCalls: string[][] = [];
  let renderCalls = 0;

  const installMocks = () => {
    setSelectionCalls = [];
    renderCalls = 0;

    doMock('../../frontend/api.js', () => ({
      getFiles: (dir: string, opts: any) => mockGetFilesImpl(dir, opts),
      __esModule: true,
    }));
    doMock('../../frontend/selection.js', () => ({
      setSelection: (sel: string[]) => { setSelectionCalls.push(sel.slice()); },
      __esModule: true,
    }));
    doMock('../../frontend/render.js', () => ({
      renderSelectedMarkdown: async () => { renderCalls++; },
      __esModule: true,
    }));
  };

  const bootstrap = async () => {
    // jsdom document body baseline
    // Clear existing body content safely
    document.body.textContent = '';
    const dirInput = document.createElement('input');
    dirInput.id = 'dir';
    dirInput.value = '/workspace';
    const mountDiv = document.createElement('div');
    mountDiv.id = 'mount';
    document.body.appendChild(dirInput);
    document.body.appendChild(mountDiv);

    await import(implModulePath); // registers <file-tree>
    const el = document.createElement('file-tree');
    document.getElementById('mount')!.appendChild(el);
    // Allow microtasks to flush
    await Promise.resolve();
    return el as HTMLElement;
  };

  beforeEach(async () => {
    await resetAll();
    installMocks();
  });

  afterEach(async () => {
    // Clear body content safely
    document.body.textContent = '';
    await resetAll();
  });

  it('calls getFiles with expected defaults and renders tree with a11y roles', async () => {
    const getFilesSpyModule = isVitest ? await import('../../frontend/api.js') : await import('../../frontend/api.js');
    const getFilesSpy = spyOn(getFilesSpyModule as any, 'getFiles');

    const host = await bootstrap();

    // Ensure tree is present
    const tree = getByRole(host.shadowRoot as any, 'tree');
    expect(tree).toBeTruthy();

    // Verify getFiles called with dir and options
    expect(getFilesSpy).toHaveBeenCalled();
    const args = getFilesSpy.mock?.calls?.[0] ?? getFilesSpy.mock.calls[0];
    expect(args[0]).toBe('/workspace');
    expect(args[1]).toMatchObject({
      maxDepth: 2,
      maxEntries: 500,
      exts: '.md,.mdx,.txt,.markdown',
      includeMeta: true,
    });

    // Directories and files expose treeitem roles
    const treeitems = getAllByRole(host.shadowRoot as any, 'treeitem');
    // Expect: docs dir + a.md + b.mdx + readme.md
    expect(treeitems.length).toBeGreaterThanOrEqual(4);
  });

  it('clicking a file checks only its checkbox, updates selection, and triggers render', async () => {
    const host = await bootstrap();

    // Find a.md file span by role/name
    const aNode = getByRole(host.shadowRoot as any, 'treeitem', { name: 'a.md' });
    // Before click, nothing selected
    expect(setSelectionCalls.at(-1) ?? []).toEqual(expect.arrayContaining([]));

    // Click it
    (aNode as HTMLElement).click();
    // Allow microtasks
    await Promise.resolve();

    // After click: only the corresponding checkbox is checked
    const checkboxes = host.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    const checked = Array.from(checkboxes).filter((c) => c.checked);
    expect(checked.length).toBe(1);

    // setSelection should have been called with the full path for a.md
    const lastSel = setSelectionCalls.at(-1) ?? [];
    expect(lastSel.length).toBe(1);
    expect(lastSel[0]).toMatch(/\/docs\/a\.md$/);

    // renderSelectedMarkdown called
    expect(renderCalls).toBeGreaterThanOrEqual(1);
  });

  it('Select All and Clear toolbar buttons update selection accordingly', async () => {
    const host = await bootstrap();
    const selAll = host.shadowRoot!.getElementById('selAll') as HTMLButtonElement;
    const selNone = host.shadowRoot!.getElementById('selNone') as HTMLButtonElement;

    selAll.click();
    await Promise.resolve();

    const cbs = host.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    expect(Array.from(cbs).every((cb) => cb.checked)).toBe(true);
    const lastAll = setSelectionCalls.at(-1) ?? [];
    expect(lastAll.length).toBe(cbs.length);

    selNone.click();
    await Promise.resolve();
    expect(Array.from(cbs).every((cb) => !cb.checked)).toBe(true);
    const lastNone = setSelectionCalls.at(-1) ?? ['__marker__'];
    expect(lastNone.length).toBe(0);
  });

  it('Select by Size respects minKB and selects only files >= threshold', async () => {
    const host = await bootstrap();
    const minKB = host.shadowRoot!.getElementById('minKB') as HTMLInputElement;
    const selBySize = host.shadowRoot!.getElementById('selBySize') as HTMLButtonElement;

    // Default value in component template is "1024" KB (1 MB)
    expect(minKB.value).toBe('1024');

    // Click "Select by Size" -> should select files >= 1 MB (b.mdx at 1.5 MB)
    selBySize.click();
    await Promise.resolve();

    const cbs = host.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    const checkedVals = Array.from(cbs).filter((c) => c.checked).map((c) => c.value);
    expect(checkedVals.some((v) => v.endsWith('/docs/b.mdx'))).toBe(true);
    expect(checkedVals.some((v) => v.endsWith('/docs/a.md'))).toBe(false);
    expect(checkedVals.some((v) => v.endsWith('/readme.md'))).toBe(false);

    // Lower threshold to 200 KB and select again -> should include readme.md and a.md as well
    minKB.value = '200';
    selBySize.click();
    await Promise.resolve();

    const checkedVals2 = Array.from(cbs).filter((c) => c.checked).map((c) => c.value);
    expect(checkedVals2.some((v) => v.endsWith('/docs/a.md'))).toBe(true);
    expect(checkedVals2.some((v) => v.endsWith('/readme.md'))).toBe(true);
  });

  it('displays human-readable sizes (KB vs MB) next to files', async () => {
    const host = await bootstrap();

    // Find the size spans
    const sizeEls = host.shadowRoot!.querySelectorAll<HTMLElement>('span.size');
    const texts = Array.from(sizeEls).map((el) => el.textContent?.trim() || '');
    // Expect at least one "KB" and one "MB"
    expect(texts.some((t) => /KB$/.test(t))).toBe(true);
    expect(texts.some((t) => /MB$/.test(t))).toBe(true);
  });

  it('handles empty tree gracefully (no errors, still sets up UI)', async () => {
    // Override mock to return empty tree
    const alt = async () => ({ dir: '/empty', tree: [] as any[] });
    const apiModPath = '../../frontend/api.js';
    if (isVitest) {
      vi.doMock(apiModPath, () => ({ getFiles: alt, __esModule: true }));
    } else if (isJest) {
      jest.doMock?.(apiModPath, () => ({ getFiles: alt, __esModule: true }));
      jest.resetModules();
    }
    const host = await bootstrap();
    const tree = getByRole(host.shadowRoot as any, 'tree');
    expect(tree).toBeTruthy();
    // No treeitems for files/dirs
    const items = host.shadowRoot!.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBe(0);
    // Toolbar still present
    expect(host.shadowRoot!.getElementById('selAll')).toBeTruthy();
  });
});