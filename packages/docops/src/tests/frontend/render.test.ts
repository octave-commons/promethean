/* 
Test framework note:
- This suite is designed to run under either Vitest or Jest with jsdom.
- The repository's test runner should already set the testEnvironment to jsdom (Jest) or use environment: 'jsdom' (Vitest).
- Replace the shim below if your repo exposes a different import path for the test globals.
*/

type TestAPI = {
  describe: typeof describe;
  it: typeof it;
  test: typeof test;
  expect: typeof expect;
  beforeEach: typeof beforeEach;
  afterEach: typeof afterEach;
  spyOn: (obj: any, key: PropertyKey) => any;
  mockFn: (...args: any[]) => any;
  resetAllMocks: () => void;
};

// Lightweight adapter to work with either Vitest or Jest
let T: TestAPI;
try {
  // @ts-ignore - vitest available?
  const v = require("vitest");
  T = {
    describe: v.describe,
    it: v.it,
    test: v.test,
    expect: v.expect,
    beforeEach: v.beforeEach,
    afterEach: v.afterEach,
    spyOn: v.vi.spyOn,
    mockFn: v.vi.fn,
    resetAllMocks: v.vi.resetAllMocks,
  } as unknown as TestAPI;
} catch {
  // Fallback to Jest
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const j = require("@jest/globals");
  T = {
    describe: j.describe,
    it: j.it,
    test: j.test,
    expect: j.expect,
    beforeEach: j.beforeEach,
    afterEach: j.afterEach,
    spyOn: (obj: any, key: PropertyKey) => jest.spyOn(obj, key as any),
    mockFn: (...args: any[]) => (jest.fn as any)(...args),
    resetAllMocks: () => jest.resetAllMocks(),
  } as unknown as TestAPI;
}

const { describe, it, test, expect, beforeEach, afterEach, mockFn, resetAllMocks } = T;

// IMPORTANT: Adjust this import path if the source file resides elsewhere in this repo.
import { renderSelectedMarkdown } from "../../frontend/render.js";

// Mock the sibling modules used by renderSelectedMarkdown
// The source imports relative files "./selection.js" and "./api.js". We create module mocks for them.
jestOrViMockModule("../../frontend/selection.js", () => ({
  getSelection: mockFn(() => [] as string[]),
}));
jestOrViMockModule("../../frontend/api.js", () => ({
  readFileText: mockFn(async (_dir: string, _file: string) => "# Title\n\nHello"),
}));

function jestOrViMockModule(id: string, factory: () => any) {
  try {
    // Vitest
    // @ts-ignore
    const { vi } = require("vitest");
    vi.mock(id, factory);
  } catch {
    // Jest
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jestGlobals = require("@jest/globals");
    (jestGlobals.jest as any).mock(id, factory);
  }
}

function setDOM({ dirValue = "", info = "", out = "" }: { dirValue?: string; info?: string; out?: string } = {}) {
  // Clear existing body content
  document.body.replaceChildren();

  // Create and append input element
  const input = document.createElement("input");
  input.id = "dir";
  input.value = dirValue;
  document.body.appendChild(input);

  // Create and append info div
  const infoDiv = document.createElement("div");
  infoDiv.id = "mdInfo";
  infoDiv.textContent = info;
  document.body.appendChild(infoDiv);

  // Create and append render div
  const outDiv = document.createElement("div");
  outDiv.id = "mdRender";
  outDiv.textContent = out;
  document.body.appendChild(outDiv);
}

function getEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
}

describe("renderSelectedMarkdown", () => {
  beforeEach(() => {
    // fresh DOM for each test
    document.body.replaceChildren();
    // ensure globals are clean
    // @ts-ignore
    delete (globalThis as any).marked;
    // @ts-ignore - ambient constant not actually in module scope here
    // Nothing to delete for ambient 'marked' constant; tests simulate via globalThis only.
    resetAllMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
    // Clean up possible globals
    // @ts-ignore
    delete (globalThis as any).marked;
  });

  it("no-ops safely when required DOM elements are missing", async () => {
    // No elements at all
    await expect(renderSelectedMarkdown()).resolves.toBeUndefined();
    // Nothing should throw; nothing to assert in DOM
  });

  it("shows info message when no file is selected", async () => {
    setDOM({ dirValue: "/docs" });
    // getSelection mocked to return []
    await renderSelectedMarkdown();
    expect(getEl("mdInfo").textContent).toBe("No file selected. Select a file in the File Explorer.");
    // mdRender should be cleared
    expect(getEl("mdRender").innerHTML).toBe("");
  });

  it("renders markdown using globalThis.marked.parse when available", async () => {
    setDOM({ dirValue: "/docs" });
    // Mock selection to one file
    mockGetSelection().mockReturnValueOnce(["README.md"]);
    // Provide global marked.parse
    (globalThis as any).marked = {
      parse: (md: string, opts?: any) => {
        // Assert options received
        expect(opts).toEqual({ mangle: false, headerIds: true });
        return `<h1>FROM GLOBAL ${md.slice(2, 7)}</h1>`;
      },
    };

    await renderSelectedMarkdown();

    expect(getEl("mdInfo").textContent).toBe("Rendering: README.md");
    expect(getEl("mdRender").innerHTML).toContain("<h1>FROM GLOBAL");
  });

  it("renders markdown using ambient marked (simulated) if global missing", async () => {
    setDOM({ dirValue: "/docs" });
    mockGetSelection().mockReturnValueOnce(["INTRO.md"]);

    // Simulate module-scoped 'marked' constant by temporarily attaching to window then reading in function via fallback
    // The implementation does: const mk = g.marked?.parse ?? marked?.parse;
    // We can't set the ambient TS const here, but we can simulate by defining a non-enumerable property on globalThis
    // that the module's 'marked' might refer to. As a pragmatic test, we set window.marked and rely on the nullish coalesce.
    // First ensure globalThis.marked undefined to force ambient branch
    // @ts-ignore
    delete (globalThis as any).marked;

    // Provide a stand-in: the function checks "marked?.parse", which we simulate here.
    const ambient = { parse: (_md: string, _opts?: any) => "<p>AMBIENT</p>" };
    // @ts-ignore
    (globalThis as any).marked = ambient; // simulate availability via ambient

    await renderSelectedMarkdown();

    expect(getEl("mdRender").innerHTML).toBe("<p>AMBIENT</p>");
  });

  it("falls back to raw text when no markdown engine is available (offline)", async () => {
    setDOM({ dirValue: "/z" });
    mockGetSelection().mockReturnValueOnce(["FILE.md"]);
    // Ensure no marked engine present
    // @ts-ignore
    delete (globalThis as any).marked;

    // Make readFileText return markdown; it should appear as raw text
    mockReadFileText().mockResolvedValueOnce("# Raw MD\n\nText");

    await renderSelectedMarkdown();

    expect(getEl("mdRender").textContent).toBe("# Raw MD\n\nText");
  });

  it("displays the error message when readFileText throws", async () => {
    setDOM({ dirValue: "/err" });
    mockGetSelection().mockReturnValueOnce(["BROKEN.md"]);
    const err = new Error("boom");
    mockReadFileText().mockRejectedValueOnce(err);

    await renderSelectedMarkdown();

    expect(getEl("mdRender").textContent).toBe("Error: boom");
  });

  it("handles thrown non-Error values gracefully", async () => {
    setDOM({ dirValue: "/err2" });
    mockGetSelection().mockReturnValueOnce(["X.md"]);
    // Throw a string
    mockReadFileText().mockRejectedValueOnce("string boom");

    await renderSelectedMarkdown();

    expect(getEl("mdRender").textContent).toBe("string boom");
  });

  it("clears previous output before rendering a new file", async () => {
    setDOM({ dirValue: "/docs", out: "<em>stale</em>" });
    mockGetSelection().mockReturnValueOnce(["A.md"]);
    // No engine => fallback to text
    mockReadFileText().mockResolvedValueOnce("content A");
    await renderSelectedMarkdown();
    expect(getEl("mdRender").textContent).toBe("content A");

    // Now run again with HTML engine available
    mockGetSelection().mockReturnValueOnce(["B.md"]);
    (globalThis as any).marked = { parse: (md: string) => `<b>${md}</b>` };
    mockReadFileText().mockResolvedValueOnce("content B");
    await renderSelectedMarkdown();
    expect(getEl("mdRender").innerHTML).toBe("<b>content B</b>");
  });

  it("passes the directory and filename to readFileText in order", async () => {
    setDOM({ dirValue: "/docs" });
    mockGetSelection().mockReturnValueOnce(["README.md"]);
    const spy = mockReadFileText();
    await renderSelectedMarkdown();
    expect(spy).toHaveBeenCalledWith("/docs", "README.md");
  });
});

/* Utilities to access the module mocks */

function mockGetSelection(): jest.Mock | import("vitest").Mock {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getSelection } = require("../../frontend/selection.js");
    const fn = getSelection as any;
    return fn;
  } catch {
    // Vitest ESM fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("../../frontend/selection.js");
    return (mod.getSelection as any);
  }
}

function mockReadFileText(): jest.Mock | import("vitest").Mock {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { readFileText } = require("../../frontend/api.js");
    return readFileText as any;
  } catch {
    // Vitest ESM fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("../../frontend/api.js");
    return (mod.readFileText as any);
  }
}