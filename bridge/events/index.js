import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const events = JSON.parse(
  readFileSync(path.join(__dirname, "events.json"), "utf8"),
);

export const EventName = {
  STT_INPUT: events.STT_INPUT.name,
  STT_OUTPUT: events.STT_OUTPUT.name,
  CEPHALON_ROUTE: events.CEPHALON_ROUTE.name,
  TTS_OUTPUT: events.TTS_OUTPUT.name,
};

export const EVENT_TO_PROTOCOL = Object.fromEntries(
  Object.entries(events).map(([key, value]) => [key, value.protocol || null]),
);

export default EventName;
