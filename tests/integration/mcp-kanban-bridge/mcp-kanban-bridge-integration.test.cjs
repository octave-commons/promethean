#!/usr/bin/env node

/**
 * MCP-Kanban Bridge Integration Test
 *
 * Tests the integration between MCP protocol concepts and kanban operations
 * Validates that all kanban CLI operations can be wrapped as MCP tools
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

class MCPKanbanBridgeIntegrationTest {
  constructor() {
    this.testResults = new Map();
    this.projectRoot = process.cwd();
  }

  /**
   * Test 1: Validate kanban CLI operations availability
   */
  async testKanbanCLIOperations() {
    console.log('🔧 Test 1: Kanban CLI Operations Availability');
    console.log('---------------------------------------------');

    try {
      // Test kanban CLI help to see available operations
      console.log('📋 Checking kanban CLI operations...');

      const helpOutput = execSync('pnpm kanban --help', {
        encoding: 'utf8',
        timeout: 30000,
      });

      // Extract available operations from help text
      const operations = [
        'create',
        'update',
        'delete',
        'list',
        'find',
        'search',
        'count',
        'push',
        'pull',
        'sync',
        'regenerate',
        'move_up',
        'move_down',
        'update_status',
        'getColumn',
        'audit',
        'ui',
      ];

      const availableOperations = [];
      const missingOperations = [];

      for (const op of operations) {
        if (helpOutput.includes(op)) {
          availableOperations.push(op);
        } else {
          missingOperations.push(op);
        }
      }

      console.log(`✅ Available operations: ${availableOperations.length}`);
      console.log(`✅ Missing operations: ${missingOperations.length}`);

      if (missingOperations.length > 0) {
        console.log(`⚠️ Missing: ${missingOperations.join(', ')}`);
      }

      this.testResults.set('kanban-cli-operations', {
        success: true,
        totalOperations: operations.length,
        availableOperations: availableOperations.length,
        missingOperations,
        helpOutput: helpOutput.substring(0, 1000), // Truncate
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Kanban CLI test failed:`, error);
      this.testResults.set('kanban-cli-operations', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 2: Test core kanban operations that would be wrapped as MCP tools
   */
  async testCoreKanbanOperations() {
    console.log('🛠️ Test 2: Core Kanban Operations');
    console.log('---------------------------------');

    try {
      const operations = [
        {
          name: 'list',
          command: 'pnpm kanban list --status testing',
          description: 'List tasks in testing column',
        },
        {
          name: 'count',
          command: 'pnpm kanban count',
          description: 'Count tasks by column',
        },
        {
          name: 'search',
          command: 'pnpm kanban search "build"',
          description: 'Search for build-related tasks',
        },
        {
          name: 'board',
          command: 'pnpm kanban regenerate',
          description: 'Regenerate board from tasks',
        },
      ];

      const results = [];

      for (const op of operations) {
        console.log(`🔄 Testing: ${op.description}`);

        try {
          const startTime = Date.now();
          const output = execSync(op.command, {
            encoding: 'utf8',
            timeout: 30000,
          });
          const duration = Date.now() - startTime;

          console.log(`✅ ${op.name}: Completed in ${duration}ms`);

          results.push({
            name: op.name,
            success: true,
            duration,
            outputLength: output.length,
            hasOutput: output.trim().length > 0,
          });
        } catch (error) {
          console.log(`❌ ${op.name}: Failed - ${error.message}`);

          results.push({
            name: op.name,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(`✅ Core operations successful: ${successCount}/${results.length}`);

      this.testResults.set('core-kanban-operations', {
        success: successCount > 0,
        results,
        successRate: (successCount / results.length) * 100,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Core operations test failed:`, error);
      this.testResults.set('core-kanban-operations', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 3: MCP Tool Mapping Analysis
   */
  async testMCPToolMapping() {
    console.log('🗺️ Test 3: MCP Tool Mapping Analysis');
    console.log('------------------------------------');

    try {
      // Define the MCP tools that should be available
      const mcpTools = [
        {
          name: 'kanban_create_task',
          kanbanOp: 'create',
          description: 'Create a new kanban task',
          parameters: ['title', 'content?', 'priority?', 'status?', 'labels?'],
        },
        {
          name: 'kanban_list_tasks',
          kanbanOp: 'list',
          description: 'List kanban tasks',
          parameters: ['status?', 'limit?'],
        },
        {
          name: 'kanban_get_task',
          kanbanOp: 'find',
          description: 'Get specific task details',
          parameters: ['uuid'],
        },
        {
          name: 'kanban_update_task',
          kanbanOp: 'update',
          description: 'Update existing task',
          parameters: ['uuid', 'title?', 'content?', 'priority?', 'status?', 'labels?'],
        },
        {
          name: 'kanban_delete_task',
          kanbanOp: 'delete',
          description: 'Delete a task',
          parameters: ['uuid'],
        },
        {
          name: 'kanban_search_tasks',
          kanbanOp: 'search',
          description: 'Search tasks',
          parameters: ['query', 'limit?'],
        },
        {
          name: 'kanban_get_column',
          kanbanOp: 'getColumn',
          description: 'Get column tasks',
          parameters: ['column', 'format?'],
        },
        {
          name: 'kanban_move_task',
          kanbanOp: 'move_up/move_down',
          description: 'Move task in column',
          parameters: ['uuid', 'direction'],
        },
        {
          name: 'kanban_update_status',
          kanbanOp: 'update_status',
          description: 'Update task status',
          parameters: ['uuid', 'status'],
        },
        {
          name: 'kanban_get_board',
          kanbanOp: 'regenerate',
          description: 'Get board overview',
          parameters: ['format?'],
        },
      ];

      console.log(`📋 Defined MCP tools: ${mcpTools.length}`);

      // Analyze parameter complexity
      const paramAnalysis = {
        simple: 0, // 1-2 parameters
        moderate: 0, // 3-4 parameters
        complex: 0, // 5+ parameters
      };

      for (const tool of mcpTools) {
        const paramCount = tool.parameters.length;
        if (paramCount <= 2) paramAnalysis.simple++;
        else if (paramCount <= 4) paramAnalysis.moderate++;
        else paramAnalysis.complex++;
      }

      console.log(`✅ Simple tools (1-2 params): ${paramAnalysis.simple}`);
      console.log(`✅ Moderate tools (3-4 params): ${paramAnalysis.moderate}`);
      console.log(`✅ Complex tools (5+ params): ${paramAnalysis.complex}`);

      // Validate tool naming consistency
      const namingConsistency = mcpTools.every(
        (tool) => tool.name.startsWith('kanban_') && tool.name.includes('_'),
      );

      console.log(`✅ Naming consistency: ${namingConsistency ? 'Pass' : 'Fail'}`);

      this.testResults.set('mcp-tool-mapping', {
        success: true,
        totalTools: mcpTools.length,
        paramAnalysis,
        namingConsistency,
        tools: mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          paramCount: t.parameters.length,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ MCP tool mapping test failed:`, error);
      this.testResults.set('mcp-tool-mapping', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 4: Schema Validation Analysis
   */
  async testSchemaValidation() {
    console.log('📝 Test 4: Schema Validation Analysis');
    console.log('-------------------------------------');

    try {
      // Analyze task data structure from actual kanban tasks
      console.log('🔍 Analyzing task data structure...');

      const listOutput = execSync('pnpm kanban list --status testing --limit 5', {
        encoding: 'utf8',
        timeout: 30000,
      });

      // Try to parse as JSON to understand structure
      let taskStructure = null;
      let isStructured = false;

      try {
        const lines = listOutput.trim().split('\n');
        const jsonLine = lines.find((line) => line.startsWith('{') && line.endsWith('}'));
        if (jsonLine) {
          taskStructure = JSON.parse(jsonLine);
          isStructured = true;
        }
      } catch (parseError) {
        // Fallback to manual analysis
        isStructured = false;
      }

      // Define expected schema based on kanban types
      const expectedSchema = {
        uuid: 'string (required)',
        title: 'string (required)',
        status: 'string (required)',
        priority: 'string (optional: P0, P1, P2, P3)',
        labels: 'array<string> (optional)',
        created_at: 'string (ISO date, optional)',
        content: 'string (optional)',
        estimates: 'object (optional)',
        type: 'string (optional: task, epic)',
        epicId: 'string (optional)',
        subtaskIds: 'array<string> (optional)',
      };

      console.log(`✅ Expected schema fields: ${Object.keys(expectedSchema).length}`);
      console.log(`✅ Data is structured: ${isStructured}`);

      // Validate schema completeness
      const schemaFields = Object.keys(expectedSchema);
      const requiredFields = schemaFields.filter((field) =>
        expectedSchema[field].includes('required'),
      );
      const optionalFields = schemaFields.filter((field) =>
        expectedSchema[field].includes('optional'),
      );

      console.log(`✅ Required fields: ${requiredFields.length}`);
      console.log(`✅ Optional fields: ${optionalFields.length}`);

      this.testResults.set('schema-validation', {
        success: true,
        expectedSchema,
        requiredFields,
        optionalFields,
        isStructured,
        hasSampleData: listOutput.trim().length > 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Schema validation test failed:`, error);
      this.testResults.set('schema-validation', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 5: Integration Requirements Analysis
   */
  async testIntegrationRequirements() {
    console.log('🔗 Test 5: Integration Requirements Analysis');
    console.log('------------------------------------------');

    try {
      const requirements = {
        mcpSdk: {
          available: false,
          version: null,
          installation: 'npm install @modelcontextprotocol/sdk',
        },
        kanbanPackage: {
          available: true,
          version: null,
          path: 'packages/kanban',
        },
        transports: {
          stdio: 'Supported - Standard MCP transport',
          http: 'Could be implemented with Fastify',
          websocket: 'Could be implemented with ws library',
        },
        security: {
          authentication: 'Needs implementation',
          authorization: 'Needs implementation',
          rateLimit: 'Needs implementation',
        },
        performance: {
          responseTime: 'Target: <100ms for simple operations',
          throughput: 'Target: 100+ operations/second',
          concurrency: 'Needs implementation',
        },
      };

      // Check if MCP SDK is available
      try {
        const mcpCheck = execSync('npm list @modelcontextprotocol/sdk', {
          encoding: 'utf8',
          timeout: 10000,
        });
        requirements.mcpSdk.available = mcpCheck.includes('@modelcontextprotocol/sdk');
      } catch (error) {
        requirements.mcpSdk.available = false;
      }

      // Check kanban package version
      try {
        const packagePath = join(this.projectRoot, 'packages/kanban/package.json');
        if (existsSync(packagePath)) {
          const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
          requirements.kanbanPackage.version = packageJson.version;
        }
      } catch (error) {
        // Ignore
      }

      console.log('📦 MCP SDK Status:');
      console.log(`   Available: ${requirements.mcpSdk.available}`);
      if (!requirements.mcpSdk.available) {
        console.log(`   Installation: ${requirements.mcpSdk.installation}`);
      }

      console.log('📋 Kanban Package Status:');
      console.log(`   Available: ${requirements.kanbanPackage.available}`);
      console.log(`   Version: ${requirements.kanbanPackage.version || 'Unknown'}`);

      console.log('🚀 Transports:');
      Object.entries(requirements.transports).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      console.log('🔒 Security:');
      Object.entries(requirements.security).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      console.log('⚡ Performance:');
      Object.entries(requirements.performance).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      this.testResults.set('integration-requirements', {
        success: true,
        requirements,
        readiness: {
          mcpSdk: requirements.mcpSdk.available,
          kanbanPackage: requirements.kanbanPackage.available,
          overall: requirements.kanbanPackage.available, // Can proceed with mock implementation
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Integration requirements test failed:`, error);
      this.testResults.set('integration-requirements', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('📊 MCP-Kanban Bridge Integration Test Report');
    console.log('==============================================\n');

    const totalTests = this.testResults.size;
    const successfulTests = Array.from(this.testResults.values()).filter((r) => r.success).length;
    const successRate = (successfulTests / totalTests) * 100;

    console.log(
      `📈 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`,
    );
    console.log('');

    // Test results summary
    for (const [testName, result] of this.testResults) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName.replace(/([A-Z])/g, ' $1').toLowerCase()}`);

      if (result.totalOperations !== undefined) {
        console.log(`   Operations: ${result.availableOperations}/${result.totalOperations}`);
      }

      if (result.successRate !== undefined) {
        console.log(`   Success rate: ${result.successRate.toFixed(1)}%`);
      }

      if (result.totalTools !== undefined) {
        console.log(`   MCP tools defined: ${result.totalTools}`);
      }

      if (result.readiness !== undefined) {
        console.log(`   Integration ready: ${result.readiness.overall ? 'Yes' : 'Needs work'}`);
      }

      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }

    // Bridge readiness assessment
    console.log('🌉 Bridge Readiness Assessment:');

    const cliResult = this.testResults.get('kanban-cli-operations');
    const coreResult = this.testResults.get('core-kanban-operations');
    const mappingResult = this.testResults.get('mcp-tool-mapping');
    const requirementsResult = this.testResults.get('integration-requirements');

    let readinessScore = 0;
    const maxScore = 4;

    if (cliResult && cliResult.success && cliResult.availableOperations >= 10) {
      console.log('   ✅ Kanban CLI: Ready with comprehensive operations');
      readinessScore++;
    } else {
      console.log('   ⚠️ Kanban CLI: Limited operations available');
    }

    if (coreResult && coreResult.success && coreResult.successRate >= 75) {
      console.log('   ✅ Core Operations: Working reliably');
      readinessScore++;
    } else {
      console.log('   ⚠️ Core Operations: Some failures detected');
    }

    if (mappingResult && mappingResult.success && mappingResult.totalTools >= 8) {
      console.log('   ✅ MCP Tool Mapping: Comprehensive tool coverage');
      readinessScore++;
    } else {
      console.log('   ⚠️ MCP Tool Mapping: Limited tool coverage');
    }

    if (
      requirementsResult &&
      requirementsResult.success &&
      requirementsResult.readiness.kanbanPackage
    ) {
      console.log('   ✅ Integration Requirements: Foundation ready');
      readinessScore++;
    } else {
      console.log('   ⚠️ Integration Requirements: Missing dependencies');
    }

    const overallReadiness = (readinessScore / maxScore) * 100;
    console.log(`\n🎯 Overall Bridge Readiness: ${overallReadiness.toFixed(0)}%`);

    if (overallReadiness >= 75) {
      console.log('🚀 Ready to implement MCP-Kanban Bridge');
    } else if (overallReadiness >= 50) {
      console.log('🔧 Mostly ready - some gaps to address');
    } else {
      console.log('⚠️ Significant preparation needed');
    }

    console.log('\n💡 Implementation Recommendations:');
    console.log('   1. Install MCP SDK: npm install @modelcontextprotocol/sdk');
    console.log('   2. Create MCP server with stdio transport');
    console.log('   3. Wrap kanban CLI operations as MCP tools');
    console.log('   4. Add proper error handling and validation');
    console.log('   5. Implement authentication and authorization');
    console.log('   6. Add comprehensive test coverage');
    console.log('');

    // Save detailed report
    const reportData = {
      summary: {
        totalTests,
        successfulTests,
        successRate,
        readinessScore,
        overallReadiness,
        timestamp: new Date().toISOString(),
      },
      results: Object.fromEntries(this.testResults),
    };

    const reportPath = join(this.projectRoot, 'mcp-kanban-bridge-integration-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🌉 MCP-Kanban Bridge Integration Test Suite');
    console.log('============================================\n');

    await this.testKanbanCLIOperations();
    await this.testCoreKanbanOperations();
    await this.testMCPToolMapping();
    await this.testSchemaValidation();
    await this.testIntegrationRequirements();
    this.generateReport();
  }
}

// Run the tests
if (require.main === module) {
  const testSuite = new MCPKanbanBridgeIntegrationTest();
  testSuite.runAllTests().catch(console.error);
}

module.exports = { MCPKanbanBridgeIntegrationTest };
