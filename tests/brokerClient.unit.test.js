import test from "ava";

import { sleep } from "@promethean/utils";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

test("memory broker: publish delivers to subscribers and unsubscribe stops it", async (t) => {
  const url = "memory://unit-bc";
  const sub = new BrokerClient({ url });
  const pub = new BrokerClient({ url });
  await Promise.all([sub.connect(), pub.connect()]);

  const seen = [];
  sub.subscribe("foo", (evt) => seen.push(evt.payload));

  pub.publish("foo", { a: 1 });
  pub.publish("foo", { a: 2 });
  await sleep(10);
  t.deepEqual(seen, [{ a: 1 }, { a: 2 }]);

  sub.unsubscribe("foo");
  pub.publish("foo", { a: 3 });
  await sleep(10);
  t.deepEqual(seen, [{ a: 1 }, { a: 2 }]);

  sub.disconnect();
  pub.disconnect();
});
