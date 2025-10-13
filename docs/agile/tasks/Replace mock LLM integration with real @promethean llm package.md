---
uuid: "31880e88-3d87-4d17-b739-8764165a93a4"
title: "Replace mock LLM integration with real @promethean/llm package"
slug: "Replace mock LLM integration with real @promethean llm package"
status: "incoming"
priority: "P1"
labels: ["llm", "integration", "package", "mock"]
created_at: "2025-10-13T05:00:38.078Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---













## Overview\n\nReplace the mock LLM integration in packages/kanban/src/lib/task-content/ai.ts with the real @promethean/llm package to enable actual AI-powered task analysis, rewriting, and breakdown functionality.\n\n## Current State\n\n- The TaskAIManager class uses mockLLMGenerate function (lines 19-95) that returns hardcoded responses\n- TODO comment on line 18 indicates this is temporary until dependency issues are resolved\n- System is configured to use qwen3:8b model via ollama at localhost:11434\n- The @promethean/llm package exists and has proper ollama integration\n\n## Technical Requirements\n\n### 1. Dependency Integration\n\n- Add @promethean/llm as a dependency to packages/kanban/package.json\n- Import and use the generate function from @promethean/llm\n- Configure the LLM driver to use ollama with qwen3:8b model\n\n### 2. Code Replacement\n\n- Replace mockLLMGenerate function with real LLM integration\n- Maintain the same interface and return types for compatibility\n- Ensure proper error handling and timeout management\n- Preserve existing prompt engineering and validation logic\n\n### 3. Configuration\n\n- Use existing environment variables: LLM_DRIVER=ollama, LLM_MODEL=qwen3:8b\n- Ensure proper timeout handling (current config: 60 seconds)\n- Maintain retry logic for failed requests\n\n### 4. Testing Requirements\n\n- Add unit tests for real LLM integration\n- Mock LLM responses in test environment\n- Test error scenarios (network failures, timeouts)\n- Validate response format and structure\n\n## Implementation Details\n\n### Key Files to Modify\n\n1. packages/kanban/package.json - Add dependency\n2. packages/kanban/src/lib/task-content/ai.ts - Replace mock integration\n3. packages/kanban/src/lib/task-content/tests/ai.test.ts - Add tests (create if needed)\n\n### Integration Approach\n\n- Use @promethean/llm generate function with proper prompt formatting\n- Leverage existing buildAnalysisPrompt, buildRewritePrompt, buildBreakdownPrompt methods\n- Maintain JSON response parsing and validation\n- Preserve existing error handling patterns\n\n### Configuration Management\n\n- Respect existing TaskAIManagerConfig interface\n- Use environment variables for LLM configuration\n- Ensure backward compatibility with existing config options\n\n## Acceptance Criteria\n\n1. **Functional Integration**\n\n   - [ ] @promethean/llm dependency added and working\n   - [ ] All three AI methods (analyzeTask, rewriteTask, breakdownTask) use real LLM\n   - [ ] Responses are properly parsed and validated\n   - [ ] Error handling works for network failures and timeouts\n\n2. **Configuration**\n\n   - [ ] Uses ollama driver with qwen3:8b model by default\n   - [ ] Respects environment variables for configuration\n   - [ ] Maintains existing TaskAIManagerConfig interface\n\n3. **Testing**\n\n   - [ ] Unit tests added for LLM integration\n   - [ ] Mock responses work in test environment\n   - [ ] Error scenarios properly tested\n   - [ ] All existing tests continue to pass\n\n4. **Performance & Reliability**\n\n   - [ ] Requests timeout appropriately (60 seconds)\n   - [ ] Retry logic handles transient failures\n   - [ ] Memory usage remains reasonable\n   - [ ] No regression in existing functionality\n\n5. **Documentation**\n   - [ ] Code comments updated to reflect real integration\n   - [ ] TODO comment removed\n   - [ ] Any new configuration options documented\n\n## Dependencies & Prerequisites\n\n- @promethean/llm package must be built and available\n- Ollama service running with qwen3:8b model pulled\n- Network access to localhost:11434 for ollama\n- Proper environment variables set\n\n## Risks & Considerations\n\n1. **Network Dependencies**: Real LLM calls require ollama service availability\n2. **Response Variability**: Real LLM responses may differ from mock expectations\n3. **Performance**: Real LLM calls will be slower than mock responses\n4. **Error Handling**: Need robust handling of network failures and malformed responses\n5. **Testing**: Tests must mock LLM responses to avoid external dependencies\n\n## Success Metrics\n\n- All AI functionality works with real LLM responses\n- Response times are reasonable (< 30 seconds for most operations)\n- Error rate is low (< 5% for normal operations)\n- Test coverage remains above 80%\n- No regression in existing kanban functionality












