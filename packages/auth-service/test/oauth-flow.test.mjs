import test from "ava";
import crypto from "node:crypto";
import { buildServer } from "../src/index.js";

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
  t.teardown(async () => {
    if (typeof app.close === "function") {
      await app.close();
    }
  });

  const { verifier, challenge } = pkcePair();
  const authorize = await app.inject({
    method: "GET",
    url:
      "/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https://example.com/cb&state=xyz&scope=read&code_challenge=" +
      challenge +
      "&code_challenge_method=S256&login_hint=user1",
  });
  t.is(authorize.statusCode, 302);
  const loc = authorize.headers.location;
  t.truthy(loc);
  const url = new URL(loc);
  t.is(url.searchParams.get("state"), "xyz");
  const code = url.searchParams.get("code");
  t.truthy(code);

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
  t.is(tokenRes.statusCode, 200);
  const body = tokenRes.json();
  t.truthy(body.access_token);
  t.truthy(body.refresh_token);

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
  t.is(refreshRes.statusCode, 200);
});
