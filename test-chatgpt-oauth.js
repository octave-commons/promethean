#!/usr/bin/env node

/**
 * Simple test to simulate ChatGPT MCP connector OAuth flow
 */

import http from 'http';

// Test OAuth discovery
function testDiscovery() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3210,
      path: '/.well-known/oauth-authorization-server/mcp',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test OAuth login without PKCE (like ChatGPT might do)
function testOAuthLogin() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: 'test',
      redirect_uri: 'http://localhost:3210/test',
      scope: 'user:email',
      state: 'test123',
      // Note: No code_challenge or code_challenge_method
    });

    const options = {
      hostname: 'localhost',
      port: 3210,
      path: `/auth/oauth/login?${params.toString()}`,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);

      if (res.statusCode === 302 && res.headers.location) {
        const location = new URL(res.headers.location);
        console.log(`Redirect to: ${location.origin}${location.pathname}`);
        console.log(`Params:`, Object.fromEntries(location.searchParams));

        // Check if PKCE parameters are present
        const hasCodeChallenge = location.searchParams.has('code_challenge');
        const hasCodeChallengeMethod = location.searchParams.has('code_challenge_method');

        console.log(`Has code_challenge: ${hasCodeChallenge}`);
        console.log(`Has code_challenge_method: ${hasCodeChallengeMethod}`);

        resolve({
          hasPKCE: hasCodeChallenge && hasCodeChallengeMethod,
          location: res.headers.location,
        });
      } else {
        resolve({
          hasPKCE: false,
          status: res.statusCode,
          headers: res.headers,
        });
      }
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('Testing OAuth discovery...');
    const discovery = await testDiscovery();
    console.log('Discovery response:', JSON.stringify(discovery, null, 2));

    console.log('\nTesting OAuth login without PKCE...');
    const loginResult = await testOAuthLogin();
    console.log('Login result:', JSON.stringify(loginResult, null, 2));

    if (loginResult.hasPKCE) {
      console.log('\n⚠️  PKCE parameters are present even when not requested');
      console.log('This might cause issues with ChatGPT MCP connector');
    } else {
      console.log('\n✅ No PKCE parameters - good for ChatGPT compatibility');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
