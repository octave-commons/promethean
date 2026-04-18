import assert from "node:assert/strict";
import test from "node:test";

import {
  inferSelfHostDashboardTargetId,
  loadHostDashboardTargetsFromEnv,
  parseCaddyRoutes,
  resolveHostDashboardTargetToken,
} from "../lib/host-dashboard.js";

test("parseCaddyRoutes extracts hosts, path matchers, and upstreams", () => {
  const routes = parseCaddyRoutes(`
ussy.promethean.rest {
  @api path /v1* /api* /auth* /health
  reverse_proxy @api host.docker.internal:8789
  reverse_proxy host.docker.internal:5174
}

battlebussy.ussy.promethean.rest {
  @backend path /api* /ws*
  reverse_proxy @backend battlebussy-backend:8080
  reverse_proxy battlebussy-site:3000
}
`);

  assert.equal(routes.length, 4);
  const battlebussyApi = routes.find((route) => route.host === "battlebussy.ussy.promethean.rest" && route.matcher === "@backend");
  assert.deepEqual(battlebussyApi, {
    host: "battlebussy.ussy.promethean.rest",
    matcher: "@backend",
    matchPaths: ["/api*", "/ws*"],
    upstreams: ["battlebussy-backend:8080"],
  });

  const ussyWeb = routes.find((route) => route.host === "ussy.promethean.rest" && route.upstreams.includes("host.docker.internal:5174"));
  assert.deepEqual(ussyWeb, {
    host: "ussy.promethean.rest",
    matcher: undefined,
    matchPaths: [],
    upstreams: ["host.docker.internal:5174"],
  });
});

test("parseCaddyRoutes ignores block-form reverse_proxy directives", () => {
  const routes = parseCaddyRoutes(`
ussy.promethean.rest {
  @api path /api*
  reverse_proxy @api {
    to host.docker.internal:8789
  }
}
`);

  assert.deepEqual(routes, []);
});

test("loadHostDashboardTargetsFromEnv falls back to default ussy targets", () => {
  const targets = loadHostDashboardTargetsFromEnv({});

  assert.equal(targets.length, 2);
  assert.equal(targets[0]?.id, "ussy");
  assert.equal(targets[1]?.id, "ussy3");
  assert.equal(targets[0]?.authTokenEnv, "HOST_DASHBOARD_USSY_TOKEN");
  assert.equal(targets[1]?.authTokenEnv, "HOST_DASHBOARD_USSY3_TOKEN");
});

test("loadHostDashboardTargetsFromEnv accepts configured JSON targets", () => {
  const targets = loadHostDashboardTargetsFromEnv({
    HOST_DASHBOARD_TARGETS_JSON: JSON.stringify([
      { id: "prod", label: "Prod", baseUrl: "https://ussy.promethean.rest", authTokenEnv: "HOST_TOKEN_PROD" },
      { id: "stage", label: "Stage", baseUrl: "https://ussy3.promethean.rest", notes: "staging" },
    ]),
  });

  assert.deepEqual(targets, [
    { id: "prod", label: "Prod", baseUrl: "https://ussy.promethean.rest", publicHost: undefined, authToken: undefined, authTokenEnv: "HOST_TOKEN_PROD", notes: undefined },
    { id: "stage", label: "Stage", baseUrl: "https://ussy3.promethean.rest", publicHost: undefined, authToken: undefined, authTokenEnv: undefined, notes: "staging" },
  ]);
});

test("resolveHostDashboardTargetToken prefers target env token and does not fall back to proxy token", () => {
  const token = resolveHostDashboardTargetToken(
    { id: "stage", label: "Stage", authTokenEnv: "HOST_TOKEN_STAGE" },
    { HOST_TOKEN_STAGE: "stage-secret", PROXY_AUTH_TOKEN: "proxy-secret" },
  );
  assert.equal(token, "stage-secret");

  const fallback = resolveHostDashboardTargetToken(
    { id: "stage", label: "Stage" },
    { PROXY_AUTH_TOKEN: "proxy-secret" },
  );
  assert.equal(fallback, undefined);
});

test("resolveHostDashboardTargetToken prioritizes inline authToken over env values", () => {
  const token = resolveHostDashboardTargetToken(
    { id: "stage", label: "Stage", authToken: "inline-secret", authTokenEnv: "HOST_TOKEN_STAGE" },
    { HOST_TOKEN_STAGE: "env-secret", PROXY_AUTH_TOKEN: "proxy-secret" },
  );

  assert.equal(token, "inline-secret");
});

test("inferSelfHostDashboardTargetId matches request host to configured target", () => {
  const targetId = inferSelfHostDashboardTargetId({
    targets: [
      { id: "ussy", label: "Prod", baseUrl: "https://ussy.promethean.rest" },
      { id: "ussy3", label: "Stage", baseUrl: "https://ussy3.promethean.rest" },
    ],
    requestBaseUrl: "https://ussy3.promethean.rest",
  });

  assert.equal(targetId, "ussy3");
});

test("inferSelfHostDashboardTargetId returns undefined when no target matches", () => {
  const targetId = inferSelfHostDashboardTargetId({
    targets: [{ id: "ussy", label: "Prod", baseUrl: "https://ussy.promethean.rest" }],
    requestBaseUrl: "https://unknown.promethean.rest",
  });

  assert.equal(targetId, undefined);
});
