import test from "ava";
import { execa } from "execa";

test("deployment: docker build verification", async (t) => {
  // Test Docker build
  try {
    const { stdout: buildOutput } = await execa("docker", [
      "build",
      "-t", "omni-service:test",
      "--target", "production",
      "./packages/omni-service"
    ], {
      cwd: "/home/err/devel/promethean",
      timeout: 600000, // 10 minutes
    });

    t.pass(`Docker build succeeded: ${buildOutput}`);
  } catch (error: any) {
    t.fail(`Docker build failed: ${error.message}`);
  }
});

test("deployment: docker compose validation", async (t) => {
  try {
    const { stdout: validationOutput } = await execa("docker-compose", [
      "config",
      "--quiet",
      "./packages/omni-service/docker-compose.yml"
    ], {
      cwd: "/home/err/devel/promethean",
      timeout: 300000, // 5 minutes
    });

    t.pass(`Docker Compose configuration is valid: ${validationOutput}`);
  } catch (error: any) {
    t.fail(`Docker Compose validation failed: ${error.message}`);
  }
});

test("deployment: docker compose startup verification", async (t) => {
  // Start services in detached mode
  try {
    // Clean up any existing containers
    await execa("docker-compose", ["-p", "omni-test", "down", "-v"], {
      cwd: "/home/err/devel/promethean/packages/omni-service",
      timeout: 300000,
    });

    // Start services
    const { stdout: startOutput } = await execa("docker-compose", [
      "-p", "omni-test",
      "up",
      "-d",
      "--build",
      "omni-service",
      "redis"
    ], {
      cwd: "/home/err/devel/promethean/packages/omni-service",
      timeout: 600000, // 10 minutes
    });

    t.pass(`Docker Compose startup succeeded: ${startOutput}`);

    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check if services are running
    const { stdout: psOutput } = await execa("docker-compose", [
      "-p", "omni-test", "ps"
    ], {
      cwd: "/home/err/devel/promethean/packages/omni-service",
      timeout: 300000,
    });

    t.true(psOutput.includes("omni-service_1"), "Omni service should be running");
    t.true(psOutput.includes("redis_1"), "Redis should be running");

    // Test health endpoint
    const { stdout: healthOutput } = await execa("curl", [
      "-f",
      "http://localhost:3000/health"
    ], {
      timeout: 30000,
    });

    const healthData = JSON.parse(healthOutput);
    t.is(healthData.status, "ok", "Health endpoint should return ok");

    // Test adapter endpoints
    const { stdout: adapterOutput } = await execa("curl", [
      "-f",
      "http://localhost:3000/adapters/status"
    ], {
      timeout: 30000,
    });

    const adapterData = JSON.parse(adapterOutput);
    t.is(adapterData.status, "ok", "Adapter status should return ok");

    // Clean up
    await execa("docker-compose", ["-p", "omni-test", "down", "-v"], {
      cwd: "/home/err/devel/promethean/packages/omni-service",
      timeout: 300000,
    });

    t.pass("Docker Compose test completed successfully");

  } catch (error: any) {
    // Try to clean up even if test failed
    try {
      await execa("docker-compose", ["-p", "omni-test", "down", "-v"], {
        cwd: "/home/err/devel/promethean/packages/omni-service",
        timeout: 300000,
      });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    t.fail(`Docker Compose test failed: ${error.message}`);
  }
});

test("deployment: nginx configuration validation", async (t) => {
  try {
    // Test nginx configuration
    const { stdout: nginxTestOutput } = await execa("nginx", [
      "-t",
      "-c",
      "/home/err/devel/promethean/packages/omni-service/docker/nginx/nginx.conf",
      "-T",
      "http"
    ], {
      timeout: 30000,
    });

    t.pass(`Nginx configuration is valid: ${nginxTestOutput}`);
  } catch (error: any) {
    t.fail(`Nginx configuration test failed: ${error.message}`);
  }
});

test("deployment: environment configuration verification", async (t) => {
  // Test that required environment variables are validated
  const testCases = [
    {
      name: "Invalid JWT secret (too short)",
      env: { JWT_SECRET: "short", NODE_ENV: "production" },
      shouldFail: true,
    },
    {
      name: "Invalid JWT secret (missing)",
      env: { NODE_ENV: "production" },
      shouldFail: true,
    },
    {
      name: "Valid configuration",
      env: {
        JWT_SECRET: "this-is-a-valid-jwt-secret-that-is-at-least-32-characters-long",
        NODE_ENV: "development",
        PORT: "3000",
        HOST: "0.0.0.0",
        LOG_LEVEL: "info",
        CORS_ORIGIN: "http://localhost:3000",
        RATE_LIMIT_MAX: "100",
        APIKEY_ENABLED: "true",
        RBAC_DEFAULT_ROLES: "readonly"
      },
      shouldFail: false,
    },
  ];

  for (const testCase of testCases) {
    try {
      // Create a temporary .env file
      const envContent = Object.entries(testCase.env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const fs = await import('fs/promises');
      const path = await import('path');
      const tempEnvPath = path.join('/tmp', `test-env-${Date.now()}.env`);
      await fs.writeFile(tempEnvPath, envContent);

      // Test the service with the environment variables
      const { stdout } = await execa("node", [
        "--loader", "ts-node/esm",
        "-e",
        `
        import { config } from './packages/omni-service/src/config.js';
        console.log(JSON.stringify({ success: true }));
        `,
        "-e",
        `JWT_SECRET=${testCase.env.JWT_SECRET}`,
        "-e",
        `NODE_ENV=${testCase.env.NODE_ENV}`
      ], {
        cwd: "/home/err/devel/promethean",
        env: testCase.env,
        timeout: 30000,
      });

      await fs.unlink(tempEnvPath);

      if (testCase.shouldFail) {
        t.fail(`Test case "${testCase.name}" should have failed but passed`);
      } else {
        t.pass(`Test case "${testCase.name}" passed`);
      }
    } catch (error: any) {
      if (!testCase.shouldFail) {
        t.fail(`Test case "${testCase.name}" failed: ${error.message}`);
      } else {
        t.pass(`Test case "${testCase.name}" correctly failed`);
      }
    }
  }
});

test("deployment: resource limits and optimization", async (t) => {
  // Test that Docker image is optimized for production
  try {
    // Get image size
    const { stdout: sizeOutput } = await execa("docker", [
      "images",
      "omni-service:latest",
      "--format",
      "{{.Size}}"
    ], {
      timeout: 30000,
    });

    const imageSize = parseInt(sizeOutput.trim(), 10);
    t.true(imageSize < 200 * 1024 * 1024, `Image size should be less than 200MB, got ${imageSize} bytes`);

    // Test image layers
    const { stdout: layersOutput } = await execa("docker", [
      "history",
      "omni-service:latest",
      "--format",
      "{{.ID}}"
    ], {
      timeout: 30000,
    });

    const layerCount = layersOutput.trim().split('\n').length;
    t.true(layerCount < 15, `Image should have fewer than 15 layers, got ${layerCount}`);

    // Test security scanner (if available)
    try {
      const { stdout: scanOutput } = await execa("trivy", [
        "image",
        "--severity", "HIGH,CRITICAL",
        "--exit-code", "1",
        "omni-service:latest"
      ], {
        timeout: 120000,
      });
      
      t.pass(`Security scan passed: ${scanOutput}`);
    } catch (scanError: any) {
      // Trivy might not be installed, so we skip this test
      if (scanError.code !== 127) {
        t.fail(`Security scan failed: ${scanError.message}`);
      } else {
        t.pass("Security scan skipped (trivy not installed)");
      }
    }

  } catch (error: any) {
    t.fail(`Resource limits test failed: ${error.message}`);
  }
});

test("deployment: configuration generation verification", async (t) => {
  try {
    // Test that configuration generation works correctly
    const { stdout: configOutput } = await execa("node", [
      "--loader", "ts-node/esm",
      "-e",
      `
      import { config, getAuthConfig, getAdapterConfig } from './packages/omni-service/src/config.js';
      
      console.log(JSON.stringify({
        config: {
          port: config.port,
          host: config.host,
          nodeEnv: config.nodeEnv,
          jwtEnabled: !!config.jwt,
          rbacEnabled: !!config.rbac,
          adapters: config.adapters
        },
        authConfig: getAuthConfig(),
        adapterConfigs: {
          rest: getAdapterConfig('rest'),
          graphql: getAdapterConfig('graphql'),
          websocket: getAdapterConfig('websocket'),
          mcp: getAdapterConfig('mcp')
        }
      }));
      `,
    ], {
      cwd: "/home/err/devel/promethean",
      env: {
        JWT_SECRET: "this-is-a-test-jwt-secret-that-is-at-least-32-characters-long",
        NODE_ENV: "test",
        PORT: "3000",
        HOST: "0.0.0.0",
        LOG_LEVEL: "info",
        CORS_ORIGIN: "http://localhost:3000",
        RATE_LIMIT_MAX: "100",
        APIKEY_ENABLED: "true",
        RBAC_DEFAULT_ROLES: "readonly"
      },
      timeout: 30000,
    });

    const configData = JSON.parse(configOutput.trim());
    
    // Verify configuration structure
    t.is(configData.config.port, 3000, "Port should be 3000");
    t.is(configData.config.host, "0.0.0.0", "Host should be 0.0.0.0");
    t.is(configData.config.nodeEnv, "test", "Node env should be test");
    t.true(configData.config.jwtEnabled, "JWT should be enabled");
    t.true(configData.config.rbacEnabled, "RBAC should be enabled");
    t.truthy(configData.config.adapters, "Adapters should be defined");

    // Verify auth configuration
    t.truthy(configData.authConfig, "Auth config should be defined");
    t.is(configData.authConfig.jwt.secret.length, 53, "JWT secret should be at least 32 chars");

    // Verify adapter configurations
    t.truthy(configData.adapterConfigs.rest, "REST adapter config should be defined");
    t.truthy(configData.adapterConfigs.graphql, "GraphQL adapter config should be defined");
    t.truthy(configData.adapterConfigs.websocket, "WebSocket adapter config should be defined");
    t.truthy(configData.adapterConfigs.mcp, "MCP adapter config should be defined");

  } catch (error: any) {
    t.fail(`Configuration generation test failed: ${error.message}`);
  }
});

test("deployment: container runtime verification", async (t) => {
  try {
    // Test that the production container can start and respond
    const containerName = `omni-service-test-${Date.now()}`;
    
    try {
      // Start the container
      const { stdout: runOutput } = await execa("docker", [
        "run",
        "-d",
        "--name", containerName,
        "-p", "3001", // Use different port to avoid conflicts
        "-e", "JWT_SECRET=this-is-a-test-jwt-secret-that-is-at-least-32-characters-long",
        "-e", "NODE_ENV=test",
        "omni-service:latest",
        "pnpm", "start"
      ], {
        timeout: 60000,
      });

      // Wait for container to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Test health endpoint
      const { stdout: healthOutput } = await execa("curl", [
        "-f",
        "http://localhost:3001/health"
      ], {
        timeout: 30000,
      });

      const healthData = JSON.parse(healthOutput);
      t.is(healthData.status, "ok", "Health endpoint should return ok");

      // Test service root endpoint
      const { stdout: rootOutput } = await execa("curl", [
        "-f",
        "http://localhost:3001/"
      ], {
        timeout: 30000,
      });

      const rootData = JSON.parse(rootOutput);
      t.is(rootData.service, "Promethean Omni Service", "Root endpoint should return correct service name");

      // Test that we can make authenticated requests
      const { stdout: authOutput } = await execa("curl", [
        "-f",
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "http://localhost:3001/auth/login",
        "-d", '{"username": "test", "password": "test"}'
      ], {
        timeout: 30000,
      });

      const authData = JSON.parse(authOutput);
      t.is(authData.user.id, "user_test", "Login should work");
      t.truthy(authData.tokens.accessToken, "Login should return access token");

    } finally {
      // Clean up container
      await execa("docker", ["rm", "-f", containerName], {
        timeout: 30000,
      });

      // Force stop container if still running
      try {
        await execa("docker", ["stop", containerName], {
          timeout: 30000,
        });
      } catch {
        // Container might already be stopped
      }

      try {
        await execa("docker", ["rm", containerName], {
          timeout: 30000,
        });
      } catch {
        // Container might already be removed
      }
    }

  } catch (error: any) {
    t.fail(`Container runtime test failed: ${error.message}`);
  }
});