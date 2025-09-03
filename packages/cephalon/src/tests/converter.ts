// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { PassThrough } from "stream";
import { convert } from "../converter.js";

test("convert ogg stream to wav stream returns a stream", (t) => {
  const input = new PassThrough();
  const output = convert(input);
  t.truthy(output.readable);
});
