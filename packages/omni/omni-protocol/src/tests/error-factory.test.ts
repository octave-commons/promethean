import test from "ava";
import {
  createOmniError,
  createValidationError,
  createTimeoutError,
  createAuthError,
  createRoutingError,
  errorFromJsError,
  isOmniProtocolError,
  extractErrorInfo,
} from "../utils/error-factory.js";

test("createOmniError creates basic error", (t) => {
  const error = createOmniError("TEST_ERROR", "Test message");

  t.is(error.code, "TEST_ERROR");
  t.is(error.message, "Test message");
  t.is(error.details, undefined);
});

test("createOmniError includes details", (t) => {
  const details = { userId: "123", action: "test" };
  const error = createOmniError("TEST_ERROR", "Test message", details);

  t.deepEqual(error.details, details);
});

test("createOmniError includes stack in development", (t) => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const error = createOmniError("TEST_ERROR", "Test message");
  t.truthy(error.stack);

  process.env.NODE_ENV = originalEnv;
});

test("createOmniError excludes stack in production", (t) => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const error = createOmniError("TEST_ERROR", "Test message");
  t.is(error.stack, undefined);

  process.env.NODE_ENV = originalEnv;
});

test("createValidationError creates validation error", (t) => {
  const error = createValidationError(
    "Invalid field",
    "user.name",
    "string",
    123,
  );

  t.is(error.code, "VALIDATION_ERROR");
  t.is(error.message, "Invalid field");
  t.is(error.path, "user.name");
  t.is(error.expected, "string");
  t.is(error.received, 123);
});

test("createValidationError with minimal args", (t) => {
  const error = createValidationError("Simple validation error");

  t.is(error.code, "VALIDATION_ERROR");
  t.is(error.message, "Simple validation error");
  t.is(error.path, undefined);
  t.is(error.expected, undefined);
  t.is(error.received, undefined);
});

test("createTimeoutError creates timeout error", (t) => {
  const error = createTimeoutError(5000, "getData");

  t.is(error.code, "TIMEOUT_ERROR");
  t.is(error.message, "Operation 'getData' timed out after 5000ms");
  t.is(error.timeout, 5000);
  t.is(error.operation, "getData");
});

test("createTimeoutError without operation", (t) => {
  const error = createTimeoutError(3000);

  t.is(error.code, "TIMEOUT_ERROR");
  t.is(error.message, "Operation timed out after 3000ms");
  t.is(error.timeout, 3000);
  t.is(error.operation, undefined);
});

test("createAuthError creates auth error", (t) => {
  const error = createAuthError("invalid", "Invalid token format");

  t.is(error.code, "AUTH_ERROR");
  t.is(error.message, "Invalid token format");
  t.is(error.authType, "invalid");
});

test("createAuthError with default message", (t) => {
  const error = createAuthError("missing");

  t.is(error.code, "AUTH_ERROR");
  t.is(error.message, "Authentication error: missing");
  t.is(error.authType, "missing");
});

test("createRoutingError creates routing error", (t) => {
  const error = createRoutingError("unknown_destination", "service-123");

  t.is(error.code, "ROUTING_ERROR");
  t.is(
    error.message,
    "Routing error: unknown_destination for destination 'service-123'",
  );
  t.is(error.destination, "service-123");
  t.is(error.reason, "unknown_destination");
});

test("createRoutingError without destination", (t) => {
  const error = createRoutingError("queue_full");

  t.is(error.code, "ROUTING_ERROR");
  t.is(error.message, "Routing error: queue_full");
  t.is(error.destination, undefined);
  t.is(error.reason, "queue_full");
});

test("errorFromJsError converts JavaScript Error", (t) => {
  const jsError = new Error("Something went wrong");
  const error = errorFromJsError(jsError, "CUSTOM_ERROR");

  t.is(error.code, "CUSTOM_ERROR");
  t.is(error.message, "Something went wrong");
});

test("errorFromJsError uses default code", (t) => {
  const jsError = new Error("Default error");
  const error = errorFromJsError(jsError);

  t.is(error.code, "UNKNOWN_ERROR");
  t.is(error.message, "Default error");
});

test("isOmniProtocolError identifies valid errors", (t) => {
  const validError = { code: "ERROR", message: "Error message" };
  t.true(isOmniProtocolError(validError));
});

test("isOmniProtocolError rejects invalid objects", (t) => {
  t.false(isOmniProtocolError(null));
  t.false(isOmniProtocolError(undefined));
  t.false(isOmniProtocolError("string"));
  t.false(isOmniProtocolError({ code: "ERROR" }));
  t.false(isOmniProtocolError({ message: "Error message" }));
  t.false(isOmniProtocolError({}));
});

test("extractErrorInfo extracts error information", (t) => {
  const error = {
    code: "TEST_ERROR",
    message: "Test message",
    details: { context: "test" },
    stack: "stack trace",
  };

  const info = extractErrorInfo(error);

  t.is(info.code, "TEST_ERROR");
  t.is(info.message, "Test message");
  t.deepEqual(info.details, { context: "test" });
  t.true(info.hasStack);
});

test("extractErrorInfo handles error without details or stack", (t) => {
  const error = {
    code: "SIMPLE_ERROR",
    message: "Simple message",
  };

  const info = extractErrorInfo(error);

  t.is(info.code, "SIMPLE_ERROR");
  t.is(info.message, "Simple message");
  t.is(info.details, undefined);
  t.false(info.hasStack);
});
