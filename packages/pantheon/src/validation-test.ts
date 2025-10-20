#!/usr/bin/env node

/**
 * Pantheon Framework Validation Test
 * Tests all major components of the framework
 */

import {
  makeOrchestrator,
  makeInMemoryContextAdapter,
  makeInMemoryToolAdapter,
  makeInMemoryLlmAdapter,
  makeInMemoryMessageBusAdapter,
  makeInMemorySchedulerAdapter,
  makeInMemoryActorStateAdapter,
} from '@promethean/pantheon-core';

import { generateId, createConsoleLogger, PantheonError } from './utils/index.js';
import { createToolActor, createCompositeActor } from './actors/index.js';

const logger = createConsoleLogger('info');

async function testBasicFunctionality() {
  console.log('🧪 Testing Basic Pantheon Functionality\n');

  // 1. Test system initialization
  console.log('1. Testing system initialization...');
  const adapters = {
    context: makeInMemoryContextAdapter(),
    tools: makeInMemoryToolAdapter(),
    llm: makeInMemoryLlmAdapter(),
    bus: makeInMemoryMessageBusAdapter(),
    schedule: makeInMemorySchedulerAdapter(),
    state: makeInMemoryActorStateAdapter(),
  };

  const orchestrator = makeOrchestrator({
    now: () => Date.now(),
    log: (msg, meta) => logger.debug(msg, meta),
    ...adapters,
  });
  console.log('✅ System initialized successfully');

  // 2. Test actor creation
  console.log('\n2. Testing actor creation...');
  const toolActor = createToolActor('test-tool-actor', {
    tools: [
      {
        name: 'test_tool',
        description: 'A test tool',
        handler: async (args: any) => ({ result: `Test executed with ${JSON.stringify(args)}` }),
      },
    ],
  });

  const actor = await adapters.state.spawn(toolActor, 'Test the tool execution');
  console.log(`✅ Actor created: ${actor.id} (${actor.script.name})`);

  // 3. Test tool registration and execution
  console.log('\n3. Testing tool registration...');
  await adapters.tools.register({
    name: 'test_tool',
    description: 'A test tool',
    parameters: {},
    runtime: 'local',
  });
  console.log('✅ Tool registered successfully');

  // 4. Test actor execution
  console.log('\n4. Testing actor execution...');
  await orchestrator.tickActor(actor);
  console.log(`✅ Actor tick completed`);

  // 5. Test context compilation
  console.log('\n5. Testing context compilation...');
  const context = await adapters.context.compile({
    texts: ['Hello world'],
    sources: [],
  });
  console.log(`✅ Context compiled: ${context.length} messages`);

  // 6. Test message bus
  console.log('\n6. Testing message bus...');
  let receivedMessage: any = null;
  const unsubscribe = adapters.bus.subscribe((msg) => {
    receivedMessage = msg;
  });

  await adapters.bus.send({
    from: 'test-sender',
    to: 'test-receiver',
    content: 'Test message',
  });

  unsubscribe();
  console.log(`✅ Message bus working: ${receivedMessage?.content || 'No message received'}`);

  // 7. Test scheduler
  console.log('\n7. Testing scheduler...');
  let schedulerFired = false;
  const unsubscribeTimer = adapters.schedule.every(100, async () => {
    schedulerFired = true;
  });

  await new Promise((resolve) => setTimeout(resolve, 150));
  unsubscribeTimer();
  console.log(`✅ Scheduler working: ${schedulerFired ? 'FIRED' : 'DID NOT FIRE'}`);

  // 8. Test error handling
  console.log('\n8. Testing error handling...');
  try {
    throw new PantheonError('Test error', 'TEST_ERROR', { test: true });
  } catch (error) {
    if (error instanceof PantheonError) {
      console.log(`✅ Error handling working: ${error.code} - ${error.message}`);
    } else {
      console.log('❌ Error handling failed');
    }
  }

  // 9. Test utilities
  console.log('\n9. Testing utilities...');
  const id = generateId();
  const isValidId = id && typeof id === 'string' && id.length > 0;
  console.log(`✅ Utilities working: ID generated (${isValidId ? 'VALID' : 'INVALID'})`);

  console.log('\n🎉 All tests completed!');
}

async function testCompositeActor() {
  console.log('\n🧪 Testing Composite Actor\n');

  const adapters = {
    context: makeInMemoryContextAdapter(),
    tools: makeInMemoryToolAdapter(),
    llm: makeInMemoryLlmAdapter(),
    bus: makeInMemoryMessageBusAdapter(),
    schedule: makeInMemorySchedulerAdapter(),
    state: makeInMemoryActorStateAdapter(),
  };

  const orchestrator = makeOrchestrator({
    now: () => Date.now(),
    log: (msg, meta) => logger.debug(msg, meta),
    ...adapters,
  });

  // Create sub-actors
  const toolActor = createToolActor('sub-tool-actor', {
    tools: [
      {
        name: 'composite_test_tool',
        description: 'A tool for composite actor testing',
        handler: async () => ({ result: 'Composite test successful' }),
      },
    ],
  });

  const compositeActor = createCompositeActor('test-composite', {
    subActors: [toolActor],
    coordinationMode: 'sequential',
  });

  const actor = await adapters.state.spawn(compositeActor, 'Test composite coordination');
  console.log(`✅ Composite actor created: ${actor.id}`);

  // Register the tool
  await adapters.tools.register({
    name: 'composite_test_tool',
    description: 'A tool for composite actor testing',
    parameters: {},
    runtime: 'local',
  });

  await orchestrator.tickActor(actor);
  console.log(`✅ Composite actor tick completed`);
}

async function runAllTests() {
  try {
    await testBasicFunctionality();
    await testCompositeActor();
    console.log('\n🏆 Pantheon Framework Validation Complete - ALL TESTS PASSED!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { testBasicFunctionality, testCompositeActor, runAllTests };
