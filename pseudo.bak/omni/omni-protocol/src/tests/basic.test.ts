/**
 * @fileoverview Basic tests for Omni protocol
 */

import test from "ava";
import {
  createOmniRequest,
  createOmniResponse,
  createOmniEvent,
  validateOmniMessage,
  isOmniMessage,
} from "../index.js";

test("createOmniRequest creates a valid request", (t) => {
  const request = createOmniRequest("test-service", "test-action", {
    param1: "value1",
  });

  t.is(request.type, "request");
  t.is(request.source, "test-service");
  t.is(request.payload.action, "test-action");
  t.deepEqual(request.payload.params, { param1: "value1" });
});

test("createOmniResponse creates a valid response", (t) => {
  const response = createOmniResponse("test-service", "correlation-123", true, {
    result: "success",
  });

  t.is(response.type, "response");
  t.is(response.source, "test-service");
  t.is(response.correlationId, "correlation-123");
  t.true(response.payload.success);
  t.deepEqual(response.payload.data, { result: "success" });
});

test("createOmniEvent creates a valid event", (t) => {
  const event = createOmniEvent("test-service", "test-event", {
    eventData: "test",
  });

  t.is(event.type, "event");
  t.is(event.source, "test-service");
  t.is(event.payload.event, "test-event");
  t.deepEqual(event.payload.data, { eventData: "test" });
});

test("validateOmniMessage validates correct messages", (t) => {
  const request = createOmniRequest("test-service", "test-action");
  const result = validateOmniMessage(request);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.type, "request");
  }
});

test("validateOmniMessage rejects invalid messages", (t) => {
  const invalidMessage = { invalid: "message" };
  const result = validateOmniMessage(invalidMessage);

  t.false(result.success);
  if (!result.success) {
    t.true(result.error.issues.length > 0);
  }
});

test("isOmniMessage type guard works correctly", (t) => {
  const validMessage = createOmniRequest("test-service", "test-action");
  const invalidMessage = { invalid: "message" };

  t.true(isOmniMessage(validMessage));
  t.false(isOmniMessage(invalidMessage));
});
