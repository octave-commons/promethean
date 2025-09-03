// SPDX-License-Identifier: GPL-3.0-only
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const events = JSON.parse(
  readFileSync(path.join(__dirname, "events.json"), "utf8"),
);

export const EventName = Object.fromEntries(
  Object.entries(events).map(([key, value]) => [key, value.name]),
);

export const EVENT_TO_PROTOCOL = Object.fromEntries(
  Object.entries(events).map(([key, value]) => [key, value.protocol || null]),
);

export default EventName;
