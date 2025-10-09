import test from "ava";

import { getCurrentDateTime } from "../get-current-date-time.js";
import { randomInt, choice, generatePromptChoice, generateSpecialQuery } from "../util.js";

test("getCurrentDateTime returns formatted date string", (t) => {
  const result = getCurrentDateTime();
  t.is(typeof result, "string");
  t.true(result.length > 0);

  // Should match format: YYYY/MM/DD @ HH:MM:SS
  const formatRegex = /^\d{4}\/\d{1,2}\/\d{1,2} @ \d{1,2}:\d{2}:\d{2}$/;
  t.regex(result, formatRegex);
});

test("randomInt returns number within range", (t) => {
  const max = 10;
  const result = randomInt(max);

  t.is(typeof result, "number");
  t.true(result >= 0);
  t.true(result < max);
});

test("choice returns element from array", (t) => {
  const array = ["option1", "option2", "option3"];
  const result = choice(array);

  t.is(typeof result, "string");
  if (result) {
    t.true(array.includes(result));
  }
});

test("generatePromptChoice returns valid prompt", (t) => {
  const result = generatePromptChoice();

  t.is(typeof result, "string");
  t.true(result.length > 0);
});

test("generateSpecialQuery returns formatted query", (t) => {
  const latestUserMessage = { content: "Hello there" };
  const promptChoice = "What would you like to say?";

  const result = generateSpecialQuery(latestUserMessage, promptChoice);

  t.is(typeof result, "string");
  t.true(result.includes(latestUserMessage.content));
  t.true(result.includes(promptChoice));
});

test("getCurrentDateTime handles different times consistently", (t) => {
  const result1 = getCurrentDateTime();
  const result2 = getCurrentDateTime();

  t.is(typeof result1, "string");
  t.is(typeof result2, "string");
  t.true(result1.length > 0);
  t.true(result2.length > 0);
});