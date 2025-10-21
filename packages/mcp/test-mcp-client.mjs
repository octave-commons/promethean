#!/usr/bin/env node

/**
 * Quick Test Client for MCP + OAuth + Ollama
 *
 * Simulates ChatGPT's MCP connector flow:
 * 1. OAuth login to get access token
 * 2. Use token to authenticate with MCP server
 * 3. Talk to Ollama through OpenAI-compatible endpoints
 */

import fetch from 'node-fetch';

class MCPTestClient {
  constructor(oauthServerUrl, mcpServerUrl, ollamaUrl) {
    this.oauthServerUrl = oauthServerUrl;
    this.mcpServerUrl = mcpServerUrl;
    this.ollamaUrl = ollamaUrl;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Step 1: OAuth Login - Simulate ChatGPT MCP connector
   */
  async oauthLogin() {
    console.log('🔐 Starting OAuth flow (ChatGPT MCP style)...');

    try {
      // Step 1: Get OAuth authorization URL
      const authUrl = `${this.oauthServerUrl}/auth/oauth/login?response_type=code&client_id=test&redirect_uri=https://chatgpt.com/connector_platform_oauth_redirect&state=test123`;
      console.log(`📋 Visit: ${authUrl}`);

      // For testing, we'll simulate getting an authorization code
      // In real flow, user would complete GitHub OAuth and get redirected
      console.log('⚠️  Simulating OAuth completion...');

      // Step 2: Simulate ChatGPT's PKCE token request
      const tokenResponse = await fetch(`${this.oauthServerUrl}/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: 'simulated_auth_code_12345', // This would be real code from OAuth
          redirect_uri: 'https://chatgpt.com/connector_platform_oauth_redirect',
          code_verifier: 'simulated_code_verifier_67890',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`OAuth token exchange failed: ${error}`);
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;

      console.log('✅ OAuth login successful');
      console.log(`   Access Token: ${this.accessToken?.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('❌ OAuth login failed:', error.message);
      return false;
    }
  }

  /**
   * Step 2: Discover MCP Tools
   */
  async discoverMCPTools() {
    console.log('🔍 Discovering MCP tools...');

    try {
      const response = await fetch(`${this.mcpServerUrl}/mcp/tools`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to discover tools: ${response.status}`);
      }

      const tools = await response.json();
      console.log(`✅ Found ${tools.tools?.length || 0} MCP tools:`);

      if (tools.tools) {
        tools.tools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}: ${tool.description?.substring(0, 80)}...`);
        });
      }

      return tools.tools || [];
    } catch (error) {
      console.error('❌ Failed to discover MCP tools:', error.message);
      return [];
    }
  }

  /**
   * Step 3: Call MCP Tool
   */
  async callMCPTool(toolName, args = {}) {
    console.log(`🔧 Calling MCP tool: ${toolName}`);

    try {
      const response = await fetch(`${this.mcpServerUrl}/mcp/call`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Tool ${toolName} executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Tool ${toolName} failed:`, error.message);
      return null;
    }
  }

  /**
   * Step 4: Chat with Ollama (OpenAI-compatible)
   */
  async chatWithOllama(message, model = 'llama2') {
    console.log(`💬 Chatting with Ollama (${model}): ${message.substring(0, 50)}...`);

    try {
      const response = await fetch(`${this.ollamaUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama chat failed: ${response.status}`);
      }

      const result = await response.json();
      const reply = result.choices?.[0]?.message?.content || 'No response';

      console.log(`🤖 Ollama response: ${reply.substring(0, 100)}...`);
      return reply;
    } catch (error) {
      console.error('❌ Ollama chat failed:', error.message);
      return null;
    }
  }

  /**
   * Complete Test Flow
   */
  async runCompleteTest() {
    console.log('🚀 Starting complete MCP + OAuth + Ollama test flow\n');

    // Step 1: OAuth Login
    const oauthSuccess = await this.oauthLogin();
    if (!oauthSuccess) {
      console.log('❌ Test failed at OAuth step');
      return false;
    }
    console.log('');

    // Step 2: Discover MCP Tools
    const tools = await this.discoverMCPTools();
    console.log('');

    // Step 3: Call a sample MCP tool if available
    if (tools.length > 0) {
      const sampleTool = tools[0];
      console.log(`🧪 Testing MCP tool: ${sampleTool.name}`);
      await this.callMCPTool(sampleTool.name, {});
      console.log('');
    }

    // Step 4: Chat with Ollama
    console.log('🧪 Testing Ollama integration...');
    const chatMessage = 'Hello! Can you help me understand how MCP tools work?';
    const ollamaResponse = await this.chatWithOllama(chatMessage);
    console.log('');

    // Step 5: Combine both - use MCP tools in chat context
    if (tools.length > 0 && ollamaResponse) {
      console.log('🔗 Testing combined MCP + Ollama flow...');
      const combinedMessage = `
I have access to these MCP tools:
${tools.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

Using this context, please respond to: "What can you help me accomplish?"
      `.trim();

      const combinedResponse = await this.chatWithOllama(combinedMessage);
      if (combinedResponse) {
        console.log('✅ Combined MCP + Ollama test successful!');
      }
    }

    console.log('\n🎉 Test completed!');
    return true;
  }

  /**
   * Simple health check
   */
  async healthCheck() {
    console.log('🏥 Running health checks...');

    const checks = [
      {
        name: 'OAuth Server',
        url: `${this.oauthServerUrl}/auth/oauth/health`,
      },
      {
        name: 'MCP Server',
        url: `${this.mcpServerUrl}/health`,
      },
      {
        name: 'Ollama Server',
        url: `${this.ollamaUrl}/api/tags`,
      },
    ];

    for (const check of checks) {
      try {
        const response = await fetch(check.url, { timeout: 5000 });
        const status = response.ok ? '✅ OK' : `❌ ${response.status}`;
        console.log(`   ${check.name}: ${status}`);
      } catch (error) {
        console.log(`   ${check.name}: ❌ ${error.message}`);
      }
    }
  }
}

// Configuration
const OAUTH_SERVER_URL = 'http://localhost:3001';
const MCP_SERVER_URL = 'http://localhost:3001'; // Our MCP server runs on same port
const OLLAMA_URL = 'http://localhost:11434';

// Main execution
async function main() {
  const client = new MCPTestClient(OAUTH_SERVER_URL, MCP_SERVER_URL, OLLAMA_URL);

  // Run health check first
  await client.healthCheck();
  console.log('');

  // Run complete test
  await client.runCompleteTest();
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPTestClient };
