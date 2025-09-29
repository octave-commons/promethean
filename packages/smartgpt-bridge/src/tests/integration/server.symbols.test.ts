import path from "node:path";
import { fileURLToPath } from "node:url";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../tests/fixtures",
);

type TestResponse<TBody> = Readonly<{ status: number; body: TBody }>;

type TestRequest = {
  query(params?: Readonly<Record<string, unknown>>): TestRequest;
  send(
    body:
      | Readonly<Record<string, unknown>>
      | ReadonlyArray<unknown>
      | string
      | number
      | boolean
      | null,
  ): TestRequest;
  set(key: string, value: string): TestRequest;
  expect<TBody>(code: number): Promise<TestResponse<TBody>>;
};

type TestClient = {
  get(path: string): TestRequest;
  post(path: string): TestRequest;
  put(path: string): TestRequest;
};

type SymbolsIndexResponse = {
  ok: boolean;
  indexed: number;
  info: number;
};

type SymbolsFindResult = Readonly<{
  path: string;
  name: string;
  kind: string;
  startLine: number;
  endLine: number;
}>;

type SymbolsFindResponse = {
  ok: boolean;
  results: readonly SymbolsFindResult[];
};

const INDEX_SYMBOLS_PAYLOAD = {
  paths: ["**/*.ts"],
} as const satisfies Readonly<Record<string, unknown>>;

const FIND_SYMBOLS_PAYLOAD = {
  query: "User",
  kind: "class",
} as const satisfies Readonly<Record<string, unknown>>;

test.serial("POST /v0/symbols/index then /v0/symbols/find", async (t) => {
  t.timeout(20_000);
  await withServer(ROOT, async (client: Readonly<TestClient>) => {
    const idx = await client
      .post("/v0/symbols/index")
      .send(INDEX_SYMBOLS_PAYLOAD)
      .expect<SymbolsIndexResponse>(200);
    t.true(idx.body.ok);
    const res = await client
      .post("/v0/symbols/find")
      .send(FIND_SYMBOLS_PAYLOAD)
      .expect<SymbolsFindResponse>(200);
    t.true(res.body.ok);
    const hasUserSymbol = res.body.results.some(
      ({ name, path }: Readonly<Pick<SymbolsFindResult, "name" | "path">>) =>
        name === "User" && path.endsWith("multiSymbols.ts"),
    );
    t.true(hasUserSymbol);
  });
});
