import { createApp } from "./app.js";
import { config } from "./config.js";

/**
 * Main entrypoint for the @promethean/omni-service
 * Starts the unified service host with all adapters mounted
 */

async function start() {
  try {
    const app = createApp(config);
    const port = config.port || 3000;
    const host = config.host || "0.0.0.0";
    
    await app.listen({ port, host });
    
    console.log(`🚀 Omni Service started on http://${host}:${port}`);
    console.log(`📚 Documentation: http://${host}:${port}/docs`);
    console.log(`🔧 Health Check: http://${host}:${port}/health`);
    console.log(`🔐 Authentication: http://${host}:${port}/auth/login`);
    
    // Display adapter information
    const adapters = Object.entries(config.adapters)
      .filter(([_, adapter]) => adapter.enabled)
      .map(([name, adapter]) => ({
        name,
        endpoint: name === "rest" 
          ? `${adapter.prefix}/${adapter.version}`
          : name === "graphql"
          ? adapter.endpoint
          : name === "websocket"
          ? adapter.path
          : name === "mcp"
          ? adapter.prefix
          : "",
        ...adapter
      }));
    
    console.log(`\n📦 Active Adapters (${adapters.length}):`);
    adapters.forEach(adapter => {
      console.log(`   ✅ ${adapter.name}: ${adapter.endpoint}`);
    });
    
    // Display adapter-specific URLs
    console.log(`\n🔌 Adapter Endpoints:`);
    if (config.adapters.rest?.enabled) {
      console.log(`   🌐 REST API: http://${host}:${port}${config.adapters.rest.prefix}/${config.adapters.rest.version}`);
    }
    if (config.adapters.graphql?.enabled) {
      console.log(`   📊 GraphQL: http://${host}:${port}${config.adapters.graphql.endpoint}`);
      if (config.adapters.graphql.playground) {
        console.log(`   🎮 GraphQL Playground: http://${host}:${port}${config.adapters.graphql.endpoint}/playground`);
      }
    }
    if (config.adapters.websocket?.enabled) {
      console.log(`   📡 WebSocket: ws://${host}:${port}${config.adapters.websocket.path}`);
    }
    if (config.adapters.mcp?.enabled) {
      console.log(`   🔌 MCP: http://${host}:${port}${config.adapters.mcp.prefix}`);
    }
    
    console.log(`\n🛡️ Security Features:`);
    console.log(`   ✅ JWT Authentication: ${config.jwt ? "Enabled" : "Disabled"}`);
    console.log(`   ✅ Role-Based Access Control: ${config.rbac ? "Enabled" : "Disabled"}`);
    console.log(`   ✅ API Key Support: ${config.apikey?.enabled ? "Enabled" : "Disabled"}`);
    console.log(`   ✅ Session Management: ${config.session?.enabled ? "Enabled" : "Disabled"}`);
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Received ${signal}, shutting down gracefully...`);
      
      // Close WebSocket server if mounted
      const wsAdapter = (app as any).wsAdapter;
      if (wsAdapter) {
        wsAdapter.close();
      }
      
      app.close().then(() => {
        console.log("✅ Omni Service stopped successfully");
        process.exit(0);
      }).catch((err) => {
        console.error("❌ Error during shutdown:", err);
        process.exit(1);
      });
    };
    
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    
  } catch (error) {
    console.error("❌ Failed to start Omni Service:", error);
    process.exit(1);
  }
}

// Start the service if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { start, createApp };
export { config };
export { getAdapterStats } from "./app.js";