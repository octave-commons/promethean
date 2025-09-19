import test from "ava";
import pTimeout from "p-timeout";

test("tool timeout surfaces error", async (t) => {
  await t.throwsAsync(pTimeout(new Promise(() => {}), { milliseconds: 1000 }));
});

test("deterministic derivation cid", (t) => {
  // same (source, tool, version, params) → same CID
  t.is(
    deriveCid(A, "pdf.extract_text", "1.3.2", { ocr: false }),
    deriveCid(A, "pdf.extract_text", "1.3.2", { ocr: false }),
  );
});
