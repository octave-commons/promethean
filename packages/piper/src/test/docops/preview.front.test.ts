import test from "ava";
import { computePreview } from "@promethean/docops/dist/preview-front.js";

test("computePreview exported", (t) => {
  t.is(typeof computePreview, "function");
});
