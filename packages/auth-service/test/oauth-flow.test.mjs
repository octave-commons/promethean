import { test } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import { buildServer } from "../dist/index.js";

function pkcePair() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

test("authorization code flow issues and refreshes tokens", async (t) => {
  const app = await buildServer();
  const { verifier, challenge } = pkcePair();
  const authorize = await app.inject({
    method: "GET",
    url:
      "/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https://example.com/cb&state=xyz&scope=read&code_challenge=" +
      challenge +
      "&code_challenge_method=S256&login_hint=user1",
  });
  assert.equal(authorize.statusCode, 302);
  const loc = authorize.headers.location;
  assert.ok(loc);
  const url = new URL(loc);
  assert.equal(url.searchParams.get("state"), "xyz");
  const code = url.searchParams.get("code");
  assert.ok(code);

  const tokenRes = await app.inject({
    method: "POST",
    url: "/oauth/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    payload: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://example.com/cb",
      client_id: "test-client",
      code_verifier: verifier,
    }).toString(),
  });
  assert.equal(tokenRes.statusCode, 200);
  const body = tokenRes.json();
  assert.ok(body.access_token);
  assert.ok(body.refresh_token);

  const refreshRes = await app.inject({
    method: "POST",
    url: "/oauth/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    payload: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: body.refresh_token,
      client_id: "test-client",
    }).toString(),
  });
  assert.equal(refreshRes.statusCode, 200);
});
