const { createFederationBridgeAgent } = require('/app/dist/lib/federation/bridge-agent.js');

const fetch = global.fetch;

(async () => {
  const agent = createFederationBridgeAgent({
    relayUrl: 'wss://staging.proxx.ussy.promethean.rest/api/ui/federation/bridge/ws',
    authorization: 'Bearer dBSsWff0xTMoxlgMWpX2lUI0hOT3f9N1I6Bv5Y8CVmk',
    ownerSubject: 'did:web:staging.proxx.ussy.promethean.rest',
    peerDid: 'did:web:proxx.promethean.rest:err-local',
    clusterId: 'promethean-brethren',
    agentId: 'err-local-proxx-staging',
    environment: 'local',
    bridgeAgentVersion: '0.1.0',
    authMode: 'admin_key',
    getCapabilities: async () => [{
      providerId: 'openai',
      modelPrefixes: ['gpt-'],
      models: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano'],
      paths: ['/v1/models', '/v1/chat/completions', '/v1/responses', '/api/bridge/credentials/providers', '/api/bridge/credentials/accounts', '/api/bridge/credentials/export'],
      routes: ['/v1/models', '/v1/chat/completions', '/v1/responses', '/api/bridge/credentials/providers', '/api/bridge/credentials/accounts', '/api/bridge/credentials/export'],
      authType: 'oauth_bearer',
      accountCount: 1,
      availableAccountCount: 1,
      supportsModelsList: true,
      supportsChatCompletions: true,
      supportsResponses: true,
      supportsStreaming: true,
      supportsWarmImport: false,
      credentialMobility: 'access_token_only',
      credentialOrigin: 'localhost_oauth',
      lastHealthyAt: new Date().toISOString(),
      topologyTargets: [{ groupId: 'err-workstation', nodeId: 'err-local-proxx' }],
    }],
    getHealth: async () => ({
      processHealthy: true,
      upstreamHealthy: true,
      availableAccountCount: 1,
      localOauthBootstrapReady: true,
      queuedRequests: 0,
      nodes: [{ groupId: 'err-workstation', nodeId: 'err-local-proxx', reachable: true, lastHealthyAt: new Date().toISOString() }],
    }),
    handleRequest: async ({ request, bodyText }) => {
      const response = await fetch('http://127.0.0.1:8789' + request.path, {
        method: request.method,
        headers: {
          ...request.headers,
          authorization: 'Bearer e6UuPuoU7mLqakSE-9CYuHFazwDwT-iQqPlwMLGw1TE44bO3QuhSAVqpHgAJ8iPA',
          'x-open-hax-bridge-auth': 'internal',
        },
        body: bodyText && bodyText.length > 0 ? bodyText : undefined,
      });
      const text = await response.text();
      return { status: response.status, headers: Object.fromEntries(response.headers.entries()), body: text, encoding: 'utf8' };
    },
  });

  await agent.start();
  console.log('staging bridge agent started', JSON.stringify(agent.snapshot()));
  setInterval(() => {}, 1 << 30);
})().catch((error) => {
  console.error('staging bridge agent failed', error && error.stack ? error.stack : error);
  process.exit(1);
});
