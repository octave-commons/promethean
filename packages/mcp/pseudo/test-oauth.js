#!/usr/bin/env node

/**
 * Test script to verify OAuth integration
 */

import { createOAuthFastifyIntegration } from './src/auth/fastify-integration.js';
import { AuthenticationManager } from './src/core/authentication.js';
import Fastify from 'fastify';

async function testOAuthIntegration() {
  console.log('🧪 Testing OAuth Integration...');

  const authManager = new AuthenticationManager();
  const oauthIntegration = createOAuthFastifyIntegration(authManager);
  const fastify = Fastify({ logger: true });

  try {
    // Initialize OAuth with test configuration
    await oauthIntegration.initialize(fastify, {
      enableOAuth: true,
      configPath: './test-oauth-config.json',
      secureCookies: false,
      sameSitePolicy: 'lax',
    });

    console.log('✅ OAuth integration initialized successfully');

    // Test health endpoint
    const reply = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/health',
    });

    console.log('📊 OAuth Health Response:', JSON.parse(reply.body));

    // Test discovery endpoint
    const discoveryReply = await fastify.inject({
      method: 'GET',
      url: '/.well-known/oauth-authorization-server/mcp',
    });

    console.log('🔍 Discovery Response Status:', discoveryReply.statusCode);
    if (discoveryReply.statusCode === 200) {
      console.log('📋 Discovery Response:', JSON.parse(discoveryReply.body));
    }
  } catch (error) {
    console.error('❌ OAuth integration failed:', error);
  } finally {
    await fastify.close();
  }
}

testOAuthIntegration().catch(console.error);
