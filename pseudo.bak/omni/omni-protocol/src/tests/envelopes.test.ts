/**
 * @fileoverview Tests for envelope types and helpers
 */

import test from "ava";

import {
  createErrorEnvelope,
  createSuccessEnvelope,
  isSuccessEnvelope,
  isErrorEnvelope,
  FilesListDirectorySuccess,
  FilesViewFileSuccess,
  ErrorCode,
  RequestContext,
} from "../index.js";

import {
  ErrorEnvelopeSchema,
  FilesListDirectorySuccessSchema,
  FilesViewFileSuccessSchema,
  EnvelopeUnionSchema,
  RequestContextSchema,
} from "../validation/index.js";

test("createErrorEnvelope creates valid error envelope", (t) => {
  const envelope = createErrorEnvelope(
    "NOT_FOUND",
    "File not found",
    { path: "/missing.txt" },
    { retryable: false },
  );

  t.is(envelope.ok, false);
  t.is(envelope.error.code, "NOT_FOUND");
  t.is(envelope.error.message, "File not found");
  t.deepEqual(envelope.error.details, { path: "/missing.txt" });
  t.is(envelope.error.retryable, false);
});

test("createErrorEnvelope with minimal args", (t) => {
  const envelope = createErrorEnvelope("INTERNAL", "Server error");

  t.is(envelope.ok, false);
  t.is(envelope.error.code, "INTERNAL");
  t.is(envelope.error.message, "Server error");
  t.is(envelope.error.details, undefined);
  t.is(envelope.error.retryable, undefined);
});

test("createSuccessEnvelope creates valid success envelope", (t) => {
  const data = {
    base: "/test",
    entries: [
      { name: "test.txt", path: "/test/test.txt", type: "file" as const },
    ],
  };

  const envelope = createSuccessEnvelope<FilesListDirectorySuccess>(data);

  t.is(envelope.ok, true);
  t.is(envelope.base, "/test");
  t.is(envelope.entries.length, 1);
  t.is(envelope.entries[0]?.name, "test.txt");
});

test("isSuccessEnvelope correctly identifies success envelopes", (t) => {
  const successEnvelope = createSuccessEnvelope({ test: "data" });
  const errorEnvelope = createErrorEnvelope("INVALID_ARGUMENT", "Bad input");

  t.true(isSuccessEnvelope(successEnvelope));
  t.false(isSuccessEnvelope(errorEnvelope));
});

test("isErrorEnvelope correctly identifies error envelopes", (t) => {
  const successEnvelope = createSuccessEnvelope({ test: "data" });
  const errorEnvelope = createErrorEnvelope("INVALID_ARGUMENT", "Bad input");

  t.true(isErrorEnvelope(errorEnvelope));
  t.false(isErrorEnvelope(successEnvelope));
});

test("ErrorEnvelope validation", (t) => {
  const validEnvelope = createErrorEnvelope(
    "PERMISSION_DENIED",
    "Access denied",
  );
  const result = ErrorEnvelopeSchema.safeParse(validEnvelope);

  t.true(result.success);
  if (result.success) {
    t.is(result.data.ok, false);
    t.is(result.data.error?.code, "PERMISSION_DENIED");
  }
});

test("ErrorEnvelope validation rejects invalid data", (t) => {
  const invalidEnvelope = {
    ok: false,
    error: {
      // Missing required 'code' field
      message: "Error without code",
    },
  };

  const result = ErrorEnvelopeSchema.safeParse(invalidEnvelope);
  t.false(result.success);
});

test("FilesListDirectorySuccess validation", (t) => {
  const validEnvelope = createSuccessEnvelope<FilesListDirectorySuccess>({
    base: "/test",
    entries: [
      {
        name: "file.txt",
        path: "/test/file.txt",
        type: "file",
        size: 100,
        sha256: "abc123",
      },
    ],
  });

  const result = FilesListDirectorySuccessSchema.safeParse(validEnvelope);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.ok, true);
    t.is(result.data.base, "/test");
    t.is(result.data.entries.length, 1);
    t.is(result.data.entries[0]?.name, "file.txt");
  }
});

test("FilesViewFileSuccess validation", (t) => {
  const validEnvelope = createSuccessEnvelope<FilesViewFileSuccess>({
    path: "/test/file.txt",
    content: "Hello, world!",
    sha256: "def456",
  });

  const result = FilesViewFileSuccessSchema.safeParse(validEnvelope);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.ok, true);
    t.is(result.data.path, "/test/file.txt");
    t.is(result.data.content, "Hello, world!");
    t.is(result.data.sha256, "def456");
  }
});

test("EnvelopeUnion validation accepts both success and error", (t) => {
  const successEnvelope = createSuccessEnvelope<FilesListDirectorySuccess>({
    base: "/test",
    entries: [],
  });
  const errorEnvelope = createErrorEnvelope("INTERNAL", "Server error");

  const successResult = EnvelopeUnionSchema.safeParse(successEnvelope);
  const errorResult = EnvelopeUnionSchema.safeParse(errorEnvelope);

  t.true(successResult.success);
  t.true(errorResult.success);
});

test("Error codes are valid", (t) => {
  const validCodes: ErrorCode[] = [
    "PERMISSION_DENIED",
    "NOT_FOUND",
    "INVALID_ARGUMENT",
    "FAILED_PRECONDITION",
    "INTERNAL",
    "UNAVAILABLE",
    "DEADLINE_EXCEEDED",
    "ALREADY_EXISTS",
    "RESOURCE_EXHAUSTED",
    "UNAUTHENTICATED",
    "UNKNOWN",
  ];

  validCodes.forEach((code) => {
    const envelope = createErrorEnvelope(code, "Test error");
    t.is(envelope.error.code, code);
  });
});

test("Error envelope with all optional fields", (t) => {
  const envelope = createErrorEnvelope(
    "UNAVAILABLE",
    "Service temporarily unavailable",
    { retryAfter: 30 },
    { retryable: true, docUrl: "https://docs.example.com/errors" },
  );

  t.is(envelope.ok, false);
  t.is(envelope.error.code, "UNAVAILABLE");
  t.is(envelope.error.message, "Service temporarily unavailable");
  t.deepEqual(envelope.error.details, { retryAfter: 30 });
  t.is(envelope.error.retryable, true);
  t.is(envelope.error.docUrl, "https://docs.example.com/errors");
});

// ============================================================================
// RequestContext Tests
// ============================================================================

test("RequestContext validation", (t) => {
  const context: RequestContext = {
    requestId: "req-456",
    subject: {
      id: "user-123",
      displayName: "Test User",
      rbacRoles: ["user"],
    },
    rootPath: "/home/user",
    headers: { "content-type": "application/json" },
    capabilities: {
      execEnabled: true,
      githubEnabled: false,
      sinksEnabled: true,
    },
    audit: {
      source: "rest",
      userAgent: "test-client/1.0",
      ip: "127.0.0.1",
    },
  };

  const result = RequestContextSchema.safeParse(context);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.requestId, "req-456");
    t.is(result.data.subject?.id, "user-123");
    t.is(result.data.subject?.displayName, "Test User");
    t.deepEqual(result.data.subject?.rbacRoles, ["user"]);
    t.is(result.data.capabilities.execEnabled, true);
    t.is(result.data.audit.source, "rest");
  }
});

test("RequestContext with minimal fields", (t) => {
  const context: RequestContext = {
    requestId: "req-789",
    subject: null,
    rootPath: "/tmp",
    headers: {},
    capabilities: {
      execEnabled: false,
      githubEnabled: false,
      sinksEnabled: false,
    },
    audit: {
      source: "websocket",
    },
  };

  const result = RequestContextSchema.safeParse(context);
  t.true(result.success);
  if (result.success) {
    t.is(result.data.requestId, "req-789");
    t.is(result.data.subject, null);
    t.is(result.data.capabilities.execEnabled, false);
    t.is(result.data.audit.source, "websocket");
  }
});
