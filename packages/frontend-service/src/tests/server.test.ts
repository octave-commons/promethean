import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import avaTest, { type TestFn } from "ava";

import { createServer } from "../index.js";

const test = avaTest as unknown as TestFn<unknown>;

type PackageFixture = Readonly<{
  dir: string;
  name: string;
  distFiles?: Readonly<Record<string, string>>;
  staticFiles?: Readonly<Record<string, string>>;
}>;

type WriteFileInput = Readonly<{ filePath: string; contents: string }>;

const writeFile = ({ filePath, contents }: WriteFileInput): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
};

const createPackageFixture = (root: string, pkg: PackageFixture): void => {
  const pkgDir = path.join(root, pkg.dir);
  fs.mkdirSync(pkgDir, { recursive: true });
  writeFile({
    filePath: path.join(pkgDir, "package.json"),
    contents: JSON.stringify({ name: pkg.name }, null, 2),
  });

  (
    Object.entries(pkg.distFiles ?? {}) as ReadonlyArray<
      readonly [string, string]
    >
  ).forEach(([rel, contents]) => {
    writeFile({
      filePath: path.join(pkgDir, "dist", rel),
      contents,
    });
  });

  (
    Object.entries(pkg.staticFiles ?? {}) as ReadonlyArray<
      readonly [string, string]
    >
  ).forEach(([rel, contents]) => {
    writeFile({
      filePath: path.join(pkgDir, "static", rel),
      contents,
    });
  });
};

const setupPackagesFixture = (): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "frontend-service-test-"));

  const fixtures: ReadonlyArray<PackageFixture> = [
    {
      dir: "piper",
      name: "@promethean/piper",
      distFiles: { "frontend/main.js": "export default 'ok';" },
    },
    {
      dir: "llm-chat-frontend",
      name: "@promethean/llm-chat-frontend",
      staticFiles: { "index.html": "<html></html>" },
    },
    {
      dir: "smart-chat-frontend",
      name: "@promethean/smart-chat-frontend",
      staticFiles: { "index.html": "<html></html>" },
    },
  ];

  fixtures.forEach((pkg) => createPackageFixture(root, pkg));

  return root;
};

const startApp = async () => {
  const packagesDir = setupPackagesFixture();
  const app = await createServer({ packagesDir });
  return { packagesDir, app };
};

test("health route responds", async (t) => {
  const { packagesDir, app } = await startApp();
  t.teardown(() => fs.rmSync(packagesDir, { recursive: true, force: true }));
  t.teardown(() => app.close());
  const res = await app.inject("/health");
  t.is(res.statusCode, 200);
});

test("diagnostics route responds", async (t) => {
  const { packagesDir, app } = await startApp();
  t.teardown(() => fs.rmSync(packagesDir, { recursive: true, force: true }));
  t.teardown(() => app.close());
  const res = await app.inject("/diagnostics");
  t.is(res.statusCode, 200);
});

test("serves piper frontend asset", async (t) => {
  const { packagesDir, app } = await startApp();
  t.teardown(() => fs.rmSync(packagesDir, { recursive: true, force: true }));
  t.teardown(() => app.close());
  const res = await app.inject("/piper/main.js");
  t.is(res.statusCode, 200);
});

["llm-chat-frontend", "smart-chat-frontend"].forEach((pkg) => {
  test(`serves static asset for ${pkg}`, async (t) => {
    const { packagesDir, app } = await startApp();
    t.teardown(() => fs.rmSync(packagesDir, { recursive: true, force: true }));
    t.teardown(() => app.close());
    const res = await app.inject(`/${pkg}/static/index.html`);
    t.is(res.statusCode, 200);
  });
});
