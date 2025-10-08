import test from "ava";

import {
  getCephalonMode,
  isClassicMode,
  isEcsMode,
} from "../mode.js";

test.beforeEach(() => {
  delete process.env.CEPHALON_MODE;
});

test.afterEach(() => {
  delete process.env.CEPHALON_MODE;
});

test.serial("defaults to ecs mode", (t) => {
  t.is(getCephalonMode(), "ecs");
  t.true(isEcsMode());
  t.false(isClassicMode());
});

test.serial("honors classic mode", (t) => {
  process.env.CEPHALON_MODE = "classic";
  t.is(getCephalonMode(), "classic");
  t.true(isClassicMode());
  t.false(isEcsMode());
});

test.serial("invalid values fall back to ecs", (t) => {
  process.env.CEPHALON_MODE = "bogus";
  t.is(getCephalonMode(), "ecs");
  t.true(isEcsMode());
  t.false(isClassicMode());
});
