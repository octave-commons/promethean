import test from "ava";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EventName, EVENT_TO_PROTOCOL } from "../../bridge/events/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const events = JSON.parse(
  readFileSync(path.join(__dirname, "../../bridge/events/events.json"), "utf8"),
);

test("EventName maps identifiers to names", (t) => {
  for (const [key, value] of Object.entries(events)) {
    t.is(EventName[key], value.name);
  }
});

test("EVENT_TO_PROTOCOL maps identifiers to protocols", (t) => {
  for (const [key, value] of Object.entries(events)) {
    t.is(EVENT_TO_PROTOCOL[key], value.protocol || null);
  }
});
