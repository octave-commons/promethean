# Task: Verify Ollama Chat Handler Integration

## Summary
Ensure the new Ollama-backed chat completion handler interoperates with a live Ollama instance and produces OpenAI-compatible responses.

## Steps
1. Provision or reuse an Ollama runtime with the target model already pulled (e.g. `ollama pull llama3`).
2. Start the OpenAI-compliant server with the Ollama handler enabled. Create a short bootstrap script $for example `scripts/openai-server/start-ollama.mjs`$ that imports `createOpenAICompliantServer` and `createOllamaChatCompletionHandler`, then listens on `0.0.0.0:3000`. Run it after building the package:
   ```bash
   pnpm --filter @promethean/openai-server run build
   node scripts/openai-server/start-ollama.mjs
   ```
   > Pass `OLLAMA_BASE_URL` if the server is not on `http://127.0.0.1:11434`.
3. Send a chat completion request using `curl` or the dashboard and confirm the queue processes it successfully.
4. Capture the JSON response and verify it matches the OpenAI schema $id/object/choices/usage fields present$.
5. File a report with logs, model version, and sample response in the deployment notes folder.
