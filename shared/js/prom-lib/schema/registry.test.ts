import { SchemaRegistry } from "./registry";
import { z } from "zod";

test("registry enforces versioning and compatibility", () => {
  const reg = new SchemaRegistry();
  reg.register({
    topic: "t",
    version: 1,
    compat: "backward",
    schema: z.object({ a: z.string() }),
  });
  expect(() => reg.validate("t", { a: "x" }, 1)).not.toThrow();
  expect(() => reg.validate("t", { a: 1 }, 1)).toThrow();

  reg.register({
    topic: "t",
    version: 2,
    compat: "backward",
    schema: z.object({ a: z.string(), b: z.number().optional() }),
  });
});
