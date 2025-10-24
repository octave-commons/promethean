import test from "ava";
import { convert } from "@promethean-os/discord";

const sample = Buffer.from("sample");

test("convert ogg stream to wav stream", (t) => {
  const result = convert(sample);
  t.true(result.equals(sample));
});
