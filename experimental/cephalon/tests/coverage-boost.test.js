import test from "ava";

import { getCurrentDateTime } from "../dist/get-current-date-time.js";
import { randomInt, choice, generatePromptChoice, generateSpecialQuery } from "../dist/util.js";

test("getCurrentDateTime returns formatted date string", (t) => {
  const result = getCurrentDateTime();
  t.is(typeof result, "string");
  t.true(result.length > 0);

  // Should match format: YYYY/MM/DD @ H:M:S (single digit hours, minutes, seconds allowed)
  const formatRegex = /^\d{4}\/\d{1,2}\/\d{1,2} @ \d{1,2}:\d{1,2}:\d{1,2}$/;
  t.regex(result, formatRegex);
});

test("getCurrentDateTime handles different times consistently", (t) => {
  const result1 = getCurrentDateTime();
  const result2 = getCurrentDateTime();

  t.is(typeof result1, "string");
  t.is(typeof result2, "string");
  t.true(result1.length > 0);
  t.true(result2.length > 0);
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
  const latestUserMessage = {
    text: "Hello there",
    timestamp: new Date(),
    metadata: { role: "user" }
  };
  const promptChoice = "What would you like to say?";

  const result = generateSpecialQuery(latestUserMessage, promptChoice);

  t.is(typeof result, "string");
  t.true(result.includes(latestUserMessage.text));
  t.true(result.includes(promptChoice));
});

test("randomInt handles edge cases", (t) => {
  // Test with max = 1
  const result1 = randomInt(1);
  t.true(result1 >= 0);
  t.true(result1 < 1);

  // Test with larger max
  const result2 = randomInt(100);
  t.true(result2 >= 0);
  t.true(result2 < 100);
});

test("choice handles single element array", (t) => {
  const array = ["single"];
  const result = choice(array);

  t.is(result, "single");
});