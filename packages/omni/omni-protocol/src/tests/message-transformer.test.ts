import test from "ava";
import {
  messageToJson,
  messageFromJson,
  cloneMessage,
  mergeHeaders,
  updateTimestamp,
  createResponseFromRequest,
  isRequest,
  isResponse,
  isEvent,
  getCorrelationInfo,
} from "../utils/message-transformer.js";
import type { OmniRequest, OmniResponse, OmniEvent } from "../types/index.js";

test("messageToJson converts message to JSON", (t) => {
  const message: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test", params: { id: "123" } },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
  };

  const json = messageToJson(message);
  const parsed = JSON.parse(json);

  t.is(parsed.id, "req-123");
  t.is(parsed.type, "request");
  t.deepEqual(parsed.payload, { action: "test", params: { id: "123" } });
});

test("messageFromJson parses JSON to message", (t) => {
  const json = JSON.stringify({
    id: "evt-456",
    type: "event",
    payload: { event: "user.created", data: { userId: "123" } },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "user-service",
  });

  const message = messageFromJson(json);

  t.is(message.id, "evt-456");
  t.is(message.type, "event");
  t.deepEqual(message.payload, {
    event: "user.created",
    data: { userId: "123" },
  });
});

test("cloneMessage creates deep copy", (t) => {
  const original: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test", params: { nested: { value: "original" } } },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
  };

  const cloned = cloneMessage(original);

  // Verify it's a different object
  t.not(cloned, original);

  // Verify deep copy by modifying nested property
  (cloned.payload as any).params.nested.value = "modified";
  t.is((original.payload as any).params.nested.value, "original");
});

test("mergeHeaders merges headers correctly", (t) => {
  const message: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
    headers: { priority: "normal", timeout: 5000 },
  };

  const additionalHeaders = {
    priority: "high" as const,
    authorization: "Bearer token123",
  };

  const merged = mergeHeaders(message, additionalHeaders);

  t.is(merged.headers?.priority, "high");
  t.is(merged.headers?.timeout, 5000); // preserved
  t.is(merged.headers?.authorization, "Bearer token123");
});

test("mergeHeaders creates headers if none exist", (t) => {
  const message: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
  };

  const headers = { priority: "high" as const, timeout: 10000 };

  const merged = mergeHeaders(message, headers);

  t.deepEqual(merged.headers, headers);
});

test("mergeHeaders creates headers if none exist - second test", (t) => {
  const message: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
  };

  const headers = { priority: "normal" as const, timeout: 5000 };

  const merged = mergeHeaders(message, headers);

  t.deepEqual(merged.headers, headers);
});

test("updateTimestamp updates message timestamp", (t) => {
  const message: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test-service",
  };

  const updated = updateTimestamp(message);

  t.not(updated.timestamp, message.timestamp);
  t.true(updated.timestamp > message.timestamp);
});

test("createResponseFromRequest creates successful response", (t) => {
  const request: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "getUser", params: { userId: "123" } },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "client",
    destination: "user-service",
    headers: { authorization: "Bearer token123", timeout: 5000 },
  };

  const responseData = { id: "123", name: "John Doe" };
  const response = createResponseFromRequest(request, true, responseData);

  t.is(response.type, "response");
  t.true(response.payload.success);
  t.deepEqual(response.payload.data, responseData);
  t.is(response.payload.error, undefined);
  t.is(response.correlationId, request.id);
  t.is(response.source, request.destination || "unknown");
  t.is(response.destination, request.source);
  t.deepEqual(response.headers, request.headers);
});

test("createResponseFromRequest creates error response", (t) => {
  const request: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "getUser" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "client",
  };

  const error = { code: "NOT_FOUND", message: "User not found" };
  const response = createResponseFromRequest(request, false, undefined, error);

  t.is(response.type, "response");
  t.false(response.payload.success);
  t.is(response.payload.data, undefined);
  t.deepEqual(response.payload.error, error);
  t.is(response.correlationId, request.id);
  t.is(response.source, "unknown"); // fallback when no destination
  t.is(response.destination, request.source);
});

test("isRequest identifies request messages", (t) => {
  const request: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test",
  };

  t.true(isRequest(request));
  t.false(isResponse(request));
  t.false(isEvent(request));
});

test("isResponse identifies response messages", (t) => {
  const response: OmniResponse = {
    id: "resp-123",
    type: "response",
    payload: { success: true },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test",
    correlationId: "req-123",
  };

  t.false(isRequest(response));
  t.true(isResponse(response));
  t.false(isEvent(response));
});

test("isEvent identifies event messages", (t) => {
  const event: OmniEvent = {
    id: "evt-123",
    type: "event",
    payload: { event: "user.created" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test",
  };

  t.false(isRequest(event));
  t.false(isResponse(event));
  t.true(isEvent(event));
});

test("getCorrelationInfo extracts correlation information", (t) => {
  const request: OmniRequest = {
    id: "req-123",
    type: "request",
    payload: { action: "test" },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test",
  };

  const info = getCorrelationInfo(request);

  t.is(info.id, "req-123");
  t.is(info.correlationId, undefined);
  t.true(info.isRequest);
  t.false(info.isResponse);
});

test("getCorrelationInfo for response with correlation", (t) => {
  const response: OmniResponse = {
    id: "resp-456",
    type: "response",
    payload: { success: true },
    timestamp: "2023-01-01T00:00:00.000Z",
    source: "test",
    correlationId: "req-123",
  };

  const info = getCorrelationInfo(response);

  t.is(info.id, "resp-456");
  t.is(info.correlationId, "req-123");
  t.false(info.isRequest);
  t.true(info.isResponse);
});
