// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { convert } from "../converter.js";

const sample = Buffer.from("sample");

test("convert ogg stream to wav stream", (t) => {
  const result = convert(sample);
  t.true(result.equals(sample));
});
