import test from "ava";
import { cachePolicy, retention } from "../policy.js";

const DAY = 24 * 3600;

test("retention policy aligns with privacy profiles", (t) => {
  t.deepEqual(retention.messages, { defaultTTL: 7 * DAY, maxTTL: 90 * DAY });
  t.deepEqual(retention.assets, {
    defaultTTL: 30 * DAY,
    maxTTL: 180 * DAY,
    allowDerivations: true,
  });
  t.deepEqual(retention.logs, { keepProtocolLogs: true, logTTL: 7 * DAY });
  t.deepEqual(retention.roster, { keepPresenceHistory: false });
  t.deepEqual(retention.index, { allowSearch: true, indexTTL: 30 * DAY });
});

test("cache policy matches broadcast limits", (t) => {
  t.is(cachePolicy.maxBytesPerRoom, 5 * 1024 ** 3);
  t.is(cachePolicy.maxBytesPerEntry, 256 * 1024 ** 2);
  t.is(cachePolicy.defaultTTLSeconds, 30 * DAY);
  t.deepEqual(cachePolicy.pinTags, ["index:*"]);
  t.deepEqual(cachePolicy.privateTags, ["session:*"]);
});
