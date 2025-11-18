import test from "ava";
import {
  ACT_INTENT_DESCRIPTORS,
  ALL_ACT_INTENT_DESCRIPTORS,
  intentDescriptor,
  isActIntentDescriptor,
} from "../types/intents.js";

test("intent helpers expose canonical descriptors", (t) => {
  t.is(
    intentDescriptor("reduceSelfScope"),
    ACT_INTENT_DESCRIPTORS.reduceSelfScope,
  );
  for (const value of ALL_ACT_INTENT_DESCRIPTORS) {
    t.true(isActIntentDescriptor(value));
  }
  t.false(isActIntentDescriptor("unknown-intent"));
});
