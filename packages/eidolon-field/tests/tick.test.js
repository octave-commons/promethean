import test from "ava";
import { VectorN, FieldNode, VectorFieldService } from "../index.js";
import { installInMemoryPersistence } from "@promethean/test-utils/persistence.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("service ticks on interval and persists field (unit, no network)", async (t) => {
  const pers = installInMemoryPersistence();
  const svc = new VectorFieldService(8, 10);
  svc.addNode(new FieldNode(VectorN.zero(8), 1.0, 1));
  await svc.start();
  await sleep(35);
  await svc.stop();
  const docs = await pers.mongo
    .db("eidolon_field")
    .collection("fields")
    .find()
    .toArray();
  t.true(docs.length >= 2);
  t.true(svc.tickCount >= 2);
  t.true(svc.field.grid.size > 0);
  pers.dispose();
});
